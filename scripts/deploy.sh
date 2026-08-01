#!/usr/bin/env bash
#
# scripts/deploy.sh — Pipeline de déploiement automatisé Solideat
# Usage: ./scripts/deploy.sh [dev|prod]
# Par défaut: dev (preview Vercel + Railway non-prod si disponible)
#
set -euo pipefail

ENVIRONMENT="${1:-dev}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"
HEALTH_URL="https://api.solid-eat.com/health"
FRONT_URL="https://solid-eat.com"

VERCEL_PROJECT_ID="prj_QPBgoDOlMaGlXQ5gnT02tvauaJJB"
VERCEL_TEAM_ID="team_2TiT1AA6anAkAK8mgnDthhah"

echo "🚀 Solideat deploy pipeline — environment=$ENVIRONMENT"
echo "============================================"

# ---------------------------------------------------------------------------
# 1. Préparation
# ---------------------------------------------------------------------------
cd "$REPO_DIR"
git fetch --all --quiet
git pull --ff-only origin dev/local-work

# ---------------------------------------------------------------------------
# 2. Tests backend
# ---------------------------------------------------------------------------
echo "🧪 Running backend tests..."
cd "$BACKEND_DIR"
npm test -- --runInBand --forceExit --silent

# ---------------------------------------------------------------------------
# 3. Build backend + frontend
# ---------------------------------------------------------------------------
echo "🔨 Building backend..."
npm run build

echo "🔨 Building frontend..."
cd "$FRONTEND_DIR"
npm run build

# ---------------------------------------------------------------------------
# 4. Snapshot du commit courant (pour rollback)
# ---------------------------------------------------------------------------
cd "$REPO_DIR"
PREVIOUS_COMMIT="$(git rev-parse HEAD)"
echo "📌 Previous commit (rollback target): $PREVIOUS_COMMIT"

# ---------------------------------------------------------------------------
# 5. Push sur dev/local-work
# ---------------------------------------------------------------------------
echo "📤 Pushing dev/local-work..."
git push origin dev/local-work

# ---------------------------------------------------------------------------
# 6. Déploiement Vercel (frontend)
# ---------------------------------------------------------------------------
echo "🌐 Deploying frontend to Vercel..."
if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "⚠️ VERCEL_TOKEN not set. Skipping Vercel deploy."
else
  cd "$FRONTEND_DIR"
  vercel --token "$VERCEL_TOKEN" \
    --scope "$VERCEL_TEAM_ID" \
    --project "$VERCEL_PROJECT_ID" \
    ${ENVIRONMENT:+--${ENVIRONMENT}} \
    --yes
fi

# ---------------------------------------------------------------------------
# 7. Déploiement Railway (backend)
# ---------------------------------------------------------------------------
echo "🚂 Deploying backend to Railway..."
if [ -z "${RAILWAY_TOKEN:-}" ]; then
  echo "⚠️ RAILWAY_TOKEN not set. Skipping Railway deploy."
else
  curl -fsS -X POST https://backboard.railway.app/graphql/v2 \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"mutation { serviceInstanceDeploy(environmentId: \\\"b1db6cb7-4160-4836-bca8-49252a1aa7e3\\\", serviceId: \\\"57da90ea-9f5d-475d-826c-becf610e8d27\\\", commitSha: \\\"$(git rev-parse HEAD)\\\") } \"}" \
    > /dev/null
  echo "✅ Railway deployment triggered"
fi

# ---------------------------------------------------------------------------
# 8. Healthcheck (attendre propagation)
# ---------------------------------------------------------------------------
echo "⏳ Waiting for healthchecks..."
for i in {1..12}; do
  sleep 5
  if curl -fsS "$HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ Backend healthcheck OK"
    break
  fi
  if [ "$i" -eq 12 ]; then
    echo "❌ Backend healthcheck failed after 60s"
    exit 1
  fi
done

for i in {1..12}; do
  sleep 5
  if curl -fsS "$FRONT_URL" > /dev/null 2>&1; then
    echo "✅ Frontend healthcheck OK"
    break
  fi
  if [ "$i" -eq 12 ]; then
    echo "❌ Frontend healthcheck failed after 60s"
    exit 1
  fi
done

# ---------------------------------------------------------------------------
# 8. Tests de fumée API
# ---------------------------------------------------------------------------
echo "🔎 Running smoke tests..."
curl -fsS "$HEALTH_URL" | head -c 200
echo

echo ""
echo "✅ Deploy pipeline completed successfully."
echo "Rollback target: git revert $PREVIOUS_COMMIT"
echo "============================================"
