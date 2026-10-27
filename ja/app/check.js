// バックアップ点検ページの計算だけのファイル（画面に依存しない）。
// プロジェクトごとに、最悪どれだけ失うか、何が足りないかを出す。
(function (root) {
  const DAY = 86400000;
  // whole days: 7 days and 3 hours counts as 7, so "older than 7 days" doesn't trip on the time of day
  const days = (from, now) => Math.floor((new Date(now) - new Date(from)) / DAY);

  function parse(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { throw new Error("JSONとして読めません：" + e.message); }
    const list = Array.isArray(data) ? data : data && data.projects;
    if (!Array.isArray(list)) throw new Error('{"projects":[...]} か配列が必要です');
    const skipped = [];
    const rows = list.filter((p, i) => {
      const ok = p && p.name && ["free", "pro", "team"].includes(p.plan);
      if (!ok) skipped.push(`#${i + 1}: name と、plan（"free"・"pro"・"team"）が必要です`);
      return ok;
    });
    return { rows, skipped };
  }

  // Worst case: how far back would I be if something went wrong right now?
  function worstCase(p, rules, now) {
    if (p.plan !== "free" && p.pitr) return { label: `約${rules.pitr.worstCaseMinutes}分`, hours: rules.pitr.worstCaseMinutes / 60 };
    if (p.plan !== "free") return { label: "最大24時間（毎日のバックアップ）", hours: 24 };
    if (!p.lastDumpAt) return { label: "全部（バックアップなし）", hours: Infinity };
    const d = days(p.lastDumpAt, now);
    return { label: `${d}日（最後の手動dumpから）`, hours: d * 24 };
  }

  function check(rows, rules, now) {
    return rows.map((p) => {
      const issues = [];   // {level: "bad"|"warn"|"info", text}
      const add = (level, text) => issues.push({ level, text });
      const order = rules.computeOrder;
      if (p.plan === "free") {
        if (!p.lastDumpAt) add("bad", "Freeには自動バックアップがなく、手動のdumpもない");
        else if (days(p.lastDumpAt, now) > rules.limits.freeDumpWarnDays) add("warn", `最後の手動dumpは${days(p.lastDumpAt, now)}日前`);
        if (p.pitr) add("bad", "PITRはFreeでは使えない");
      }
      if (p.plan !== "free" && p.pitr) {
        if (order.indexOf(p.compute || "micro") < order.indexOf(rules.pitr.minCompute)) add("bad", `PITRには最低${rules.pitr.minCompute}のComputeが必要（このプロジェクト：${p.compute || "micro"}）`);
        if (rules.pitr.stopsDailyBackups) add("info", "PITRを有効にすると、毎日のバックアップは取られなくなる");
      }
      if (p.plan !== "free") {
        if (!p.lastRestoreTestAt) add("warn", "戻す練習の記録がない");
        else if (days(p.lastRestoreTestAt, now) > rules.limits.restoreTestWarnDays) add("warn", `最後の戻す練習は${days(p.lastRestoreTestAt, now)}日前`);
      } else if (!p.lastRestoreTestAt && p.lastDumpAt) add("warn", "dumpはあるが、それから戻す練習をしていない");
      if (p.hasStorageFiles && !p.filesBackedUp) add("warn", "データベースのバックアップにはStorageのファイルが入らず、別のファイルの控えも記録がない");
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
