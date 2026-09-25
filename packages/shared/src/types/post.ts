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
  | 'grafico'
  | 'enquete'

export type Tema = 'ink' | 'brand' | 'light' | 'paper'

/**
 * Eixo independente do `tipo` de conteúdo: decide COMO o carrossel fica
 * visualmente, não O QUE ele diz (isso continua sendo o `tipo`). "padrao" é
 * o motor de sempre (photo/split/word/etc., por receita do tipo); "tweet"
 * reaproveita a mesma narrativa do tipo, só que desdobrada em cards estilo
 * publicação de rede social (avatar + nome + @ + texto), sem foto nenhuma;
 * "grafico" é uma peça estática única (não um carrossel) com um gráfico de
 * barras — igual ao "tweet", ignora a sequência de layouts da receita e
 * sempre produz 1 slide só, do layout `grafico`.
 */
export type EstiloVisual = 'padrao' | 'tweet' | 'grafico'

/**
 * Uma barra do layout `grafico`. `valor` é só pra calcular a altura
 * proporcional da barra (nunca aparece na imagem); `valorExibido` é o texto
 * de verdade mostrado acima dela — o usuário escreve formatado do jeito que
 * quiser ("US$ 30 bi", "79.390"), o motor não tenta adivinhar formatação de
 * número. Sempre preenchido manualmente (nunca pela IA — risco real de
 * alucinar dado factual e apresentar como estatística verdadeira).
 */
export interface ItemGrafico {
  rotulo: string
  valor: number
  valorExibido: string
  subrotulo?: string
  destaque?: boolean
}

// Taxonomia editorial (entrega Ellen/marketing, GRIDGEN-ENTREGA-PARA-ERICK.md
// §3 e §7) — substitui os 6 tipos antigos (ancora/dor/prova/didatico/dado/
// oferta). Migração de dados: ver a migration do PostTipo em
// api/prisma/migrations, que remapeia posts existentes pro tipo novo mais
// próximo em vez de descartar (didatico→educativo, dado→educativo,
// dor→conexao, ancora→conexao, oferta→produtos_servicos, prova→
// produtos_servicos — nunca prova_social, cuja receita nova, 1 slide com
// print de depoimento real, é estruturalmente incompatível com o carrossel
// de portfólio que "prova" era).
export type TipoConteudo = 'educativo' | 'conexao' | 'prova_social' | 'produtos_servicos' | 'interativo'

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
  hint?: string
  headline?: string
  title?: string
  text?: string
  items?: string[]
  logoTop?: boolean
  tagline?: string
  url?: string
  photoDataUri?: string
  full?: boolean
  barras?: ItemGrafico[]
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
