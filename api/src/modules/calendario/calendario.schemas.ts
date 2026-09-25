import { z } from 'zod'

export const criarDataPersonalizadaSchema = z.object({
  nome: z.string().min(2).max(80),
  mes: z.number().int().min(1).max(12),
  dia: z.number().int().min(1).max(31),
  tipoSugerido: z.enum(['educativo', 'conexao', 'prova_social', 'produtos_servicos', 'interativo']).default('produtos_servicos'),
})
