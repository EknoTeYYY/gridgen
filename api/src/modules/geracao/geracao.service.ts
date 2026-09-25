import type Anthropic from '@anthropic-ai/sdk'
import {
  aplicarMetadadosSlides,
  BANCO_GANCHOS,
  CAMPOS_POR_LAYOUT,
  DIRECAO_CONVITE_POR_METODO,
  ESTILO_LEGENDA_POR_REDE,
  GANCHOS_PROIBIDOS,
  LIMITES_HASHTAG_POR_REDE,
  montarSlidesPadrao,
  receitaDe,
  REDE_NOME,
  type CampoSlide,
  type EstiloVisual,
  type Layout,
  type MetodoConversao,
  type RedeSocial,
  type Slide,
  type Tema,
  type TipoConteudo,
} from '@gridgen/shared'
import { getClaude } from '../../lib/claude.js'
import { env } from '../../env.js'

// Doc editorial: "até cinco hashtags pertinentes por legenda, podendo ser
// menos" — teto universal da geração principal (Instagram). Adaptações por
// rede usam a faixa própria de cada rede (`LIMITES_HASHTAG_POR_REDE`), não
// este valor.
const MAX_HASHTAGS_PADRAO = 5

// Achado real (2x no mesmo post): pedir uma cena descrita como "pessoa
// procurando/navegando um site" faz o banco de imagens devolver, de forma
// irônica, um print de tela de um site de VERDADE (o próprio Pexels, ou outro
// produto real tipo "walls.io") — vazando marca de terceiro na foto do
// cliente. Reforço explícito, além do já existente contra código/tela de
// desenvolvedor, anexado à descrição dos dois campos de busca de imagem.
const AVISO_TELA_DE_TERCEIRO =
  'TAMBÉM NUNCA descreva a cena como "pessoa procurando/navegando/pesquisando um site ou app" nem peça "tela mostrando [nome de site/produto]" — bancos de imagem costumam devolver um print de tela de um site REAL nesses casos (achado real: um post sobre "caçar foto em banco de imagens" voltou com o próprio site do Pexels, e depois com o site de outro produto real, aparecendo legível na foto). Se a cena tiver celular/notebook/monitor, descreva um enquadramento onde a tela NÃO é o foco nem fica legível (mãos digitando, pessoa vista de lado/de costas, tela desfocada ou reflexo ao fundo) — nunca peça pra ver o conteúdo da tela.'

function schemaDoCampo(campo: CampoSlide): Record<string, unknown> {
  const descricao = campo.direcaoIA ?? campo.label
  if (campo.tipo === 'lista') {
    return { type: 'array', items: { type: 'string' }, description: descricao }
  }
  const propriedade: Record<string, unknown> = { type: 'string', description: descricao }
  if (campo.maxLength) propriedade.maxLength = campo.maxLength
  if (campo.minLength) propriedade.minLength = campo.minLength
  return propriedade
}

