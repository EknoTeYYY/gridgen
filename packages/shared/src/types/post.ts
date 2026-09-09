export type Layout =
  | 'logocover'
  | 'cover'
  | 'statement'
  | 'word'
  | 'bottom'
  | 'split'
  | 'item'
  | 'list'
  | 'photo'
  | 'cta'
  | 'tweet'

export type Tema = 'ink' | 'brand' | 'light' | 'paper'

/**
 * Eixo independente do `tipo` de conteúdo: decide COMO o carrossel fica
 * visualmente, não O QUE ele diz (isso continua sendo o `tipo`). "padrao" é
 * o motor de sempre (photo/split/word/etc., por receita do tipo); "tweet"
 * reaproveita a mesma narrativa do tipo, só que desdobrada em cards estilo
 * publicação de rede social (avatar + nome + @ + texto), sem foto nenhuma.
 */
export type EstiloVisual = 'padrao' | 'tweet'

export type TipoConteudo = 'ancora' | 'dor' | 'prova' | 'didatico' | 'dado' | 'oferta'

export type Formato = 'feed' | 'square' | 'story'

export type PostStatus = 'rascunho' | 'gerando' | 'pronto' | 'erro'

/**
 * Um slide do carrossel/story. Fotos e prints já chegam resolvidos como data URI
 * (base64) — o motor de render não lê arquivo nenhum do filesystem por caminho
 * relativo (isso já foi um path traversal na versão local do script).
 */
export interface Slide {
  layout: Layout
  theme?: Tema
  kicker?: string
  hint?: string
  headline?: string
  title?: string
  text?: string
  num?: string | number
  items?: string[]
  logoTop?: boolean
  tagline?: string
  url?: string
  photoDataUri?: string
  full?: boolean
  // Índice de composição visual alternativa pro mesmo layout (0-based) — o
  // MOTOR decide como um `photo`/`split`/`word`/etc. fica em tela, o `tipo`
  // continua decidindo o que dizer. Sorteado uma vez por layout na hora de
  // montar o esqueleto (`montarSlidesPadrao`), não por chamada de IA — sem
  // isso, todo post do mesmo tipo saía com a cara idêntica (achado real do
  // usuário). `undefined`/fora da faixa cai na variante 0 (a original).
  variante?: number
}

export interface PostContent {
  slug: string
  tipo: TipoConteudo
  formato: Formato
  caption: string
  hashtags: string
  slides: Slide[]
}
