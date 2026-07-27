#!/usr/bin/env bash
#
# scripts/healthcheck.sh — Vérifie que Solid'Eat est accessible en prod/prévisualisation
#
set -euo pipefail

FRONTEND_URL="${FRONTEND_URL:-https://solid-eat.com}"
BACKEND_URL="${BACKEND_URL:-https://api.solid-eat.com}"

echo "🩺 Healthcheck Solideat"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"

fe_code=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
be_code=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")

if [ "$fe_code" = "200" ]; then
  echo "✅ Frontend OK (HTTP 200)"
else
  echo "❌ Frontend DOWN (HTTP $fe_code)"
  exit 1
fi

if [ "$be_code" = "200" ]; then
  echo "✅ Backend OK (HTTP 200)"
else
  echo "❌ Backend DOWN (HTTP $be_code)"
  exit 1
fi

echo "🎉 Tous les services sont en ligne"
