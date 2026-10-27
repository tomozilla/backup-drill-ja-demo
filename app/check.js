// Pure logic for the backup check page (no DOM).
// For each project: how much data could I lose in the worst case, and what is missing?
(function (root) {
  const DAY = 86400000;
  // whole days: 7 days and 3 hours counts as 7, so "older than 7 days" doesn't trip on the time of day
  const days = (from, now) => Math.floor((new Date(now) - new Date(from)) / DAY);

  function parse(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error("Not valid JSON: " + e.message); }
    const list = Array.isArray(data) ? data : data && data.projects;
    if (!Array.isArray(list)) throw new Error('Expected {"projects":[...]} or an array');
    const skipped = [];
    const rows = list.filter((p, i) => {
      const ok = p && p.name && ["free", "pro", "team"].includes(p.plan);
      if (!ok) skipped.push(`#${i + 1}: needs a name and plan "free", "pro" or "team"`);
      return ok;
    });
    return { rows, skipped };
  }

  // Worst case: how far back would I be if something went wrong right now?
  function worstCase(p, rules, now) {
    if (p.plan !== "free" && p.pitr) return { label: `about ${rules.pitr.worstCaseMinutes} minutes`, hours: rules.pitr.worstCaseMinutes / 60 };
    if (p.plan !== "free") return { label: "up to 24 hours (daily backups)", hours: 24 };
    if (!p.lastDumpAt) return { label: "everything (no backup at all)", hours: Infinity };
    const d = days(p.lastDumpAt, now);
    return { label: `${d} days (since the last manual dump)`, hours: d * 24 };
  }

  function check(rows, rules, now) {
    return rows.map((p) => {
      const issues = [];   // {level: "bad"|"warn"|"info", text}
      const add = (level, text) => issues.push({ level, text });
      const order = rules.computeOrder;
      if (p.plan === "free") {
        if (!p.lastDumpAt) add("bad", "Free has no automatic backups and there is no manual dump");
        else if (days(p.lastDumpAt, now) > rules.limits.freeDumpWarnDays) add("warn", `last manual dump is ${days(p.lastDumpAt, now)} days old`);
        if (p.pitr) add("bad", "PITR is not available on Free");
      }
      if (p.plan !== "free" && p.pitr) {
        if (order.indexOf(p.compute || "micro") < order.indexOf(rules.pitr.minCompute)) add("bad", `PITR needs at least ${rules.pitr.minCompute} compute (this project: ${p.compute || "micro"})`);
        if (rules.pitr.stopsDailyBackups) add("info", "with PITR on, daily backups are no longer taken");
      }
      if (p.plan !== "free") {
        if (!p.lastRestoreTestAt) add("warn", "no restore test on record");
        else if (days(p.lastRestoreTestAt, now) > rules.limits.restoreTestWarnDays) add("warn", `last restore test is ${days(p.lastRestoreTestAt, now)} days old`);
      } else if (!p.lastRestoreTestAt && p.lastDumpAt) add("warn", "dump exists but a restore from it was never tested");
      if (p.hasStorageFiles && !p.filesBackedUp) add("warn", "database backups do not include Storage files, and no separate file backup is recorded");
      const wc = worstCase(p, rules, now);
      const level = issues.some((i) => i.level === "bad") ? "bad" : issues.some((i) => i.level === "warn") ? "warn" : "ok";
      return Object.assign({}, p, { worstCase: wc, issues, level });
    });
  }

  // Extra monthly cost of PITR for the paid projects that use it (add-on only; compute upgrades are not included).
  function pitrCost(rows, rules) {
    let total = 0, n = 0;
    for (const p of rows) {
      if (p.plan !== "free" && p.pitr) { total += rules.pitr.usdPerMonth[String(p.pitrDays || 7)] || 0; n++; }
    }
    return { total, projects: n };
  }

  const api = { parse, check, pitrCost, worstCase };
  if (typeof module !== "undefined") module.exports = api; else root.BackupCheck = api;
})(this);
