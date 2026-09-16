import { z } from 'zod'

const slideSchema = z
  .object({
    layout: z.enum([
      'logocover',
      'cover',
      'statement',
      'word',
      'bottom',
      'split',
      'item',
      'list',
      'photo',
      'cta',
      'tweet',
      'grafico',
    ]),
    theme: z.enum(['ink', 'brand', 'light', 'paper']).optional(),
    kicker: z.string().optional(),
    hint: z.string().optional(),
    headline: z.string().optional(),
    title: z.string().optional(),
    text: z.string().optional(),
    num: z.union([z.string(), z.number()]).optional(),
    items: z.array(z.string()).optional(),
    logoTop: z.boolean().optional(),
    tagline: z.string().optional(),
    url: z.string().optional(),
    photoDataUri: z.string().optional(),
    full: z.boolean().optional(),
  })
  .passthrough()

export const atualizarPostSchema = z.object({
  formato: z.enum(['feed', 'square', 'story']).optional(),
  caption: z.string().optional(),
  hashtags: z.string().optional(),
  slides: z.array(slideSchema).min(1).optional(),
})

export const agendarPostSchema = z.object({
  agendadoPara: z.string().datetime().nullable(),
})
