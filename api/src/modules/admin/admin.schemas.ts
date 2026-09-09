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
