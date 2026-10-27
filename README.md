# backup-drill-ja-demo

English | [日本語](README.ja.md)

A small learning demo about Supabase backups: a **restore drill** you can run on a Free project (take a copy with the CLI, delete everything by accident, restore, count) and a static **backup check page** that works out the worst-case data loss per project from facts you enter.

> **A personal learning project.** Not an official tool of any company. The rules (worst case, PITR conditions) are my reading of the docs and pricing page on 2026-10-27. The page never connects to a project.

This is the code for two Japanese articles on Qiita: a how-to (the three kinds of backup and the drill) and a web-app article about the check page.

Page/UI texts and comments are English. Japanese copies (Japanese comments and UI) are in [`ja/`](ja/).

## Files

| File | What it is |
|---|---|
| `sql/01_demo_data.sql`, `sql/02_accident.sql`, `sql/03_check.sql`, `sql/99_cleanup.sql` | The drill: fake orders in schema `backup_demo`, the accident (a DELETE without WHERE), a count query, cleanup |
| `scripts/backup.sh` | `supabase db dump` of one schema (schema + data) |
| `sample/schema.sample.sql`, `sample/data.sample.sql` | The dump files my run produced (fake data only) |
| `sample/projects.sample.json` | Fictional projects for the check page |
| `app/check.js` | Pure logic: worst case, issues, PITR add-on cost |
| `app/rules.json` | Dated rules. **Update by hand** |
| `app/index.html`, `app/app.js` | The check page |
| `app/test.js`, `app/package.json` | 18 checks (`node app/test.js`) |
| `ja/` | The same with Japanese comments and UI |

## Cost

- The drill and the page cost nothing on a Free project.
- Numbers on the page come from the docs and the pricing page on 2026-10-27: daily backups are included in paid plans (7 days Pro, 14 days Team); PITR add-on about $100 / $200 / $400 per month for 7 / 14 / 28 days of retention; PITR needs at least the Small compute add-on ($15 vs $10 for Micro). Not checked against an invoice. The page shows the PITR add-on cost only.

## Run the drill

```bash
# once: supabase login && supabase link --project-ref <your-ref>   (no database password is typed)
# 1. SQL editor: run sql/01_demo_data.sql, then sql/03_check.sql  (5 rows, 1004.00)
scripts/backup.sh backup_demo
# 2. SQL editor: run sql/02_accident.sql, then sql/03_check.sql    (0 rows)
# 3. SQL editor: paste backup/<timestamp>/data.sql and run it, then sql/03_check.sql  (5 rows, 1004.00)
# 4. cleanup: sql/99_cleanup.sql
```

Replaying `data.sql` into a table that still has rows fails on duplicate ids. Restore into an empty table.

## Run the check page

```bash
# from the repository root (the sample button reads ../sample/)
python3 -m http.server 8000
# open http://localhost:8000/app/
node app/test.js
```

## Safety notes

- **Use a throwaway project for the drill.** The accident script deletes every row of `backup_demo.orders` only.
- Dump files contain your data: keep real ones out of Git and store them off the machine.
- `backup_demo.orders` has RLS enabled and no policy.

## What was verified (2026-10-27) and what was not

- Verified on a Free project: the CLI dump (it fell back to the IPv4 pooler by itself), the accident, the restore by replaying the data dump in the SQL editor (rows and total back to 5 and 1004.00), and `node app/test.js` plus the page in a clean copy.
- Not verified: the dashboard Restore, PITR (enabling or restoring), Restore to new project, Storage files, Auth users, roles and their passwords, large databases.

## License

MIT (see `LICENSE`).
