import { z } from 'zod'

export const criarItemGaleriaSchema = z.object({
  pasta: z.string().trim().min(1, 'nome da pasta é obrigatório').max(60),
  nome: z.string().max(120).optional(),
  // Data URI (upload no navegador, convertido lá) — mesmo padrão do BrandKit.
  url: z.string().max(5_000_000, 'imagem grande demais'),
})

export const atualizarItemGaleriaSchema = z.object({
  nome: z.string().trim().max(120),
})

export const criarPastaGaleriaSchema = z.object({
  nome: z.string().trim().min(1, 'nome da pasta é obrigatório').max(60),
})
