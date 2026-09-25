import type { TipoConteudo } from './post.js'

// Como o slide final de CTA converte, independente do que ele diz: decide
// SÓ o que aparece no campo de destino (texto de apoio, ver `textoConversao`
// no lado da api, que resolve isso a partir do Perfil, nunca da IA: nenhum
// desses valores é dado que a IA deveria inventar). `ligacao`/`whatsapp`/
// `whatsapp_bio`/`lp`/`cardapio_bio` também são os valores possíveis de
// `Perfil.canalConversaoTipo` (doc editorial: "não presumir que um telefone
// recebe WhatsApp" — por isso `whatsapp` (número direto) e `whatsapp_bio`
// (só acessível pela bio) são métodos distintos, com destino e frase
// diferentes).
export type MetodoConversao = 'comentario' | 'ligacao' | 'whatsapp' | 'whatsapp_bio' | 'lp' | 'link_bio' | 'cardapio_bio'

export const METODO_CONVERSAO_NOME: Record<MetodoConversao, string> = {
  comentario: 'Comentário',
  ligacao: 'Ligação',
  whatsapp: 'WhatsApp',
  whatsapp_bio: 'WhatsApp (link na bio)',
  lp: 'Link (LP/site)',
  link_bio: 'Link na bio',
  cardapio_bio: 'Cardápio (link na bio)',
}

// Doc editorial (Ellen): Conexão fica deliberadamente soft (comentário/
// identificação, nunca forçando venda em toda peça); Educativo convida pra
// ajuda/atendimento; Prova Social e Produtos e Serviços são os dois tipos
// pensados pra CONVERSÃO de verdade (precisam de destino real). Interativo
// não tem slide de CTA na receita (a interação é a própria enquete) — o
// valor aqui fica inerte, nunca chega a ser usado num slide. Estes são só o
// FALLBACK genérico por tipo — assim que o Perfil confirma um canal de
// conversão real (`canalConversaoConfirmado`), esse canal substitui o
// padrão genérico pra qualquer tipo que não seja "conexao" (ver
// `resolverMetodoConversaoPadrao` em posts.service.ts).
export const METODO_CONVERSAO_PADRAO: Record<TipoConteudo, MetodoConversao> = {
  educativo: 'comentario',
  conexao: 'comentario',
  prova_social: 'whatsapp',
  produtos_servicos: 'lp',
  interativo: 'comentario',
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
  ligacao: `Convite direto pra ligar, deixando claro o motivo da ligação (ex.: "Ligue e agende sua visita."). O telefone aparece logo abaixo, não precisa repeti-lo no texto. ${LIMITE_PALAVRAS}`,
  whatsapp: `Convite direto pra chamar no WhatsApp, urgente e pessoal, sem soar desesperado (ex.: "Manda uma mensagem e resolve isso hoje."). O número aparece logo abaixo, não precisa repeti-lo no texto. ${LIMITE_PALAVRAS}`,
  whatsapp_bio: `Convite direto pro WhatsApp pelo link da bio (não existe número visível aqui, só o link) — deixe claro que é WhatsApp mesmo. ${LIMITE_PALAVRAS}`,
  lp: `Convite direto pra acessar o link abaixo, deixe claro o que a pessoa vai encontrar lá. ${LIMITE_PALAVRAS}`,
  link_bio: `Convite direto pro link na bio do perfil, deixe claro o que a pessoa vai encontrar lá. ${LIMITE_PALAVRAS}`,
  cardapio_bio: `Convite direto pro cardápio pelo link da bio, deixando claro que é o cardápio que a pessoa vai encontrar lá. ${LIMITE_PALAVRAS}`,
}
