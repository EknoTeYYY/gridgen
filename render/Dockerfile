# Build roda no contexto da raiz do monorepo (ver deploy/docker-compose.yml):
#   docker build -f render/Dockerfile .
FROM node:22-bookworm-slim AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY render/package.json render/
RUN npm ci
COPY packages/shared packages/shared
COPY render render
RUN npm run build --workspace=@studio/shared \
 && npm run build --workspace=@studio/render

FROM node:22-bookworm-slim AS runtime
# Alpine (musl) tem histórico de instabilidade com Chrome headless — Debian é
# o runtime recomendado pelo próprio Puppeteer.
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
    && rm -rf /var/lib/apt/lists/*
ENV CHROME=/usr/bin/chromium
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=build /repo/node_modules node_modules
COPY --from=build /repo/packages/shared/dist packages/shared/dist
COPY --from=build /repo/packages/shared/package.json packages/shared/package.json
COPY --from=build /repo/render/dist render/dist
COPY --from=build /repo/render/package.json render/package.json
COPY render/assets render/assets

WORKDIR /repo/render
CMD ["node", "dist/worker.js"]
