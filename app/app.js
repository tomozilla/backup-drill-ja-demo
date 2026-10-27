// Backup check: paste facts about your projects, see the worst-case data loss and what is missing.
const $ = (id) => document.getElementById(id);
let rules = null;
let rows = [];
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function load(text) {
  $("msg").innerHTML = "";
  if (!text.trim()) { rows = []; render(); return; }
  try {
    const r = BackupCheck.parse(text);
    rows = r.rows;
    if (r.skipped.length) $("msg").innerHTML = `<div class="msg">Skipped ${r.skipped.length} row(s): ${esc(r.skipped.join("; "))}</div>`;
  } catch (e) {
    rows = [];
    $("msg").innerHTML = `<div class="msg err">${esc(e.message)}</div>`;
  }
  render();
}

function render() {
  if (!rules || !rows.length) { $("board").innerHTML = ""; return; }
  const res = BackupCheck.check(rows, rules, new Date());
  const count = (l) => res.filter((r) => r.level === l).length;
  const pc = BackupCheck.pitrCost(res, rules);
  let html = `<div class="tot"><div class="box">Projects<b>${res.length}</b></div>` +
    `<div class="box">Problems<b>${count("bad")}</b>fix first</div>` +
    `<div class="box">Warnings<b>${count("warn")}</b>look at these</div>` +
    `<div class="box">PITR add-ons<b>$${pc.total}/mo</b>${pc.projects} project(s), add-on only</div></div>`;
  html += res.map((r) => `<section class="card"><div class="row"><span class="name">${esc(r.name)}</span><span class="chip">${esc(r.plan)}${r.pitr ? " + PITR" : ""}</span><span class="chip ${r.level}">${r.level === "ok" ? "OK" : r.level === "warn" ? "warning" : "problem"}</span><span>Worst case: <b>${esc(r.worstCase.label)}</b></span></div>` +
    (r.issues.length ? `<ul>${r.issues.map((i) => `<li class="${i.level}">${esc(i.text)}</li>`).join("")}</ul>` : "") + `</section>`).join("");
  $("board").innerHTML = html;
}

async function init() {
  try {
    const res = await fetch("rules.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    rules = await res.json();
  } catch (e) {
    $("banner").innerHTML = `<div class="msg err">Could not load rules.json (${esc(e.message)}). Open this page through a local web server.</div>`;
    return;
  }
  if ((Date.now() - new Date(rules.asOf)) / 86400000 > 45) $("banner").innerHTML = `<div class="msg">The rules are from ${esc(rules.asOf)} and may be out of date: check the docs and update rules.json.</div>`;
  $("foot").textContent = `Rules as of ${rules.asOf} (${rules.source}). Worst case means: if something went wrong right now, how far back would you be. It is not a promise. PITR cost is the add-on only: a compute upgrade (PITR needs at least Small) is extra.`;
  $("input").addEventListener("input", () => load($("input").value));
  $("clear").addEventListener("click", () => { $("input").value = ""; load(""); });
  $("load-sample").addEventListener("click", async () => {
    try {
      const r = await fetch("../sample/projects.sample.json");
      if (!r.ok) throw new Error("HTTP " + r.status);
      $("input").value = await r.text();
      load($("input").value);
    } catch (e) { $("msg").innerHTML = `<div class="msg err">Could not load the sample (${esc(e.message)}). Serve the repository root, not the app folder.</div>`; }
  });
  render();
}
init();
