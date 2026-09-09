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
    // próprio Instagram). `fundoClaro` só importa quando estilo === 'tweet'.
    estilo: z.enum(['padrao', 'tweet']).default('padrao'),
    fundoClaro: z.boolean().default(true),
  })
  // Tweet é um card exclusivo do Instagram (não existe em LinkedIn/TikTok) —
  // mesma regra já aplicada na UI (desabilita o toggle de redes extras),
  // repetida aqui porque a UI sozinha nunca é garantia.
  .refine((body) => body.estilo !== 'tweet' || body.redes.length === 0, {
    message: 'o estilo Tweet é exclusivo do Instagram — não é possível marcar redes extras junto com ele',
    path: ['redes'],
  })