// Um schema por layout distinto da receita (não por posição — mais simples e
// robusto pro tool-use). A IA sempre inclui "layout" no slide que devolve,
// pra gente conseguir cruzar com o esqueleto certo na hora de mesclar.
// `sugerirImagem` liga um campo extra, só pra layout que tem campo de foto, e
// quem chama resolve essa busca depois (Galeria primeiro, Pexels de
// fallback). `exigirImagem` decide se isso é opcional ou obrigatório PRA
// ESSE LAYOUT ESPECÍFICO — achado real do usuário: quando isso era um único
// booleano aplicado a TODO layout do estilo "padrão" (não só `photo`), a IA
// passou a sugerir foto pra praticamente todo slide (word/split/item/list/
// cta também ganharam campo de foto na rodada de "foto em todo lugar"),
// lotando o carrossel inteiro de fotos plotadas e fazendo o fundo flat
// (informativo, sem foto) praticamente sumir. Regra correta: só a capa e o
// layout `photo` (cuja função é justamente carregar uma foto, no formato
// full-bleed OU no formato híbrido — cartão de foto sobre fundo flat) exigem
// imagem de verdade; os demais layouts continuam com a foto OPCIONAL, pra a
// IA variar de propósito entre flat e humanizado dentro do mesmo carrossel.
function schemaParaLayout(
  layout: Layout,
  sugerirImagem: boolean,
  exigirImagem: boolean,
  metodoConversao?: MetodoConversao,
): Record<string, unknown> {
  const camposLayout = CAMPOS_POR_LAYOUT[layout] ?? []
  // `grafico-itens` nunca vai pro schema da IA — dado numérico real, sempre
  // digitado manualmente (risco de alucinação de fato inaceitável aqui).
  // `url` (só existe no layout `cta`) também nunca vai — é sempre resolvida
  // no servidor a partir do Perfil (telefone/site) ou um texto fixo,
  // conforme o método de conversão (ver MetodoConversao), nunca inventada.
  const campos = camposLayout
    .filter((c) => c.tipo !== 'foto' && c.tipo !== 'grafico-itens' && c.tipo !== 'url')
    .map((c) =>
      layout === 'cta' && c.nome === 'headline' && metodoConversao
        ? { ...c, direcaoIA: DIRECAO_CONVITE_POR_METODO[metodoConversao] }
        : c,
    )
  const properties: Record<string, unknown> = { layout: { type: 'string', const: layout } }
  const required: string[] = ['layout']
  for (const campo of campos) {
    properties[campo.nome] = schemaDoCampo(campo)
    required.push(campo.nome)
  }
  if (sugerirImagem && camposLayout.some((c) => c.tipo === 'foto')) {
    properties.buscaImagem = {
      type: 'string',
      description: exigirImagem
        ? 'Descreva em poucas palavras concretas que foto buscar como referência pra esse slide (ex.: "pessoa respondendo mensagem no celular à noite", "escritório vazio") — esse layout sempre carrega uma foto, não deixe de preencher. IMPORTANTE: a cena é sempre do dia a dia de quem cria/gerencia conteúdo e redes sociais (pessoa no celular, feed do Instagram, notebook mostrando posts, reunião de equipe) — NUNCA código de programação, tela de desenvolvedor ou jargão técnico de TI, mesmo quando o assunto do slide for uma funcionalidade técnica do Gridgen (achado real: "editar uma versão" virou foto de código HTML — a metáfora visual é sempre de marketing, nunca de programação). ' + AVISO_TELA_DE_TERCEIRO
        : 'Descreva em poucas palavras concretas que foto buscar como referência pra esse slide (ex.: "pessoa respondendo mensagem no celular à noite", "escritório vazio") — a ambientação com foto é o padrão esperado neste carrossel, não a exceção; preencha na quase totalidade dos slides. Só deixe de fora em no MÁXIMO 1 ou 2 telas do carrossel inteiro, e só quando aquele conteúdo específico funcionar visivelmente melhor só com texto (ex.: uma lista rápida, um dado isolado). IMPORTANTE: a cena é sempre do dia a dia de quem cria/gerencia conteúdo e redes sociais (pessoa no celular, feed do Instagram, notebook mostrando posts, reunião de equipe) — NUNCA código de programação, tela de desenvolvedor ou jargão técnico de TI, mesmo quando o assunto do slide for uma funcionalidade técnica do Gridgen (achado real: "editar uma versão" virou foto de código HTML — a metáfora visual é sempre de marketing, nunca de programação). ' + AVISO_TELA_DE_TERCEIRO,
    }
    properties.buscaImagemPexels = {
      type: 'string',
      description:
        'Só preencha junto com `buscaImagem` — a MESMA ideia, mas em inglês e em 2 a 4 palavras-chave de banco de imagens (ex.: "busy office desk", "phone notification night"). Bancos como Pexels indexam majoritariamente em inglês; um termo em português busca mal lá. NUNCA inclua termos de programação/desenvolvimento (ex.: "code", "html", "programming", "developer") — mesma restrição do campo buscaImagem, a cena é sempre de marketing/redes sociais. NUNCA inclua palavras como "website", "search", "browsing", "stock photo" ou nome de site/produto (ex.: "pexels", "google", "instagram app") — esses termos tendem a devolver um print de tela de um site de verdade, vazando marca de terceiro na foto do cliente.',
    }
    if (exigirImagem) required.push('buscaImagem', 'buscaImagemPexels')
  }
  return { type: 'object', properties, required }
}

