# Backend only — server.js, the F1 feed client, and SQLite persistence.
# The frontend is a separate static deploy (Vercel); see DEPLOYMENT.md for
# the full two-part setup.
#
# Node 22+ required: better-sqlite3@13 declares "engines": { "node": ">=22" }
# and its native addon segfaults (exit 139) at startup on Node 20 — the ABI
# it's built against doesn't match. Keep this at 22+ if better-sqlite3 is
# ever upgraded further, check its engines field again.

FROM node:22-slim AS build
WORKDIR /app
# better-sqlite3 compiles a native addon on install
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
# Frontend/dev-only files aren't needed in the runtime image
RUN rm -rf frontend

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
