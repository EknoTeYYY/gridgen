import { z } from 'zod'

export const gerarComIaSchema = z
  .object({
    tipo: z.enum(['ancora', 'dor', 'prova', 'didatico', 'dado', 'oferta']),
    formato: z.enum(['feed', 'square', 'story']).default('feed'),
    briefing: z.string().optional(),
    // Nome do post pra identificar na grade (ex.: "Vaga backend sênior"), em
    // vez do padrão genérico "Tipo-N". Vazio = a IA sugere um sozinha.
    nome: z.string().trim().min(1).max(60).optional(),
    // Instagram é sempre o post principal — aqui só as redes ADICIONAIS que já
    // devem sair prontas (texto adaptado + imagem própria) sem precisar de
    // nenhum clique extra depois de criado.
    redes: z.array(z.enum(['linkedin', 'tiktok'])).default([]),
    // Eixo independente do tipo: "padrao" é o carrossel de sempre; "tweet" é o
    // card estilo publicação de rede social (não é uma rede nova — publica no
    // próprio Instagram); "grafico" é uma peça estática única com um gráfico
    // de barras. `fundoClaro` só importa pros dois estilos de 1 slide só.
    estilo: z.enum(['padrao', 'tweet', 'grafico']).default('padrao'),
    fundoClaro: z.boolean().default(true),
    // Como o slide final de CTA converte — vazio usa o padrão do tipo (ver
    // METODO_CONVERSAO_PADRAO). Só se aplica ao estilo "padrao" (Tweet/Gráfico
    // não têm slide de CTA).
    metodoConversao: z.enum(['comentario', 'whatsapp', 'lp', 'link_bio']).optional(),
  })
  // Tweet é exclusivo do Instagram; Gráfico permite só LinkedIn (infográfico
  // reaproveitado, converte bem lá — TikTok não combina, formato de vídeo
  // curto). Mesma regra já aplicada na UI, repetida aqui porque a UI sozinha
  // nunca é garantia.
  .refine(
    (body) => {
      if (body.estilo === 'tweet') return body.redes.length === 0
      if (body.estilo === 'grafico') return body.redes.every((r) => r === 'linkedin')
      return true
    },
    {
      message: 'o estilo Tweet não permite redes extras, e o estilo Gráfico só permite LinkedIn',
      path: ['redes'],
    },
  )