function montarFerramentaGeracao(
  tipo: TipoConteudo,
  layoutsDistintos: Layout[],
  opcoes: {
    hashtagsDescricao?: string
    captionDescricao?: string
    incluirNome?: boolean
    sugerirImagem?: boolean
    // Layouts que exigem imagem de verdade (não apenas sugerem) — ver
    // comentário de `schemaParaLayout` acima. Os demais layouts com campo de
    // foto continuam opcionais mesmo com `sugerirImagem` ligado.
    layoutsComImagemObrigatoria?: Layout[]
    metodoConversao?: MetodoConversao
    // Faixa de telas aceitável (doc editorial: "extensão conforme narrativa,
    // até dez telas") — quando min≠max, a IA decide de verdade quantos
    // slides usar dentro da faixa, não uma contagem fixa. Omitido (ou
    // min===max) mantém o schema sem restrição extra de tamanho — quem
    // chama garante a contagem certa na hora de mesclar de qualquer jeito.
    minTelas?: number
    maxTelas?: number
  } = {},
): Anthropic.Tool {
  const {
    hashtagsDescricao = `Hashtags pertinentes ao assunto, oferta, nicho e localização (quando fizer sentido), separadas por espaço, cada uma começando com #. No máximo ${MAX_HASHTAGS_PADRAO}, podendo ser menos — nunca preencha ${MAX_HASHTAGS_PADRAO} só pra completar, e nunca repita o mesmo bloco de post pra post.`,
    captionDescricao = 'Legenda do post, no tom de voz da marca.',
    incluirNome = false,
    sugerirImagem = false,
    layoutsComImagemObrigatoria = [],
    metodoConversao,
    minTelas,
    maxTelas,
  } = opcoes

  const faixaVariavel = minTelas !== undefined && maxTelas !== undefined && minTelas !== maxTelas
  const properties: Record<string, unknown> = {
    caption: { type: 'string', description: captionDescricao },
    hashtags: { type: 'string', description: hashtagsDescricao },
    slides: {
      type: 'array',
      description: faixaVariavel
        ? `Conteúdo de cada slide. Use entre ${minTelas} e ${maxTelas} telas (nem toda narrativa precisa do teto) — o primeiro slide sempre é a capa, os demais reaproveitam só os layouts já previstos pro tipo. Cada tela precisa agregar algo de verdade; não estenda só pra preencher.`
        : 'Conteúdo de cada slide, na mesma ordem e quantidade da receita.',
      items: {
        anyOf: layoutsDistintos.map((l) => schemaParaLayout(l, sugerirImagem, layoutsComImagemObrigatoria.includes(l), metodoConversao)),
      },
      ...(minTelas !== undefined ? { minItems: minTelas } : {}),
      ...(maxTelas !== undefined ? { maxItems: maxTelas } : {}),
    },
  }
  const required = ['caption', 'hashtags', 'slides']
  if (incluirNome) {
    properties.nomePost = {
      type: 'string',
      description:
        'Nome curto (2 a 5 palavras) pra identificar esse post entre outros do mesmo tipo — baseado no assunto/pedido específico (ex.: "Vaga backend sênior", "Lançamento app v2"), nunca o tipo de conteúdo genérico (nada de "Post sobre dor" ou similar).',
    }
    required.push('nomePost')
  }

  return {
    name: 'gerar_post',
    description: `Gera o conteúdo textual de um post do tipo "${tipo}", respeitando a receita de layouts na ordem certa.`,
    input_schema: { type: 'object', properties, required },
  }
}

// Preposições/conjunções curtas que nunca deveriam sobrar como última
// palavra de um corte — achado real: gerando com contexto de marca rico (a
// IA escreve frases mais longas e naturais, que estouram maxLength com mais
// frequência), cortar só no último espaço ainda deixava frases visivelmente
// quebradas tipo "...com a identidade do seu cliente, ao" ou "...vários,
// sem" — o corte "no lugar certo" ainda pode parar bem no meio de uma
// oração. Doc editorial proíbe frase incompleta ("nunca corte uma ideia
// pela metade") — por isso o corte recua mais uma palavra sempre que a
// última sobrevivente for um conectivo fraco desses.
const CONECTIVOS_FRACOS = new Set([
  'a', 'à', 'ao', 'aos', 'às', 'o', 'os', 'as', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'num', 'numa',
  'por', 'pra', 'para', 'com', 'sem', 'que', 'e', 'ou', 'mas', 'se', 'um', 'uma',
  'mesmo', 'mesma', 'mesmos', 'mesmas', 'cada', 'todo', 'toda', 'todos', 'todas',
  'esse', 'essa', 'esses', 'essas', 'este', 'esta', 'estes', 'estas',
])

