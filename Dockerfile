# ── deps: install all dependencies (cached unless lockfile changes) ──
FROM node:25-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── dev: full source — used by coverage / vitest ──
FROM deps AS dev
COPY . .
# Run as non-root to prevent root-owned files leaking to bind-mounts.
# node:alpine ships with a "node" user (uid 1000) already.
RUN chown -R node:node /app
USER node

# ── build: compile production assets ──
FROM dev AS build
RUN pnpm build

# ── production: lightweight static server ──
FROM nginx:stable-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
