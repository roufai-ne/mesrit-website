# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Install dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# native add-ons needed by better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Build (strapi build generates the admin bundle)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — Runner
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache python3 make g++

ENV NODE_ENV=production

# Non-root user
RUN addgroup --system --gid 1001 strapi \
 && adduser  --system --uid 1001 strapi

# Copy built artefacts
COPY --from=builder --chown=strapi:strapi /app/package.json ./
COPY --from=builder --chown=strapi:strapi /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/dist         ./dist
COPY --from=builder --chown=strapi:strapi /app/build        ./build
COPY --from=builder --chown=strapi:strapi /app/src          ./src
COPY --from=builder --chown=strapi:strapi /app/config       ./config
COPY --from=builder --chown=strapi:strapi /app/public       ./public
COPY --from=builder --chown=strapi:strapi /app/scripts      ./scripts

# Persistent volume for SQLite DB + uploads
VOLUME ["/app/.tmp", "/app/public/uploads"]

COPY --chown=strapi:strapi docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER strapi

EXPOSE 1337

ENTRYPOINT ["/app/docker-entrypoint.sh"]