// `maxLength` no schema da ferramenta é só uma dica pra IA — o tool use da
// Anthropic não garante o limite de fato (confirmado na prática: IA já
// devolveu "22h04" pra um campo com maxLength:4). Sem isso, um `num` longo
// demais transborda o layout `split` (fonte grande, coluna estreita) e
// sobrepõe o título ao lado. Corta de verdade antes de salvar, não só pede.
//
// Achado real, em 3 rodadas: cortar só no último espaço (mesmo recuando de
// conectivos fracos como "ao"/"de"/"mesmo") ainda deixa frase incompleta
// sempre que a palavra sobrevivente é um verbo/substantivo/pronome que
// também precisava de continuação ("...e isso tem", "...sinal de que a
// conta") — não dá pra enumerar toda palavra que pode ficar pendurada.
// Duas camadas: (1) prioriza cortar numa pontuação de pausa (vírgula/
// ponto-e-vírgula/dois-pontos) perto do limite — o resultado lê como frase
// que parou cedo, não quebrada; (2) quando não há pontuação nenhuma por
// perto, cai pro corte por palavra de sempre, mas ASSUME que pode ter
// cortado uma ideia pela metade e sinaliza com "…" em vez de fingir que a
// frase termina ali (doc editorial: nunca apresentar frase incompleta como
// se fosse completa — mas apresentar como TRUNCADA, com reticências, é
// diferente e honesto).
function truncarPorPalavra(valor: string, maxLength: number): string {
  const cortadoBruto = valor.slice(0, maxLength)
  if (cortadoBruto.length === valor.length) return valor

  // Achado real (post gerado em produção): vírgula/ponto e vírgula/dois-pontos
  // são PAUSA, não fim de frase — cortar bem ali e devolver direto deixava
  // frases dependentes penduradas ("Se precisa de 8," sem nada depois, olhando
  // como se tivesse quebrado). Corta ali, mas remove a pontuação de pausa e
  // sinaliza com "…" — mesmo tratamento honesto do corte por palavra abaixo,
  // nunca finge que uma vírgula solta é um final de verdade.
  const limiteMinimo = Math.floor(maxLength * 0.5)
  const ultimaPontuacaoDePausa = Math.max(cortadoBruto.lastIndexOf(','), cortadoBruto.lastIndexOf(';'), cortadoBruto.lastIndexOf(':'))
  if (ultimaPontuacaoDePausa >= limiteMinimo) {
    return `${cortadoBruto.slice(0, ultimaPontuacaoDePausa).trimEnd()}…`
  }

  const ultimoEspaco = cortadoBruto.lastIndexOf(' ')
  if (ultimoEspaco <= 0) return cortadoBruto

  let palavras = cortadoBruto.slice(0, ultimoEspaco).trimEnd().split(' ')
  while (palavras.length > 1) {
    const ultima = palavras[palavras.length - 1].toLowerCase().replace(/[.,!?;:]+$/, '')
    if (!CONECTIVOS_FRACOS.has(ultima)) break
    palavras = palavras.slice(0, -1)
  }
  const cortado = palavras.join(' ').trimEnd()
  // Só ponto/exclamação/interrogação encerram uma frase de verdade — vírgula,
  // ponto e vírgula e dois-pontos são pausa (mesmo raciocínio do bloco acima),
  // então também precisam do "…" se sobrarem no fim do corte.
  return /[.!?]$/.test(cortado) ? cortado : `${cortado}…`
}

// Travessão (—) é o maior "tique" de texto gerado por IA — pedido explícito
// do usuário pra bloquear de forma restrita. Instruir a IA no prompt não é
// garantia (mesmo caso do maxLength: é só uma dica), então isto é a garantia
// de verdade, sempre aplicada, independente do que a IA devolveu. Exportada
// porque qualquer chamada direta à IA nesta base (não só a geração de posts)
// precisa da mesma garantia — ver calendario-mensal.service.ts.
export function removerTravessoes(texto: string): string {
  return texto.replace(/\s*[—–]\s*/g, ', ').trim()
}

// Garantia real sobre TODO campo de texto de um slide gerado (headline,
// title, text, tagline, hint, itens de lista) — não só a legenda:
// remove travessão (doc editorial estende essa regra a "arte, legenda e
// chamadas", não só à legenda) e trunca no limite de caractere do layout
// quando declarado. Nunca corta no meio da palavra (achado real: "código"
// virando "códig" numa capa de verdade).
function limparCamposDeTexto(slide: Slide): Slide {
  const resultado = { ...slide } as unknown as Record<string, unknown>
  for (const campo of CAMPOS_POR_LAYOUT[slide.layout] ?? []) {
    const valor = resultado[campo.nome]
    if (typeof valor === 'string') {
      let limpo = removerTravessoes(valor)
      if (campo.maxLength && limpo.length > campo.maxLength) limpo = truncarPorPalavra(limpo, campo.maxLength)
      resultado[campo.nome] = limpo
    } else if (Array.isArray(valor)) {
      resultado[campo.nome] = valor.map((item) => (typeof item === 'string' ? removerTravessoes(item) : item))
    }
  }
  return resultado as unknown as Slide
}

// `buscaImagem`/`buscaImagemPexels` são só hints pro chamador resolver a
// foto depois (ver `RascunhoGerado.buscasImagem`) — nunca deveriam persistir
// no Slide final. Compartilhado pelos dois mecanismos de merge abaixo.
function conteudoSemHints(gerado: Record<string, unknown>): Record<string, unknown> {
  const { layout: _layout, buscaImagem: _buscaImagem, buscaImagemPexels: _buscaImagemPexels, ...conteudo } = gerado
  return conteudo
}

// Mescla exigindo tamanho E sequência de layout EXATOS contra um esqueleto
// pré-montado — usado sempre que a contagem de slides não varia (tweet,
// gráfico, adaptação por rede reaproveitando a estrutura do post original).
function mesclarConteudoNaSkeleton(skeleton: Slide[], gerados: unknown): Slide[] {
  if (!Array.isArray(gerados)) throw new Error('IA não retornou um array de slides')
  if (gerados.length !== skeleton.length) {
    throw new Error(`IA gerou ${gerados.length} slides, a receita espera ${skeleton.length}`)
  }
  return skeleton.map((base, i) => {
    const gerado = gerados[i] as Record<string, unknown>
    if (gerado.layout !== base.layout) {
      throw new Error(`slide ${i + 1}: IA retornou layout "${String(gerado.layout)}", esperado "${base.layout}"`)
    }
    return limparCamposDeTexto({ ...base, ...conteudoSemHints(gerado) } as Slide)
  })
}

