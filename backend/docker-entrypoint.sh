#!/bin/sh
set -e

# Ensure data directories exist with correct ownership
mkdir -p /app/.tmp /app/public/uploads

# Start Strapi in background
npm run start &
STRAPI_PID=$!

echo "[entrypoint] Waiting for Strapi to become healthy..."
MAX_ATTEMPTS=30
ATTEMPT=0
until wget -qO- http://localhost:1337/_health > /dev/null 2>&1; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "[entrypoint] Strapi did not start in time — aborting seed"
    wait $STRAPI_PID
    exit 1
  fi
  echo "[entrypoint] Attempt $ATTEMPT/$MAX_ATTEMPTS — not ready yet..."
  sleep 3
done

echo "[entrypoint] Strapi is healthy — running seed script..."
node scripts/seed.js && echo "[entrypoint] Seed complete" || echo "[entrypoint] Seed failed (non-fatal)"

# Hand off to Strapi process
wait $STRAPI_PID
