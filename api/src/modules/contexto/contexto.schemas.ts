import { z } from 'zod'

export const enviarMensagemSchema = z.object({
  mensagem: z.string().min(1, 'mensagem vazia').max(1000, 'mensagem muito longa (máx. 1000 caracteres)'),
})
