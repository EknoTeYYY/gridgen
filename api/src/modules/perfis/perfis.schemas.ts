import { z } from 'zod'

function opcionalOuVazio<T extends z.ZodTypeAny>(schema: T) {
  return z.union([z.literal(''), schema]).optional()
}

const corHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'cor precisa ser hex de 6 dígitos, ex. #8b5cf6')

// Assets chegam como data URI (upload no navegador, convertido lá) — não mais
// URL externa obrigatória. Limite generoso o bastante pra logo/ícone em PNG.
const imagem = opcionalOuVazio(z.string().max(5_000_000, 'imagem grande demais'))

// CNPJ (14 dígitos) ou CPF (11 dígitos) — só dígitos guardados, a UI formata
// na exibição. Valida só o tamanho (não o dígito verificador): é uma
// ferramenta de marketing, não um sistema fiscal.
const documento = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .refine((v) => v === '' || v.length === 11 || v.length === 14, {
    message: 'documento precisa ter 11 dígitos (CPF) ou 14 (CNPJ)',
  })
  .optional()

export const criarPerfilSchema = z.object({
  nome: z.string().min(2),
  tipo: z.enum(['empresa', 'pessoal']).default('empresa'),
  corPrimaria: corHex.optional(),
  corSecundaria: corHex.optional(),
  corFundo: corHex.optional(),
  corTexto: corHex.optional(),
  temaPadrao: z.enum(['ink', 'brand', 'light', 'paper']).optional(),
  lockupTag: z.string().max(80).optional(),
  url: opcionalOuVazio(z.string().url()),
  telefoneContato: z.string().max(30).optional(),
  emailContato: opcionalOuVazio(z.string().email()),
  documento,
  instagramUrl: z.string().max(200).optional(),
  linkedinUrl: z.string().max(200).optional(),
  tiktokUrl: z.string().max(200).optional(),
  // Já aceito na criação (não só na edição): o formulário é o mesmo pros dois
  // casos, então um upload feito na hora de criar não pode ser descartado.
  logoColorUrl: imagem,
  logoBrancoUrl: imagem,
  iconeColorUrl: imagem,
  iconeBrancoUrl: imagem,
})

export const atualizarPerfilSchema = criarPerfilSchema.partial().extend({
  status: z.enum(['ativo', 'inativo']).optional(),
})
