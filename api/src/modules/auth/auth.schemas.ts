import { z } from 'zod'

export const aceitarConviteSchema = z.object({
  nome: z.string().min(2, 'nome muito curto'),
  senha: z.string().min(8, 'senha precisa de pelo menos 8 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
})

export const esqueciSenhaSchema = z.object({
  email: z.string().email(),
})

// Mesma regra de senha do aceite de convite.
export const redefinirSenhaSchema = z.object({
  senha: z.string().min(8, 'senha precisa de pelo menos 8 caracteres'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})
