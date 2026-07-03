#!/usr/bin/env bash
set -euo pipefail

echo "→ prisma generate"
npx prisma generate

if [[ -z "${DATABASE_URL:-}" && -z "${DIRECT_URL:-}" ]]; then
  echo "ERROR: Set DATABASE_URL (or DIRECT_URL) in Vercel environment variables."
  exit 1
fi

echo "→ prisma db push"
npx prisma db push

echo "→ next build"
npm run build
