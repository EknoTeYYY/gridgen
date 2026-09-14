# Deploy — Gridgen em produção (VM compartilhada da eknotech + GHCR)

Roda como **serviço convidado** na mesma VM Magalu que já hospeda o Gedfy e a
LP da eknotech (`201.54.11.5`, Ubuntu, 4 vCPU / 8 GB RAM / 100 GB). O
`gedfy-caddy` é o único dono das portas 80/443 do host — o Gridgen nunca
publica porta nenhuma, só entra na rede compartilhada `public_web` pra ser
alcançado por nome de container. **Nunca builda na VM** — as imagens vêm
prontas do GHCR, publicadas pelo GitHub Actions.

```
Internet ──► :443 gedfy-caddy ─┬─ gedfy.com.br          → gedfy (intocado)
                                 ├─ gridgen.com.br       → gridgen-web:3000
                                 └─ api.gridgen.com.br   → gridgen-api:8080
gridgen-postgres/redis: só rede interna (gridgen-backend), nunca expostos
```

**Regras de ouro** (não é opcional): nunca publicar porta no host, nunca
buildar na VM, nunca tocar em nada com prefixo `gedfy-*` (containers, volumes,
`.env`, compose), sempre `mem_limit` em cada serviço próprio, nomes/redes/
volumes sempre prefixados `gridgen_`/`gridgen-`.

---

## Fluxo de deploy diário (após setup)

