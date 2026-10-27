# backup-drill-ja-demo

[English](README.md) | 日本語

Supabaseのバックアップについての、小さな学習用デモです。無料プロジェクトでできる**戻す練習**（CLIで控えを取る → うっかり全部消す → 戻す → 数える）と、入力した事実から**最悪ケース**を出す静的な**バックアップ点検ページ**。

> **個人の学習記録・非公式です。** どの会社の公式ツールでもありません。ルール（最悪ケース・PITRの条件）は、2026-10-27 にドキュメントと料金ページを私が読んで整理したものです。ページはどのプロジェクトにも接続しません。

Qiitaの2本の記事のコードです：手順編（バックアップの3種類と練習）と、点検ページをつくったWebアプリ編。

英語版が基本で、日本語コメント・UIのコピーは [`ja/`](ja/) にあります。

## ファイル

| ファイル | 内容 |
|---|---|
| `sql/01_demo_data.sql`, `02_accident.sql`, `03_check.sql`, `99_cleanup.sql` | 練習：スキーマ `backup_demo` の架空の注文、事故（WHEREなしのDELETE）、件数の確認、後片付け |
| `scripts/backup.sh` | `supabase db dump`（スキーマとデータ） |
| `sample/schema.sample.sql`, `sample/data.sample.sql` | 私の実行で作られたdumpファイル（架空のデータのみ） |
| `sample/projects.sample.json` | 点検ページ用の架空のプロジェクト |
| `app/check.js` | 判定（最悪ケース・問題・PITRアドオンの費用） |
| `app/rules.json` | 日付つきのルール。**手で更新** |
| `app/index.html`, `app/app.js` | 点検ページ |
| `app/test.js`, `app/package.json` | 18項目のテスト |
| `ja/` | 日本語版 |

## 費用

- 練習も点検ページも、無料プロジェクトなら無料です。
- ページの数字は、2026-10-27 のドキュメントと料金ページ：日次バックアップは有料プランに含まれる（Pro 7日・Team 14日）。PITRのアドオンは保持7/14/28日で月 約$100/$200/$400。PITRには最低Small compute（Micro $10 → Small $15）が必要。請求書では確かめていません。ページに出る費用はPITRのアドオン分だけです。

## 練習のやり方

```bash
# 最初に一度：supabase login && supabase link --project-ref <自分のref>（DBパスワードは打ちません）
# 1. SQLエディタで sql/01_demo_data.sql、続けて sql/03_check.sql（5件・1004.00）
scripts/backup.sh backup_demo
# 2. SQLエディタで sql/02_accident.sql、続けて sql/03_check.sql（0件）
# 3. SQLエディタに backup/<日時>/data.sql を貼って実行、続けて sql/03_check.sql（5件・1004.00）
# 4. 後片付け：sql/99_cleanup.sql
```

行が残っている表にdata.sqlを流すと、IDの重複でエラーになります。空の表に戻してください。

## 点検ページの動かし方

```bash
# リポジトリのルートで（サンプルは ../sample/ を読む）
python3 -m http.server 8000
# http://localhost:8000/ja/app/ （英語版は /app/）を開く
node app/test.js
```

## 安全のために

- **練習は、捨てて構わないプロジェクトで。** 事故のSQLが消すのは、`backup_demo.orders` の全行だけです。
- dumpファイルには**自分のデータ**が入ります。実物はGitに入れず、PC以外の場所に保管してください。
- `backup_demo.orders` は、RLS有効・ポリシーなしです。

## 確認したこと（2026-10-27）／していないこと

- 確認（無料プロジェクト）：CLIのdump（IPv4プーラーへ自動で切り替わった）、事故、SQLエディタでdataを流し直す復元（件数・合計が 5件・1004.00 に戻った）、`node app/test.js` とクリーンなコピーでのページ。
- 未確認：ダッシュボードのRestore、PITR（有効化と復元）、Restore to new project、Storageのファイル、Authユーザー、役割とそのパスワード、大きなデータベース。

## ライセンス

MIT（`LICENSE`）。
