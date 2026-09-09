# Gridgen

Motor de produção de conteúdo em massa (carrossel, stories, tweet-card, e reels em breve)
para redes sociais, multi-tenant: cada **Conta** (uma agência) gerencia N **Perfis**
(marcas/clientes para quem o conteúdo é gerado).

Modelo de negócio: *Service as a Software* via Eknotech — não existe autocadastro público.
Contas são provisionadas por um superadmin (a própria Eknotech) em `/admin`, e cada agência
entra através de um convite por e-mail.

Este produto nasceu como uma engine derivada do `eknotech-content-studio` (pasta irmã),
reescrita como serviço multi-tenant. Histórico completo de decisões e implementação em
`C:\Users\Erick\.claude\plans\fuzzy-painting-meerkat.md`.

## Estrutura

```
gridgen/
├── packages/shared/   # tipos TS compartilhados entre api, web e render (contrato de dados)
├── render/             # worker de render — Puppeteer, consome fila BullMQ
├── api/                # Fastify + Prisma — contas, perfis, auth, IA, filas
├── web/                # Next.js — landing pública, app logado, admin
├── deploy/             # Caddyfile próprio deste produto (TLS automático)
├── docker-compose.yml / docker-compose.prod.yml
└── .env.example
```

## Rodar localmente

```bash
cp .env.example .env
# preencher JWT_SECRET (openssl rand -hex 32), POSTGRES_PASSWORD

npm install
npm run build --workspace=@gridgen/shared

docker compose up -d
```

`ANTHROPIC_API_KEY`, `PEXELS_API_KEY` e `RESEND_API_KEY` são opcionais até o momento de uso
(geração por IA, busca de imagem de referência e envio de e-mail transacional, respectivamente)
— o resto da aplicação funciona sem elas.

## Rodar em produção

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Isso soma o Caddy próprio deste produto (reverse proxy + TLS automático via Let's Encrypt) por
cima do stack base. Exige `APP_DOMAIN` e `CADDY_ACME_EMAIL` reais no `.env` (DNS do domínio já
apontando pra VM) e `NODE_ENV=production`.

## O que já existe hoje

- Perfis multi-tenant com BrandKit próprio (cores, fonte, logo) por marca/cliente.
- Chat de contexto de marca guiado por IA (Claude), que orienta toda geração de conteúdo depois.
- Geração de post assistida por IA: 6 tipos de conteúdo, cada um com receita própria de
  estrutura; seleção automática de imagem (Galeria do Perfil → banco de imagens de referência);
  variações visuais automáticas por post (nunca a mesma composição duas vezes).
- Formatos: carrossel (feed/quadrado), stories, e um formato "tweet" (card estilo publicação
  de rede social, avatar/nome/@ reais do Perfil).
- Calendário sazonal com geração automática de rascunho, tela de Aprovações cruzando Perfis.
- Galeria de imagens por Perfil (pastas livres, drag-and-drop).
- Adaptação de conteúdo por rede (Instagram/LinkedIn/TikTok) e render próprio por rede.
- Aviso de publicação por e-mail (a publicação em si continua manual — sem automação direta
  nas redes ainda).
- Painel `/admin`: provisionamento de Conta por convite, ativar/desativar/excluir Conta, leads
  do formulário de contato da LP.

## Pendente conhecido

- Motor de Reels (geração de vídeo a partir de fotos reais do produto) — desenhado, não
  implementado.
- Sem suíte de testes automatizados.
- Sem observabilidade (Sentry) plugada ainda.