// Mescla aceitando uma CONTAGEM VARIÁVEL de slides dentro de
// [minTelas,maxTelas] — usada pelo estilo "padrao" (doc editorial: "extensão
// conforme narrativa, até dez telas"). O esqueleto (tema/full/logoTop/
// variante) só pode ser calculado DEPOIS de saber a sequência de layouts que
// a IA de fato escolheu, por isso não recebe um `skeleton` pronto como a
// função acima — monta um na hora via `aplicarMetadadosSlides`.
function mesclarConteudoFlexivel(
  tipo: TipoConteudo,
  layoutsPermitidos: Layout[],
  minTelas: number,
  maxTelas: number,
  capaLayout: Layout,
  gerados: unknown,
): Slide[] {
  if (!Array.isArray(gerados)) throw new Error('IA não retornou um array de slides')
  // Nunca descarta a geração inteira só por exceder o teto (seria desperdiçar
  // uma chamada de IA inteira) — corta o excedente do meio, preservando a
  // capa (posição 0) e o fecho (última posição, ex.: o slide de CTA), que são
  // os dois pontos mais caros de perder.
  const ajustados = gerados.length > maxTelas ? [...gerados.slice(0, maxTelas - 1), gerados[gerados.length - 1]] : gerados
  if (ajustados.length < minTelas) {
    throw new Error(`IA gerou ${ajustados.length} slides, o tipo "${tipo}" exige pelo menos ${minTelas}`)
  }

  const layouts = ajustados.map((g, i) => {
    const layout = (g as Record<string, unknown>).layout as Layout
    if (!layoutsPermitidos.includes(layout)) {
      throw new Error(`slide ${i + 1}: layout "${String(layout)}" não é usado pelo tipo "${tipo}"`)
    }
    return layout
  })
  if (layouts[0] !== capaLayout) {
    throw new Error(`o primeiro slide precisa ser a capa ("${capaLayout}"), veio "${layouts[0]}"`)
  }

  const base = aplicarMetadadosSlides(tipo, layouts)
  return base.map((baseSlide, i) => {
    const gerado = ajustados[i] as Record<string, unknown>
    return limparCamposDeTexto({ ...baseSlide, ...conteudoSemHints(gerado) } as Slide)
  })
}

export interface BuscaImagemSlide {
  // Descrição em português — usada pra tentar casar com a Galeria do Perfil.
  descricao: string
  // Mesma ideia, em inglês e em palavras-chave de banco de imagens — usada só
  // no fallback pro Pexels (que indexa majoritariamente em inglês).
  pexels: string
}

export interface RascunhoGerado {
  caption: string
  hashtags: string
  slides: Slide[]
  nomePost?: string
  // Um hint por slide (mesma ordem de `slides`) de que busca de imagem faria
  // sentido pra aquele card — `null` quando a IA não sugeriu nada pra ele.
  // Só populado quando `sugerirImagem` foi pedido; quem chama decide como (e
  // se) resolve isso numa imagem de verdade.
  buscasImagem?: (BuscaImagemSlide | null)[]
}

// Doc editorial: "até cinco hashtags pertinentes, podendo ser menos; não
// preencher cinco posições com termos genéricos". `maxHashtags` varia por
// chamador (5 na geração principal, a faixa por rede na adaptação) — corte
// de verdade, não só um pedido no prompt (mesmo padrão de garantia já usado
// em maxLength/travessão).
function limitarHashtags(hashtags: string, maxHashtags: number): string {
  return hashtags.split(/\s+/).filter(Boolean).slice(0, maxHashtags).join(' ')
}

