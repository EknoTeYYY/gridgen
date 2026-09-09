import { z } from 'zod'

export const enviarMensagemSchema = z.object({
  mensagem: z.string().min(1, 'mensagem vazia'),
})
