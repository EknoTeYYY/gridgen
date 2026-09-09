import type Anthropic from '@anthropic-ai/sdk'
import {
  CAMPOS_POR_LAYOUT,
  ESTILO_LEGENDA_POR_REDE,
  LIMITES_HASHTAG_POR_REDE,
  montarSlidesPadrao,
  receitaDe,
  REDE_NOME,
  type CampoSlide,
  type EstiloVisual,
  type Layout,
  type RedeSocial,
  type Slide,
  type Tema,
  type TipoConteudo,
} from '@gridgen/shared'
import { getClaude } from '../../lib/claude.js'
import { env } from '../../env.js'

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
// fallback). `exigirImagem` decide se isso é opcional ou obrigatório:
// no estilo "tweet" a foto é sempre supérflua (a IA decide por slide se
// ajuda), mas no estilo "padrão" o layout `photo` só existe na receita
// JUSTAMENTE pra carregar uma foto — ali a sugestão é obrigatória, não uma
// escolha da IA.
function schemaParaLayout(layout: Layout, sugerirImagem: boolean, exigirImagem: boolean): Record<string, unknown> {
  const camposLayout = CAMPOS_POR_LAYOUT[layout] ?? []
  const campos = camposLayout.filter((c) => c.tipo !== 'foto')
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
        ? 'Descreva em poucas palavras concretas que foto buscar como referência pra esse slide (ex.: "pessoa respondendo mensagem no celular à noite", "escritório vazio") — esse layout sempre carrega uma foto, não deixe de preencher.'
        : 'Só preencha se uma imagem ajudaria ESSE card específico (não force em todo slide) — descreva em poucas palavras concretas o que buscar como foto de referência (ex.: "pessoa respondendo mensagem no celular à noite", "escritório vazio"). Deixe de fora da resposta se o card funciona melhor só com o texto.',
    }
    properties.buscaImagemPexels = {
      type: 'string',
      description:
        'Só preencha junto com `buscaImagem` — a MESMA ideia, mas em inglês e em 2 a 4 palavras-chave de banco de imagens (ex.: "busy office desk", "phone notification night"). Bancos como Pexels indexam majoritariamente em inglês; um termo em português busca mal lá.',
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
    exigirImagem?: boolean
  } = {},
): Anthropic.Tool {
  const {
    hashtagsDescricao = 'Hashtags relevantes, separadas por espaço, cada uma começando com #.',
    captionDescricao = 'Legenda do post, no tom de voz da marca.',
    incluirNome = false,
    sugerirImagem = false,
    exigirImagem = false,
  } = opcoes

  const properties: Record<string, unknown> = {
    caption: { type: 'string', description: captionDescricao },
    hashtags: { type: 'string', description: hashtagsDescricao },
    slides: {
      type: 'array',
      description: 'Conteúdo de cada slide, na mesma ordem e quantidade da receita.',
      items: { anyOf: layoutsDistintos.map((l) => schemaParaLayout(l, sugerirImagem, exigirImagem)) },
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

// `maxLength` no schema da ferramenta é só uma dica pra IA — o tool use da
// Anthropic não garante o limite de fato (confirmado na prática: IA já
// devolveu "22h04" pra um campo com maxLength:4). Sem isso, um `num` longo
// demais transborda o layout `split` (fonte grande, coluna estreita) e
// sobrepõe o título ao lado. Corta de verdade antes de salvar, não só pede.
// Corta no último espaço antes do limite, não no meio da palavra (achado
// real: "código" virando "códig" numa capa de verdade) — só cai pro corte
// bruto por caractere se não existir nenhum espaço antes do limite (uma
// palavra só, maior que o limite inteiro).
function truncarPorPalavra(valor: string, maxLength: number): string {
  const cortado = valor.slice(0, maxLength)
  const ultimoEspaco = cortado.lastIndexOf(' ')
  return ultimoEspaco > 0 ? cortado.slice(0, ultimoEspaco).trimEnd() : cortado
}

function truncarCamposLongos(slide: Slide): Slide {
  const resultado = { ...slide } as unknown as Record<string, unknown>
  for (const campo of CAMPOS_POR_LAYOUT[slide.layout] ?? []) {
    if (!campo.maxLength) continue
    const valor = resultado[campo.nome]
    if (typeof valor === 'string' && valor.length > campo.maxLength) {
      resultado[campo.nome] = truncarPorPalavra(valor, campo.maxLength)
    }
  }
  return resultado as unknown as Slide
}

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
    // `buscaImagem`/`buscaImagemPexels` são só hints pro chamador resolver a
    // foto depois (ver `RascunhoGerado.buscasImagem`) — nunca deveriam
    // persistir no Slide final.
    const { layout: _layout, buscaImagem: _buscaImagem, buscaImagemPexels: _buscaImagemPexels, ...conteudo } = gerado
    return truncarCamposLongos({ ...base, ...conteudo } as Slide)
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

// Travessão (—) é o maior "tique" de texto gerado por IA — pedido explícito
// do usuário pra bloquear de forma restrita. Instruir a IA no prompt não é
// garantia (mesmo caso do maxLength: é só uma dica), então aqui é a garantia
// de verdade, sempre aplicada, independente do que a IA devolveu.
function removerTravessoes(texto: string): string {
  return texto.replace(/\s*[—–]\s*/g, ', ').trim()
}

async function chamarClaudeEExtrair(ferramenta: Anthropic.Tool, system: string, prompt: string, skeleton: Slide[]): Promise<RascunhoGerado> {
  const claude = getClaude()
  const resposta = await claude.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 2000,
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

  const slides = mesclarConteudoNaSkeleton(skeleton, entrada.slides)
  const nomePost = typeof entrada.nomePost === 'string' ? entrada.nomePost.trim() : undefined
  const buscasImagem = Array.isArray(entrada.slides)
    ? (entrada.slides as Record<string, unknown>[]).map((s) => {
        const descricao = typeof s.buscaImagem === 'string' ? s.buscaImagem.trim() : ''
        const pexels = typeof s.buscaImagemPexels === 'string' ? s.buscaImagemPexels.trim() : ''
        return descricao && pexels ? { descricao, pexels } : null
      })
    : undefined
  return { caption: removerTravessoes(entrada.caption), hashtags: entrada.hashtags.toLowerCase(), slides, nomePost, buscasImagem }
}

// Regras fixas de escrita, aplicadas em toda chamada (geração original e
// adaptação por rede) — reforço no prompt além do filtro de código em
// `removerTravessoes`/`.toLowerCase()`, que é quem garante de fato.
const REGRAS_FIXAS_DE_ESCRITA =
  'Nunca use travessão (—) em nada que escrever: é um tique visual que denuncia texto gerado por IA. Prefira vírgula, dois-pontos ou separar em duas frases. Hashtags sempre em letra minúscula.'

function systemComContexto(instrucao: string, contextoMarkdown: string): string {
  return `${instrucao} ${REGRAS_FIXAS_DE_ESCRITA}\n\n## Contexto da marca\n${contextoMarkdown || '(nenhum contexto registrado ainda pra este Perfil — escreva de forma genérica, mas profissional)'}`
}

export async function gerarRascunhoComIA(
  tipo: TipoConteudo,
  contextoMarkdown: string,
  briefing?: string,
  nomeManual?: string,
  estilo: EstiloVisual = 'padrao',
  temaTweet: Tema = 'ink',
): Promise<RascunhoGerado> {
  const receita = receitaDe(tipo)
  const skeleton = montarSlidesPadrao(tipo, estilo, temaTweet)
  // Deriva do esqueleto de verdade, não de `receita.receita` — no estilo
  // "tweet" isso já vira só `['tweet']`, mesmo a receita original tendo
  // vários layouts diferentes (photo/split/word/...).
  const layoutsDistintos = [...new Set(skeleton.map((s) => s.layout))]
  // Se o usuário já deu um nome, não precisa pedir pra IA inventar um — só
  // usa o dele. Sem nome manual, pede pra IA sugerir um (em vez de deixar o
  // post nomeado só pelo tipo genérico, "Dor-1"/"Oferta-1"/etc., que não
  // ajuda a diferenciar posts do mesmo tipo na grade).
  // `sugerirImagem` liga pros dois estilos agora (validado primeiro só no
  // "tweet", como prova de conceito). `exigirImagem` só liga no "padrão" —
  // lá o layout `photo` está na receita justamente pra carregar uma foto,
  // não é uma escolha opcional da IA como é no card de tweet.
  const ferramenta = montarFerramentaGeracao(tipo, layoutsDistintos, {
    incluirNome: !nomeManual,
    sugerirImagem: true,
    exigirImagem: estilo === 'padrao',
  })

  const prompt = [
    `Gere o conteúdo de um post do tipo "${receita.nome}" (${receita.objetivo}).`,
    `Tom: ${receita.tom}`,
    estilo === 'tweet'
      ? `Este post vai ser publicado como um carrossel de ${skeleton.length} cards no estilo "publicação de rede social", formando uma thread — cada card é uma continuação do anterior, seguindo a mesma progressão narrativa que a receita original deste tipo usaria (${receita.receita.join(' → ')}), só que cada etapa vira um card de texto em vez de foto/gráfico. IMPORTANTE: esse formato existe pra reter quem JÁ segue o perfil com conteúdo que vale a pena ler — cada card precisa ter um parágrafo completo e explicativo (uma ou duas frases de verdade, com profundidade e contexto), NUNCA uma palavra solta, um número isolado ou uma frase de efeito curta demais (nada como "4h → 8min" ou "Silêncio." sozinho num card — isso quebra a premissa do formato). O primeiro card é o gancho; os do meio desenvolvem com profundidade real; o último fecha com a chamada pra ação.`
      : `Receita de layouts, nesta ordem exata: ${receita.receita.join(' → ')}. Pra cada slide de layout "photo", sugira também que foto buscar (campos buscaImagem/buscaImagemPexels) — ela é buscada automaticamente a partir dessa descrição, você não precisa se preocupar em como.`,
    receita.nota ? `Como usar essa receita: ${receita.nota}` : null,
    `Chamada pra ação: ${receita.cta}`,
    `Como esse tipo deveria se destacar na grade do perfil: ${receita.naGrade}`,
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
  const resultado = await chamarClaudeEExtrair(ferramenta, system, prompt, skeleton)
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
): Promise<RascunhoGerado> {
  const receita = receitaDe(tipo)
  const limite = LIMITES_HASHTAG_POR_REDE[rede]
  const nomeRede = REDE_NOME[rede]
  const estiloLegenda = ESTILO_LEGENDA_POR_REDE[rede]

  // LinkedIn não funciona como carrossel: uma imagem só (a capa do tipo,
  // reescrita como gancho) + legenda grande fazendo o trabalho de explicar —
  // é assim que a rede converte de verdade (validado pelo usuário na prática).
  // Instagram/TikTok continuam reaproveitando a mesma estrutura do post
  // principal, como já era.
  const skeleton: Slide[] = rede === 'linkedin' ? montarSlidesPadrao(tipo).slice(0, 1) : slidesAtuais
  const layoutsDistintos = [...new Set(skeleton.map((s) => s.layout))]

  const ferramenta = montarFerramentaGeracao(tipo, layoutsDistintos, {
    hashtagsDescricao: `Hashtags pro ${nomeRede}, separadas por espaço, cada uma começando com #. Use entre ${limite.min} e ${limite.max} hashtags — nem mais, nem menos.`,
    captionDescricao: `Legenda pro ${nomeRede}. ${estiloLegenda}`,
  })

  const instrucaoEstrutura =
    rede === 'linkedin'
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
  return chamarClaudeEExtrair(ferramenta, system, prompt, skeleton)
}
