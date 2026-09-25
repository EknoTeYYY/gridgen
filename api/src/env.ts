import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
  // Sem fallback inseguro: se JWT_SECRET não estiver setado, o boot falha —
  // em vez de assinar tokens com um segredo hardcoded previsível.
  JWT_SECRET: z.string().min(16, 'JWT_SECRET é obrigatório (mín. 16 caracteres — gere com openssl rand -hex 32)'),
  // 8h acompanha o cookie access_token do web (ACCESS_TOKEN_MAX_AGE) e os
  // .env.example — o default 15m divergia e derrubava a sessão no meio do uso.
  JWT_ACCESS_TTL: z.string().default('8h'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  OUTPUT_DIR: z.string().default('/data/output'),
  // Opcional (não trava o boot) — só é exigida na hora de usar o chat de
  // contexto ou a geração assistida; o resto da api funciona sem ela.
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-5'),
  // Chave simétrica (32 bytes) pra cifrar em repouso qualquer token OAuth de
  // integração de terceiro (ex.: refresh token de publicação automática por
  // rede, Fase 5). Gere com: openssl rand -hex 32
  ENCRYPTION_KEY: z.string().optional(),
  // Idem — opcional, só exigida quando o usuário busca imagem de referência
  // em vez de subir a própria foto. Grátis em pexels.com/api.
  PEXELS_API_KEY: z.string().optional(),
  // Idem — opcional, só exigida quando um superadmin convida uma Conta nova.
  // Provedor de e-mail transacional: resend.com.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('onboarding@resend.dev'),
  // URL pública do `web` — a api não tem outra forma de saber isso, e
  // precisa pra montar o link de convite (${WEB_APP_URL}/convite/{token}).
  WEB_APP_URL: z.string().default('http://localhost:3000'),
  INVITE_TOKEN_TTL_DAYS: z.coerce.number().default(7),
})

// `VAR=` (presente, vazia) não é a mesma coisa que "ausente" pro Zod — só
// `undefined` aciona `.default()`. Numa `.env` de verdade, deixar uma
// variável em branco é sempre uma forma de dizer "não configurei ainda",
// nunca um valor literal vazio de propósito — então trata os dois casos
// igual, senão um campo como `EMAIL_FROM` (validado com `.email()`) derruba
// o boot inteiro só por estar em branco em vez de comentado/ausente.
const envSemVazios = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ''))

export const env = schema.parse(envSemVazios)
