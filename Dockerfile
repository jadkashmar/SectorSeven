# Backend only — server.js, the F1 feed client, and SQLite persistence.
# The frontend is a separate static deploy (Cloudflare Pages); see
# DEPLOYMENT.md for the full two-part setup.

FROM node:20-slim AS build
WORKDIR /app
# better-sqlite3 compiles a native addon on install
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
# Frontend/dev-only files aren't needed in the runtime image
RUN rm -rf frontend

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
