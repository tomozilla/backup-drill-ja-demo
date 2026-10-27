#!/usr/bin/env bash
# Manual logical backup of ONE schema with the Supabase CLI (the way to back up a Free project).
# Needs: `supabase login` and `supabase link --project-ref <ref>` done once. Nothing here asks for the database password.
set -euo pipefail
SCHEMA="${1:-public}"
OUT="backup/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"
supabase db dump --schema "$SCHEMA" -f "$OUT/schema.sql"
supabase db dump --schema "$SCHEMA" --data-only -f "$OUT/data.sql"
echo "wrote $OUT (schema.sql, data.sql). Store a copy somewhere other than this machine."
