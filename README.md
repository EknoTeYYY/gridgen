# studio

> Nome de trabalho — o produto ainda não tem marca/nome definitivo (em definição com o time).

Motor de produção de conteúdo em massa (posts, carrossel, stories) para redes sociais,
multi-tenant: cada **Conta** (uma agência) gerencia N **Perfis** (marcas/clientes para
quem o conteúdo é gerado).

Este produto é uma engine derivada do `eknotech-content-studio` (pasta irmã), reescrita
como serviço multi-tenant. Ver plano completo em
`C:\Users\Erick\.claude\plans\fuzzy-painting-meerkat.md`.

## Estrutura

```
studio/
├── packages/shared/   # tipos TS compartilhados entre api, web e render (contrato de dados)
├── render/             # worker de render — Puppeteer, consome fila BullMQ
├── api/                # Fastify + Prisma — contas, perfis, auth, orquestração
├── web/                # Next.js — landing pública, app logado, docs
├── deploy/             # Caddyfile próprio deste produto
├── docker-compose.yml / docker-compose.prod.yml
└── .env.example
```

## Rodar localmente

```bash
cp .env.example .env
# preencher JWT_SECRET (openssl rand -hex 32), POSTGRES_PASSWORD

npm install
npm run build --workspace=@studio/shared

docker compose up -d
```

## Fases

- **Fase 0** (atual) — fundação: monorepo, motor migrado e corrigido, API com
  Conta/Perfil/User + auth JWT. Testável via curl, sem UI.
- **Fase 1** — geração manual de post ponta a ponta + frontend mínimo.
- **Fase 2** — chat de contexto e geração de post assistidos por IA (Claude).
- **Fase 4** — landing page.
- **Fase 5** — publicação automática (Instagram/LinkedIn/TikTok), futuro.
