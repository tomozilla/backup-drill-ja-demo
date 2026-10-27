// バックアップ点検：プロジェクトの事実を貼ると、最悪ケースと足りないものが出る。
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
    if (r.skipped.length) $("msg").innerHTML = `<div class="msg">${r.skipped.length}行を飛ばしました：${esc(r.skipped.join("; "))}</div>`;
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
  let html = `<div class="tot"><div class="box">プロジェクト<b>${res.length}</b></div>` +
    `<div class="box">問題<b>${count("bad")}</b>先に直す</div>` +
    `<div class="box">警告<b>${count("warn")}</b>確認する</div>` +
    `<div class="box">PITRアドオン<b>$${pc.total}/月</b>${pc.projects}件・アドオンのみ</div></div>`;
  html += res.map((r) => `<section class="card"><div class="row"><span class="name">${esc(r.name)}</span><span class="chip">${esc(r.plan)}${r.pitr ? " + PITR" : ""}</span><span class="chip ${r.level}">${r.level === "ok" ? "OK" : r.level === "warn" ? "警告" : "問題"}</span><span>最悪ケース：<b>${esc(r.worstCase.label)}</b></span></div>` +
    (r.issues.length ? `<ul>${r.issues.map((i) => `<li class="${i.level}">${esc(i.text)}</li>`).join("")}</ul>` : "") + `</section>`).join("");
  $("board").innerHTML = html;
}

async function init() {
  try {
    const res = await fetch("rules.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    rules = await res.json();
  } catch (e) {
    $("banner").innerHTML = `<div class="msg err">rules.json を読み込めません（${esc(e.message)}）。ローカルのWebサーバー経由で開いてください。</div>`;
    return;
  }
  if ((Date.now() - new Date(rules.asOf)) / 86400000 > 45) $("banner").innerHTML = `<div class="msg">ルールは ${esc(rules.asOf)} 時点です。古い可能性があります。ドキュメントを確認して rules.json を更新してください。</div>`;
  $("foot").textContent = `ルールの時点：${rules.asOf}（${rules.source}）。最悪ケースは「いま何か起きたら、どこまで戻るか」で、約束ではありません。PITRの費用はアドオンのみで、Computeの引き上げ（PITRは最低Small）は含みません。`;
  $("input").addEventListener("input", () => load($("input").value));
  $("clear").addEventListener("click", () => { $("input").value = ""; load(""); });
  $("load-sample").addEventListener("click", async () => {
    try {
      const r = await fetch("../sample/projects.sample.json");
      if (!r.ok) throw new Error("HTTP " + r.status);
      $("input").value = await r.text();
      load($("input").value);
    } catch (e) { $("msg").innerHTML = `<div class="msg err">サンプルを読み込めません（${esc(e.message)}）。appフォルダではなく、リポジトリのルートで配信してください。</div>`; }
  });
  render();
}
init();
