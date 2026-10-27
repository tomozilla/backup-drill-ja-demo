#!/usr/bin/env bash
# Supabase CLIで、1つのスキーマの手動バックアップ（無料プロジェクトのバックアップの方法）。
# 事前に `supabase login` と `supabase link --project-ref <ref>` を一度。DBのパスワードは聞かれません。
set -euo pipefail
SCHEMA="${1:-public}"
OUT="backup/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"
supabase db dump --schema "$SCHEMA" -f "$OUT/schema.sql"
supabase db dump --schema "$SCHEMA" --data-only -f "$OUT/data.sql"
echo "wrote $OUT (schema.sql, data.sql). このPC以外の場所にも、コピーを保管してください。"
