import { z } from 'zod'

export const criarLeadSchema = z.object({
  nome: z.string().trim().min(2, 'nome muito curto').max(120),
  email: z.string().trim().email(),
  empresa: z.string().trim().max(120).optional(),
  telefone: z.string().trim().max(40).optional(),
  mensagem: z.string().trim().max(2000).optional(),
})
