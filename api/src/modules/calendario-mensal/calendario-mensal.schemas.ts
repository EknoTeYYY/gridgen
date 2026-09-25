import { z } from 'zod'

export const gerarPropostaMensalSchema = z.object({
  ano: z.number().int().min(2024).max(2100),
  mes: z.number().int().min(1).max(12),
})

// Todo campo opcional — edição parcial (PATCH). `motivoTroca` só é exigido
// em código (não no schema, que não sabe o status da proposta) quando a
// pauta pertence a uma proposta já aprovada — ver calendario-mensal.routes.ts.
export const editarPautaSchema = z.object({
  assunto: z.string().trim().min(2).max(160).optional(),
  abordagem: z.string().trim().min(2).max(500).optional(),
  publico: z.string().trim().min(2).max(200).optional(),
  objetivo: z.string().trim().min(2).max(200).optional(),
  motivoEscolha: z.string().trim().min(2).max(500).optional(),
  tipo: z.enum(['educativo', 'conexao', 'prova_social', 'produtos_servicos', 'interativo']).optional(),
  formato: z.enum(['feed', 'square', 'story']).optional(),
  dataHorario: z.coerce.date().optional(),
  direcaoVisual: z.string().trim().min(2).max(300).optional(),
  acaoDesejada: z.string().trim().min(2).max(200).optional(),
  dependencias: z.string().trim().max(300).optional(),
  alternativa: z.string().trim().max(300).optional(),
  motivoTroca: z.string().trim().min(4).max(300).optional(),
})
