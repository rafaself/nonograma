FROM node:22-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile=false

COPY . .

EXPOSE 4173

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "4173"]