```bash
# 1) Código local → commit → push origin main (GitHub)
# 2) GitHub Actions roda typecheck → build → publica :latest no GHCR
#    (.github/workflows/ci.yml)
# 3) Na VM:
ssh gridgen-deploy                            # alias sugerido, ver fim do doc
cd /opt/gridgen
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Ou, no GitHub: aba **Actions → workflow "Deploy to VM" → Run workflow** (manual,
1 clique) faz isso via SSH (`.github/workflows/deploy.yml`).

---

## Setup inicial (uma vez)

### Fase 1 · Domínio + DNS
> **Domínio já registrado**: `gridgen.com.br`. **PENDÊNCIA ATUAL:** criar os
> registros abaixo no painel do registrador e aguardar propagar:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| `A` | `@` | `201.54.11.5` | 300 |
| `A` | `api` | `201.54.11.5` | 300 |

- Apex/subdomínio é sempre `A` (IP), nunca CNAME.
- Verificar propagação: `nslookup gridgen.com.br 8.8.8.8` e
  `nslookup api.gridgen.com.br 8.8.8.8` → os dois devem responder
  `201.54.11.5`.
- Enquanto estiver no painel de DNS, vale já cadastrar o domínio no Resend
  também (Settings → Domains → `gridgen.com.br`) — ele pede registros
  próprios (SPF/DKIM) pra liberar `EMAIL_FROM` com domínio real em vez do
  `onboarding@resend.dev` de teste. Não bloqueia o primeiro deploy, só
  economiza uma segunda rodada de mexer no DNS.

### Fase 2 · Chave de deploy dedicada
> Gerada localmente (`~/.ssh/id_ed25519_gridgen_deploy`, sem passphrase — uso
> não-interativo pelo GitHub Actions). **Nunca reaproveitar a chave pessoal
> nem a de CI do Gedfy.**

1. ✅ **Feito** — chave **pública** adicionada ao `authorized_keys` do usuário
   `ubuntu` na VM (append idempotente, sem duplicar as chaves já existentes).
   > ⚠️ **Pendência de segurança, registrada, não bloqueante**: essa chave
   > concede acesso `ubuntu` completo (igual às chaves pessoais já na VM), não
   > só o suficiente pra fazer deploy. Antes do 1º cliente pagante, vale trocar
   > pela versão restrita, prefixando a linha no `authorized_keys` com um
   > `command=` forçado (só executa o pull/up do Gridgen, sem shell interativo):
   > ```
   > command="cd /opt/gridgen && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d",no-agent-forwarding,no-X11-forwarding,no-port-forwarding ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICbf9GmOUoYhJFyTSEpen0qMulYjmGeRN+x9CfIKJYsO gridgen-deploy-ci
   > ```
2. Cadastrar a chave **privada** como secret no GitHub do repo
   (Settings → Secrets and variables → Actions → New repository secret):
   - `VM_SSH_KEY` — conteúdo de `~/.ssh/id_ed25519_gridgen_deploy` (a privada, multi-linha)
   - `VM_HOST` — `201.54.11.5`
   - `VM_USER` — `ubuntu`
   - `VM_PROJECT_DIR` — `/opt/gridgen`

### Fase 3 · Preparar `/opt/gridgen` na VM
```bash
ssh -i ~/.ssh/id_ed25519_gridgen_deploy ubuntu@201.54.11.5
sudo mkdir -p /opt/gridgen && sudo chown -R $USER:$USER /opt/gridgen
cd /opt/gridgen
git clone https://github.com/EknoTeYYY/gridgen.git .
# (a VM só puxa imagem do GHCR — o clone é só pra ter docker-compose.prod.yml
# e o Caddyfile de referência sempre atualizados via `git pull`)
```

### Fase 4 · GHCR
A VM já está autenticada no `ghcr.io` pro org `eknoteyyy` (feito no setup do
Gedfy) — as imagens do Gridgen (`ghcr.io/eknoteyyy/gridgen/*`), sendo do
mesmo org, já devem ser puxáveis sem login novo. Se falhar com 401/403 no
`docker compose pull`, repetir o login com um PAT `read:packages`:
```bash
echo "<PAT-read-packages>" | docker login ghcr.io -u EknoTeYYY --password-stdin
```

### Fase 5 · `.env` de produção
```bash
cd /opt/gridgen
cp .env.prod.example .env && chmod 600 .env
# Gera segredos NA VM (nunca passam por chat/log):
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 24)|" .env
sed -i "s|^ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$(openssl rand -hex 32)|" .env
sed -i "s|^WEB_APP_URL=.*|WEB_APP_URL=https://gridgen.com.br|" .env
nano .env   # ANTHROPIC_API_KEY, PEXELS_API_KEY, RESEND_API_KEY, EMAIL_FROM
```

### Fase 6 · Rede compartilhada
```bash
docker network inspect public_web >/dev/null 2>&1 || docker network create public_web
```
(deve já existir, criada pelo stack do Gedfy — só um `inspect` de checagem.)

### Fase 7 · Primeiro deploy
```bash
cd /opt/gridgen
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f api   # esperar "Server listening"
```

### Fase 8 · Rota no Caddy do Gedfy
O Gridgen **não tem Caddy próprio**. A rota fica no repositório do Gedfy
(`deploy/Caddyfile` de lá é a fonte de verdade). Adicionar (bloco de
referência em `deploy/Caddyfile` deste repo):
```
gridgen.com.br {
    encode gzip zstd
    reverse_proxy gridgen-web:3000
}

api.gridgen.com.br {
    encode gzip zstd
    reverse_proxy gridgen-api:8080
}
```
> **Só ativar depois do DNS propagado** (Fase 1) — o Caddy tenta emitir
> certificado Let's Encrypt na hora do reload, e isso falha (ou fica preso
> tentando) se `gridgen.com.br`/`api.gridgen.com.br` ainda não resolverem
> pro IP da VM. Pode deixar o bloco já commitado e comentado no Caddyfile do
> Gedfy antes disso, só descomentando quando o `nslookup` da Fase 1 confirmar.

Commitar essa mudança **no repo do Gedfy** (nunca editar só na VM — um deploy
futuro do Gedfy sobrescreveria). Depois, recarregar sem downtime:
```bash
docker exec gedfy-caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

### Fase 9 · Provisionar o primeiro superadmin (a própria Eknotech)
Sem autocadastro público — o `/admin` precisa de um usuário `isSuperAdmin`
já existente pra convidar o resto. Na primeira subida, criar a Conta/usuário
da Eknotech direto no banco (mesmo processo já usado em dev, documentado no
plano do projeto) e promover:
```sql
UPDATE users SET "isSuperAdmin" = true WHERE email = '<email-real-da-eknotech>';
```

---

## Validação externa

```bash
curl -I https://gridgen.com.br           # 200 + cert Let's Encrypt
curl -s https://api.gridgen.com.br/health # {"status":"ok"}
curl -I https://gedfy.com.br             # o Gedfy TEM que continuar 200
free -h                                  # confirma que ainda sobra RAM
docker ps                                # gridgen-* 'Up', gedfy-* intactos
```

---

## Pontos de atenção nesta VM

- **RAM (8 GB, ~6,6 GB livres antes do Gridgen)**: limites definidos no
  `docker-compose.prod.yml` somam ~2,8 GB (postgres 512M + redis 256M +
  api 768M + render 1024M + web 512M) — cabe com folga junto do Gedfy.
- **`render` é o mais pesado** (Puppeteer/Chromium headless) — se o limite de
  1024M se mostrar apertado em uso real, é o primeiro a ajustar.
- **Nunca usar o Postgres do Gedfy** — o Gridgen sobe o seu próprio
  (`gridgen-postgres`, só na rede interna `gridgen-backend`).

## Manutenção
- **Backup do Postgres do Gridgen**: ainda não configurado — replicar o
  padrão do Gedfy (`deploy/backup-pg.sh` + cron), apontando pro
  `gridgen-postgres`, antes de considerar produção estável.
- **Log rotation do Docker**: já configurado na VM (herdado do setup do
  Gedfy/athelium) — nada a fazer aqui.

## Troubleshooting
- **Caddy não emite cert pro domínio do Gridgen** → DNS não resolveu ainda,
  ou o bloco não foi commitado/recarregado no Caddyfile do Gedfy.
- **`docker compose pull` falha com 401/403** → login no GHCR expirou/não
  cobre este pacote — ver Fase 4.
- **`api` aborta no boot** → `JWT_SECRET`/`POSTGRES_PASSWORD` ausentes ou
  `DATABASE_URL` incoerente com o `.env` — ver `api/src/env.ts`.
- **Convite/aviso de publicação não chega por e-mail** → `RESEND_API_KEY`
  ausente ou domínio de envio não verificado no Resend.

## Alias SSH sugerido (`~/.ssh/config`)
```
Host gridgen-deploy
    HostName 201.54.11.5
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519_gridgen_deploy
    IdentitiesOnly yes
```
