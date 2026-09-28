import { z } from 'zod'

export const criarContaSchema = z.object({
  nome: z.string().min(2, 'nome da conta muito curto'),
  email: z.string().email(),
})

export const reenviarConviteSchema = z.object({
  email: z.string().email().optional(),
})

export const alterarStatusContaSchema = z.object({
  status: z.enum(['ativa', 'inativa']),
})

// Cobrança manual: o superadmin registra aqui o que foi contratado.
// `reiniciarCiclo` move a âncora do ciclo pra agora (ex.: início do contrato).
// `limiteGeracoes`/`limitePerfis` nulos = vale o limite do plano.
export const alterarPlanoContaSchema = z.object({
  plano: z.enum(['piloto', 'essencial', 'profissional', 'agencia', 'sob_medida']),
  reiniciarCiclo: z.boolean().default(false),
  pilotoExpiraEm: z.coerce.date().nullable().optional(),
  limiteGeracoes: z.number().int().min(0).nullable().optional(),
  limitePerfis: z.number().int().min(0).nullable().optional(),
  perfisExtras: z.number().int().min(0).optional(),
})

export const adicionarPacoteSchema = z.object({
  pacotes: z.number().int().min(1).max(20),
})
