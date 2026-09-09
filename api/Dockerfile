# Build roda no contexto da raiz do monorepo (ver docker-compose.yml):
#   docker build -f api/Dockerfile .
FROM node:22-bookworm-slim AS build
# Sem openssl, `prisma generate` não detecta a versão da libssl e "chuta" um
# engine binary errado (aviso: "Defaulting to openssl-1.1.x") — que depois
# falha silenciosamente em runtime se a versão real for outra.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY api/package.json api/
RUN npm ci
COPY packages/shared packages/shared
COPY api api
RUN npm run build --workspace=@studio/shared \
 && npm run build --workspace=@studio/api

FROM node:22-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /repo

COPY --from=build /repo/node_modules node_modules
COPY --from=build /repo/packages/shared/dist packages/shared/dist
COPY --from=build /repo/packages/shared/package.json packages/shared/package.json
COPY --from=build /repo/api/dist api/dist
COPY --from=build /repo/api/package.json api/package.json
COPY --from=build /repo/api/prisma api/prisma

EXPOSE 8080
WORKDIR /repo/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
