# Build roda no contexto da raiz do monorepo (ver docker-compose.yml):
#   docker build -f web/Dockerfile .
FROM node:22-bookworm-slim AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY web/package.json web/
RUN npm ci
COPY packages/shared packages/shared
COPY web web
RUN npm run build --workspace=@studio/shared \
 && npm run build --workspace=@studio/web

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# output:'standalone' traça as dependências reais e replica a estrutura do
# workspace — o server final fica em ./web/server.js, não na raiz.
COPY --from=build /repo/web/.next/standalone ./
COPY --from=build /repo/web/.next/static ./web/.next/static
COPY --from=build /repo/web/public ./web/public

EXPOSE 3000
CMD ["node", "web/server.js"]