async function chamarClaudeEExtrair(
  ferramenta: Anthropic.Tool,
  system: string,
  prompt: string,
  mesclarSlides: (gerados: unknown) => Slide[],
  maxHashtags: number,
): Promise<RascunhoGerado> {
  const claude = getClaude()
  const resposta = await claude.messages.create({
    model: env.ANTHROPIC_MODEL,
    // A tool retorna caption + hashtags + slides[] (um carrossel inteiro) — com
    // 2000 tokens o JSON truncava em posts com muitos cards (campos ausentes ->
    // 502). 8000 cobre o pior caso; para no end_turn bem antes em posts curtos.
    max_tokens: 8000,
    system,
    messages: [{ role: 'user', content: prompt }],
    tools: [ferramenta],
    tool_choice: { type: 'tool', name: ferramenta.name },
  })

  const chamada = resposta.content.find((bloco) => bloco.type === 'tool_use')
  if (!chamada || chamada.type !== 'tool_use') {
    throw new Error(`Claude não retornou a ferramenta "${ferramenta.name}" esperada`)
  }

  const entrada = chamada.input as { caption?: unknown; hashtags?: unknown; slides?: unknown; nomePost?: unknown }
  if (typeof entrada.caption !== 'string' || typeof entrada.hashtags !== 'string') {
    throw new Error('Resposta da IA em formato inesperado (caption/hashtags ausentes)')
  }

  const slides = mesclarSlides(entrada.slides)
  const nomePost = typeof entrada.nomePost === 'string' ? entrada.nomePost.trim() : undefined
  const buscasImagem = Array.isArray(entrada.slides)
    ? (entrada.slides as Record<string, unknown>[]).map((s) => {
        const descricao = typeof s.buscaImagem === 'string' ? s.buscaImagem.trim() : ''
        const pexels = typeof s.buscaImagemPexels === 'string' ? s.buscaImagemPexels.trim() : ''
        return descricao && pexels ? { descricao, pexels } : null
      })
    : undefined
  return {
    caption: removerTravessoes(entrada.caption),
    hashtags: limitarHashtags(entrada.hashtags.toLowerCase(), maxHashtags),
    slides,
    nomePost,
    buscasImagem,
  }
}

// Regras fixas de escrita, aplicadas em toda chamada (geração original e
// adaptação por rede) — reforço no prompt além do filtro de código em
// `removerTravessoes`/`.toLowerCase()`, que é quem garante de fato.
const REGRAS_FIXAS_DE_ESCRITA =
  'Nunca use travessão (—) em nada que escrever: é um tique visual que denuncia texto gerado por IA. Prefira vírgula, dois-pontos ou separar em duas frases. Hashtags sempre em letra minúscula.'

// Doc editorial (§15): repertório de inspiração pro gancho de abertura —
// nunca sorteio cego, nunca obrigatório, nunca repetido sempre igual. Some o
// banco condensado com o veto explícito aos padrões de resposta automática
// (§9: "evitar '5 dicas para', 'Como fazer'...").
function linhaGanchos(): string {
  const banco = BANCO_GANCHOS.map((c) => `${c.nome}: ${c.frases.join('; ')}`).join('\n')
  return `Banco de ganchos disponível como inspiração pra abertura/capa (selecione com critério pro contexto desta marca — nunca sorteie, nunca é obrigatório usar um daqui, nunca repita o mesmo em posts seguidos; histórias/erros/experimentos citados precisam ter base real no contexto/briefing, nunca virar fato inventado):\n${banco}\nNunca abra com um padrão de resposta automática genérica — proibido "${GANCHOS_PROIBIDOS.join('", "')}" ou variações óbvias disso. Crie identificação, curiosidade, tensão pertinente, opinião sustentada ou pergunta que interesse ao público; o recorte precisa ser específico do assunto, nunca genérico.`
}

function systemComContexto(instrucao: string, contextoMarkdown: string): string {
  return `${instrucao} ${REGRAS_FIXAS_DE_ESCRITA}\n\n## Contexto da marca\n${contextoMarkdown || '(nenhum contexto registrado ainda pra este Perfil — escreva de forma genérica, mas profissional)'}`
}

