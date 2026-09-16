import type { TipoConteudo } from './post.js'

// Como o slide final de CTA converte, independente do que ele diz: decide
// SÓ o que aparece no campo de destino (texto de apoio, ver `textoConversao`
// no lado da api, que resolve isso a partir do Perfil, nunca da IA: nenhum
// desses valores é dado que a IA deveria inventar).
export type MetodoConversao = 'comentario' | 'whatsapp' | 'lp' | 'link_bio'

export const METODO_CONVERSAO_NOME: Record<MetodoConversao, string> = {
  comentario: 'Comentário',
  whatsapp: 'WhatsApp',
  lp: 'Link (LP/site)',
  link_bio: 'Link na bio',
}

// Levantamento feito com o usuário: 4 dos 6 tipos já são pensados pra
// ENGAJAMENTO (comentário, sem link nenhum), só "Oferta" já nasceu pensado
// pra CONVERSÃO de venda de verdade (precisa de destino real). "Âncora" e
// "Prova" ficam no meio, um convite direto (WhatsApp), não uma venda fria.
export const METODO_CONVERSAO_PADRAO: Record<TipoConteudo, MetodoConversao> = {
  ancora: 'whatsapp',
  dor: 'comentario',
  prova: 'whatsapp',
  didatico: 'comentario',
  dado: 'comentario',
  oferta: 'lp',
}

// Instrução de craft pro campo "O convite" (headline do layout `cta`):
// pedir comentário é um convite bem diferente de pedir mensagem no
// WhatsApp, que é diferente de apontar pra um link. Sem isso, a IA escreve
// o mesmo convite genérico não importa o método escolhido.
// "No máximo N palavras" funciona bem melhor que um `maxLength` de
// caractere: a IA conta palavra com mais precisão do que caractere (achado
// real, validado na prática: com só o limite de caractere, o convite saía
// cortado no meio da frase com frequência real, mesmo com uma folga de 90
// caracteres).
const LIMITE_PALAVRAS = 'No máximo 10 palavras, frase completa (nunca corte uma ideia pela metade).'

export const DIRECAO_CONVITE_POR_METODO: Record<MetodoConversao, string> = {
  comentario: `Convite direto pra comentar, formulado como algo fácil de responder (ex.: "Isso também acontece com você?"). Nunca peça pra clicar em nada, não existe link aqui. ${LIMITE_PALAVRAS}`,
  whatsapp: `Convite direto pra chamar no WhatsApp, urgente e pessoal, sem soar desesperado (ex.: "Manda uma mensagem e resolve isso hoje."). O número aparece logo abaixo, não precisa repeti-lo no texto. ${LIMITE_PALAVRAS}`,
  lp: `Convite direto pra acessar o link abaixo, deixe claro o que a pessoa vai encontrar lá. ${LIMITE_PALAVRAS}`,
  link_bio: `Convite direto pro link na bio do perfil, deixe claro o que a pessoa vai encontrar lá. ${LIMITE_PALAVRAS}`,
}
