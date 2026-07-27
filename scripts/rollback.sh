#!/usr/bin/env bash
#
# scripts/rollback.sh — Rollback rapide Solideat
# Usage: ./scripts/rollback.sh <commit-sha-or-tag>
#
set -euo pipefail

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Usage: ./scripts/rollback.sh <commit-sha-or-tag>"
  echo "Exemple: ./scripts/rollback.sh HEAD~1"
  exit 1
fi

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "⚠️ Rolling back dev/local-work to $TARGET..."
git checkout dev/local-work
git pull --ff-only origin dev/local-work
git reset --hard "$TARGET"
git push origin dev/local-work --force-with-lease

echo "🌐 Rolling back Vercel deploy..."
if [ -n "${VERCEL_TOKEN:-}" ] && [ -n "${VERCEL_DEPLOYMENT_ID:-}" ]; then
  vercel --token "$VERCEL_TOKEN" rollback "$VERCEL_DEPLOYMENT_ID" --yes || true
fi

echo "✅ Rollback completed."
echo "Verify: https://solid-eat.com + https://api.solid-eat.com/health"