export async function gerarRascunhoComIA(
  tipo: TipoConteudo,
  contextoMarkdown: string,
  briefing?: string,
  nomeManual?: string,
  estilo: EstiloVisual = 'padrao',
  temaAlternativo: Tema = 'ink',
  metodoConversao?: MetodoConversao,
): Promise<RascunhoGerado> {
  const receita = receitaDe(tipo)
  // No estilo "padrao", a contagem de telas é flexível dentro de
  // [minTelas,maxTelas] (doc editorial) — os layouts permitidos vêm de
  // `receita.receita` (o conjunto de layouts já previstos pro tipo), não de
  // um esqueleto de tamanho fixo. Nos estilos "tweet"/"grafico" a contagem
  // continua fixa (mesmo mecanismo de sempre, via `montarSlidesPadrao`).
  const flexivel = estilo === 'padrao'
  const layoutsDistintos = flexivel ? [...new Set(receita.receita)] : [...new Set(montarSlidesPadrao(tipo, estilo, temaAlternativo).map((s) => s.layout))]
  // Se o usuário já deu um nome, não precisa pedir pra IA inventar um — só
  // usa o dele. Sem nome manual, pede pra IA sugerir um (em vez de deixar o
  // post nomeado só pelo tipo genérico, "Dor-1"/"Oferta-1"/etc., que não
  // ajuda a diferenciar posts do mesmo tipo na grade).
  // `sugerirImagem` liga pros dois estilos agora (validado primeiro só no
  // "tweet", como prova de conceito). Imagem OBRIGATÓRIA só pra capa (regra
  // do usuário: "capa sempre com formato humanizado e texto flutuante",
  // qualquer que seja o Layout dela) e pro layout `photo` sempre que ele
  // aparecer (é o único layout cuja função é carregar uma foto — capa
  // full-bleed OU cartão híbrido sobre fundo flat). Os demais layouts
  // (word/split/item/list/cta/bottom/enquete) ficam com a foto OPCIONAL —
  // sugerirImagem já cobre isso, a IA decide por slide, criando variação
  // real entre telas flat (informativas) e humanizadas no mesmo carrossel,
  // em vez de lotar o carrossel inteiro de fotos.
  // Prova Social nunca sugere imagem automática (Galeria/Pexels): o print de
  // depoimento tem que ser um material real, escolhido manualmente pelo
  // usuário na pasta "Prova Social" da Galeria — nunca uma foto de banco de
  // imagens fingindo ser evidência (regra explícita do doc editorial).
  const layoutsComImagemObrigatoria = flexivel ? [...new Set([receita.capa.layout, 'photo' as const])] : []
  const ferramenta = montarFerramentaGeracao(tipo, layoutsDistintos, {
    incluirNome: !nomeManual,
    sugerirImagem: tipo !== 'prova_social',
    layoutsComImagemObrigatoria,
    metodoConversao,
    ...(flexivel ? { minTelas: receita.minTelas, maxTelas: receita.maxTelas } : {}),
  })

  const prompt = [
    `Gere o conteúdo de um post do tipo "${receita.nome}" (${receita.objetivo}).`,
    `Tom: ${receita.tom}`,
    estilo === 'tweet'
      ? `Este post vai ser publicado como um carrossel de ${receita.receita.length} cards no estilo "publicação de rede social", formando uma thread — cada card é uma continuação do anterior, seguindo a mesma progressão narrativa que a receita original deste tipo usaria (${receita.receita.join(' → ')}), só que cada etapa vira um card de texto em vez de foto/gráfico. IMPORTANTE: esse formato existe pra reter quem JÁ segue o perfil com conteúdo que vale a pena ler — cada card precisa ter um parágrafo completo e explicativo (uma ou duas frases de verdade, com profundidade e contexto), NUNCA uma palavra solta, um número isolado ou uma frase de efeito curta demais (nada como "4h → 8min" ou "Silêncio." sozinho num card — isso quebra a premissa do formato). O primeiro card é o gancho; os do meio desenvolvem com profundidade real; o último fecha com a chamada pra ação.`
      : estilo === 'grafico'
        ? `Este post é uma peça única (não um carrossel) com um gráfico de barras — escreva só o título e o subtítulo (o campo "barras", com os números de verdade, é preenchido manualmente depois por quem usa a ferramenta, você NÃO tem esse dado). O título precisa funcionar sozinho como a pergunta/afirmação que o gráfico responde.`
        : `Use entre ${receita.minTelas} e ${receita.maxTelas} telas (referência de ${receita.receita.length}, reaproveitando só os layouts já previstos pro tipo: ${layoutsDistintos.join(', ')}) — comece pelo layout de capa ("${receita.capa.layout}") e desenvolva na ordem que fizer mais sentido pra narrativa. A capa e todo slide de layout "photo" sempre levam uma foto de fundo (sugira o que buscar nos campos buscaImagem/buscaImagemPexels — ela é buscada automaticamente a partir dessa descrição, você não precisa se preocupar em como). Nos demais slides, a foto de fundo é o PADRÃO esperado, não a exceção — a ambientação com foto é o que faz o carrossel parecer sofisticado, então sugira imagem pra quase todos eles. No MÁXIMO 1 ou 2 telas do carrossel inteiro podem ficar só com texto sobre fundo da marca (sem foto), e só quando aquele conteúdo específico for claramente mais direto assim (ex.: uma lista rápida, um dado isolado) — isso é a exceção pontual, nunca a maioria das telas.`,
    receita.nota ? `Como usar essa receita: ${receita.nota}` : null,
    `Chamada pra ação: ${receita.cta}`,
    `Como esse tipo deveria se destacar na grade do perfil: ${receita.naGrade}`,
    estilo !== 'grafico' ? linhaGanchos() : null,
    briefing ? `Pedido específico pra este post: ${briefing}` : null,
    !nomeManual
      ? 'Sugira também um nome curto pro post (ver descrição do campo "nomePost") — específico o suficiente pra reconhecer esse post entre outros do mesmo tipo.'
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const system = systemComContexto(
    'Você escreve o conteúdo de posts de Instagram pra uma marca, seguindo o contexto de marca abaixo e respeitando os limites de caracteres de cada campo (descritos na ferramenta).',
    contextoMarkdown,
  )
  const mesclarSlides = flexivel
    ? (gerados: unknown) => mesclarConteudoFlexivel(tipo, layoutsDistintos, receita.minTelas, receita.maxTelas, receita.capa.layout, gerados)
    : (gerados: unknown) => mesclarConteudoNaSkeleton(montarSlidesPadrao(tipo, estilo, temaAlternativo), gerados)
  const resultado = await chamarClaudeEExtrair(ferramenta, system, prompt, mesclarSlides, MAX_HASHTAGS_PADRAO)
  // Título travado em "Feedback" (doc editorial) — nunca aceito da IA, nem
  // pedido a ela: sobrescreve o que quer que tenha vindo no schema genérico
  // de `photo`.
  if (tipo === 'prova_social') resultado.slides[0].headline = 'Feedback'
  return nomeManual ? { ...resultado, nomePost: nomeManual } : resultado
}

// Cada rede converte diferente — mesma estrutura de slides do post original
// (a receita de layouts ainda não varia por rede, isso é uma etapa de design
// de conteúdo à parte), mas o texto é reescrito pensando em como aquela rede
// específica se comporta, respeitando a faixa de hashtag dela.
export async function adaptarRascunhoParaRede(
  tipo: TipoConteudo,
  contextoMarkdown: string,
  slidesAtuais: Slide[],
  rede: RedeSocial,
  estiloVisual: EstiloVisual = 'padrao',
): Promise<RascunhoGerado> {
  const receita = receitaDe(tipo)
  const limite = LIMITES_HASHTAG_POR_REDE[rede]
  const nomeRede = REDE_NOME[rede]
  const estiloLegenda = ESTILO_LEGENDA_POR_REDE[rede]
  const ehGraficoParaLinkedin = rede === 'linkedin' && estiloVisual === 'grafico'

  // LinkedIn não funciona como carrossel: uma imagem só. Pro estilo "padrao"
  // isso vira a capa do tipo reescrita como gancho (a explicação fica pra
  // legenda, grande e explicativa). Pro estilo "grafico" o post JÁ é 1
  // imagem só (o gráfico de barras) — reaproveita ele direto, nunca troca
  // pela capa do tipo (perderia o gráfico inteiro, incluindo os números
  // reais). Instagram/TikTok continuam reaproveitando a mesma estrutura do
  // post principal, como já era.
  const skeleton: Slide[] =
    rede === 'linkedin' ? (estiloVisual === 'grafico' ? slidesAtuais : montarSlidesPadrao(tipo).slice(0, 1)) : slidesAtuais
  const layoutsDistintos = [...new Set(skeleton.map((s) => s.layout))]

  const ferramenta = montarFerramentaGeracao(tipo, layoutsDistintos, {
    hashtagsDescricao: `Hashtags pro ${nomeRede}, separadas por espaço, cada uma começando com #. Use entre ${limite.min} e ${limite.max} hashtags — nem mais, nem menos.`,
    captionDescricao: `Legenda pro ${nomeRede}. ${estiloLegenda}`,
  })

  const instrucaoEstrutura = ehGraficoParaLinkedin
    ? `Este post é um gráfico de barras (não um carrossel), e a imagem final pro LinkedIn é a MESMA peça original: só o título e o subtítulo são reescritos pro tom do LinkedIn (mais consultivo, menos vendedor). Os números do gráfico já são reais e fixos, escolhidos manualmente por quem usa a ferramenta — você não tem esse dado e nunca deve inventar um novo.`
    : rede === 'linkedin'
      ? `O LinkedIn não funciona como carrossel: gere só 1 imagem (layout "${skeleton[0].layout}"). Ela precisa funcionar sozinha como gancho, não como explicação — o texto dessa imagem deve despertar curiosidade e puxar quem vê pra ler a legenda, nunca tentar contar a história inteira ali. É a legenda (grande, explicativa) que carrega o conteúdo de verdade.`
      : `Adapte o conteúdo do post abaixo pra publicar no ${nomeRede}, mantendo exatamente a mesma quantidade e ordem de slides (${skeleton.map((s) => s.layout).join(' → ')}).`

  const prompt = [
    instrucaoEstrutura,
    `Não é o mesmo texto reaproveitado: reescreva pensando em como quem usa o ${nomeRede} costuma consumir e reagir a conteúdo — o que funciona no Instagram não é o que funciona no ${nomeRede}.`,
    `Como escrever a legenda pro ${nomeRede} (siga isso à risca, não repita o formato de Instagram): ${estiloLegenda}`,
    `Tom geral do post (mantenha a essência, adapte a voz): ${receita.tom}`,
    receita.nota ? `Como essa receita foi pensada pra funcionar (preserve a lógica ao reescrever): ${receita.nota}` : null,
    `Conteúdo atual do post, como referência pra adaptar (não copie literalmente):`,
    JSON.stringify(slidesAtuais),
  ]
    .filter(Boolean)
    .join('\n')

  const system = systemComContexto(
    `Você adapta o conteúdo de um post existente pra publicar no ${nomeRede}, seguindo o contexto de marca abaixo.`,
    contextoMarkdown,
  )
  return chamarClaudeEExtrair(ferramenta, system, prompt, (gerados) => mesclarConteudoNaSkeleton(skeleton, gerados), limite.max)
}
