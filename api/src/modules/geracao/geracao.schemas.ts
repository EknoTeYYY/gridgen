import { z } from 'zod'

export const gerarComIaSchema = z
  .object({
    tipo: z.enum(['educativo', 'conexao', 'prova_social', 'produtos_servicos', 'interativo']),
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
    // Como o slide final de CTA converte — vazio usa o canal confirmado do
    // Perfil ou o padrão do tipo (ver resolverMetodoConversaoPadrao). Só se
    // aplica ao estilo "padrao" (Tweet/Gráfico não têm slide de CTA).
    metodoConversao: z.enum(['comentario', 'ligacao', 'whatsapp', 'whatsapp_bio', 'lp', 'link_bio', 'cardapio_bio']).optional(),
    // Nome de uma pasta da Galeria do Perfil pra usar como referência visual
    // desta publicação específica (ex.: "Imóvel Lançamento X") — cada slide
    // que ganha foto de fundo usa uma imagem distinta dessa pasta, em ordem,
    // antes de cair na busca automática genérica (Galeria geral → Pexels).
    pastaReferencia: z.string().trim().min(1).max(80).optional(),
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
  // Interativo é sempre Stories com enquete nativa (doc editorial) — nunca
  // carrossel de feed, nunca os estilos Tweet/Gráfico (que pressupõem
  // carrossel/peça de feed).
  .refine((body) => body.tipo !== 'interativo' || body.formato === 'story', {
    message: 'o tipo Interativo só existe em formato Stories',
    path: ['formato'],
  })
  .refine((body) => body.tipo !== 'interativo' || body.estilo === 'padrao', {
    message: 'o tipo Interativo não usa os estilos Tweet/Gráfico',
    path: ['estilo'],
  })
  // Prova Social é sempre 1 print real (peça única) — Tweet/Gráfico
  // substituiriam o print por um card/gráfico fabricado, contrariando a
  // regra editorial de nunca fingir evidência.
  .refine((body) => body.tipo !== 'prova_social' || body.estilo === 'padrao', {
    message: 'o tipo Prova Social não usa os estilos Tweet/Gráfico — o print real é sempre a peça',
    path: ['estilo'],
  })
