FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@11.0.0 --activate
COPY . .
RUN pnpm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.mjs"]
