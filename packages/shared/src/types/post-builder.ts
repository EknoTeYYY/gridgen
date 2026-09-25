// Migrado do novo.mjs original: monta o esqueleto de slides de um post a
// partir da receita do tipo, e descreve que campos cada layout precisa — pra
// api validar e pro frontend construir o formulário dinamicamente. Antes
// vivia só como script de CLI; agora é lógica compartilhada de verdade.
import type { EstiloVisual, Layout, Slide, Tema, TipoConteudo } from './post.js'
import { receitaDe } from './tipos.js'
import { sortearVariante, VARIANTES_CAPA, VARIANTES_INTERNA } from './variantes.js'

// Monta o metadado visual (tema/full/logoTop/variante) de um carrossel do
// estilo "padrao" a partir de uma sequência de LAYOUTS já decidida —
// extraído de `montarSlidesPadrao` pra ser reaproveitado tanto pela sequência
// padrão do tipo (`receita.receita`) quanto pela sequência que a IA de fato
// devolveu quando gera dentro de uma faixa min/max de telas (a contagem pode
// variar; o tratamento visual de capa/corpo continua o mesmo). Índice 0 é
// sempre tratado como a capa do tipo.
export function aplicarMetadadosSlides(tipo: TipoConteudo, layouts: Layout[]): Slide[] {
  const receita = receitaDe(tipo)
  // Sorteia 1 variante por combinação (layout, capa ou uso interno) presente
  // nesta sequência — todo slide que usa o MESMO layout na MESMA posição
  // (capa ou não) sai com a mesma composição, pra manter consistência visual
  // dentro do próprio carrossel. O sorteio é por chamada, então o próximo
  // post do mesmo tipo tende a sair diferente (achado real do usuário: hoje
  // todo post do mesmo tipo tem a cara idêntica).
  const varianteCapa = sortearVariante(VARIANTES_CAPA, layouts[0])
  const variantesInternas = new Map<Layout, number>()
  for (const layout of layouts.slice(1)) {
    if (!variantesInternas.has(layout)) variantesInternas.set(layout, sortearVariante(VARIANTES_INTERNA, layout))
  }

  return layouts.map((layout, i) => {
    const slide: Slide = { layout }
    if (i === 0) {
      slide.theme = receita.capa.theme
      if (receita.capa.full) slide.full = true
      slide.logoTop = layout !== 'logocover'
      slide.variante = varianteCapa
    } else {
      slide.theme = receita.temaInterno
      slide.variante = variantesInternas.get(layout)
    }
    return slide
  })
}

// `estilo` decide COMO o carrossel fica visualmente; o `tipo` continua
// decidindo quantas "telas" a narrativa precisa por padrão
// (`receita.receita.length`) — no estilo "tweet", só a quantidade de slides
// da receita é reaproveitada, não a sequência de layouts nem o tratamento de
// capa (tema/full/logoTop não se aplicam a um card de tweet, que tem sua
// própria composição fixa). No estilo "padrao", esta função devolve a
// sequência PADRÃO (usada como esqueleto de preview/edição manual) — a
// geração por IA de verdade pode variar essa contagem dentro da faixa
// `minTelas`/`maxTelas` do tipo (ver `geracao.service.ts`).
export function montarSlidesPadrao(tipo: TipoConteudo, estilo: EstiloVisual = 'padrao', temaAlternativo: Tema = 'ink'): Slide[] {
  const receita = receitaDe(tipo)
  if (estilo === 'tweet') {
    return receita.receita.map(() => ({ layout: 'tweet' as Layout, theme: temaAlternativo }))
  }
  // Peça estática única, não um carrossel narrativo — a contagem de slides
  // da receita não se aplica aqui (diferente do "tweet", que reaproveita a
  // contagem). O conteúdo numérico (`barras`) nunca vem da IA, então nasce
  // vazio: o usuário preenche na tela de edição antes de gerar a imagem.
  if (estilo === 'grafico') {
    return [{ layout: 'grafico' as Layout, theme: temaAlternativo, logoTop: true }]
  }
  return aplicarMetadadosSlides(tipo, receita.receita)
}

export type TipoCampoSlide = 'texto' | 'texto-longo' | 'lista' | 'foto' | 'url' | 'grafico-itens'

export interface CampoSlide {
  nome: keyof Slide
  label: string
  tipo: TipoCampoSlide
  maxLength?: number
  // Só vira dica no schema da ferramenta de IA (`geracao.service.ts`) — não
  // tem como "completar" um texto curto demais depois, diferente do
  // `maxLength` (que dá pra truncar de verdade). Não afeta o formulário
  // editável, que não valida tamanho mínimo nenhum.
  minLength?: number
  placeholder?: string
  // Ausência aqui vira o texto literal "undefined" na imagem renderizada (o
  // motor interpola o valor direto) — por padrão todo campo é obrigatório;
  // só os marcados aqui podem ficar vazios.
  opcional?: boolean
  // Descrição usada no schema da ferramenta de IA, no lugar de `label`, só
  // quando o rótulo de formulário (pensado pra um humano preencher) não
  // ajuda a IA a escrever bem. Direção genérica de craft por LAYOUT — nunca
  // deveria carregar lógica narrativa específica de um TIPO de conteúdo só
  // (isso é papel do campo `nota` em cada `ReceitaTipo`, em tipos.ts), porque
  // o mesmo layout aparece em receitas de tipos diferentes com intenções
  // diferentes. Não afeta o formulário editável, que continua usando `label`.
  direcaoIA?: string
}

// Achado real: sem direção própria, a IA às vezes escrevia um complemento
// curto demais pra fazer sentido sozinho (ex.: "Você ainda está na
// primeira" — primeira o quê?), exigindo interpretação demais de quem lê em
// menos de 1 segundo, que é o tempo real de atenção num slide de carrossel.
const HINT: CampoSlide = {
  nome: 'hint',
  label: 'Legenda pequena (opcional)',
  tipo: 'texto',
  maxLength: 60,
  opcional: true,
  direcaoIA:
    'Um complemento curto que precisa fazer sentido sozinho, sem depender de interpretar o headline junto: quem lê em menos de 1 segundo já entende do que se trata. Nunca corte uma frase pela metade só pra caber no limite de caracteres.',
}

// Achado real do usuário: fundo de foto + texto flutuante lê como muito mais
// sofisticado que cartão tipográfico em fundo liso (comparando com o
// carrossel do corretor Marcelo, todo em fotos reais do imóvel) — o cartão
// liso devia virar exceção rara, não o padrão. Esse campo, igual ao de
// `photo`, é resolvido automaticamente (Galeria/pasta de referência da
// publicação/Pexels, nessa ordem) — o usuário não precisa anexar nada à mão
// pros layouts tipográficos ganharem fundo de foto.
const FOTO_FUNDO: CampoSlide = { nome: 'photoDataUri', label: 'Foto de fundo (opcional)', tipo: 'foto' }

export const CAMPOS_POR_LAYOUT: Record<Layout, CampoSlide[]> = {
  logocover: [{ nome: 'tagline', label: 'Tagline sob a logo', tipo: 'texto', maxLength: 60 }],
  cover: [
    FOTO_FUNDO,
    {
      nome: 'headline',
      label: 'Frase que para o scroll',
      tipo: 'texto-longo',
      maxLength: 64,
      direcaoIA: 'A frase mais forte do post inteiro — precisa parar o scroll sozinha, sem contexto. Seja específico, não genérico.',
    },
    HINT,
  ],
  statement: [{ nome: 'headline', label: 'Frase', tipo: 'texto-longo', maxLength: 80 }],
  word: [
    FOTO_FUNDO,
    {
      nome: 'headline',
      label: '3 a 6 palavras (use <em>uma</em> pra destacar)',
      tipo: 'texto-longo',
      maxLength: 60,
      direcaoIA:
        'Frase de impacto bem curta que sintetiza o ponto do slide anterior — não repita o que já foi dito, condense. Envolva a palavra ou expressão mais forte da frase em <em>...</em> (ex.: "Sua <em>escolha</em>."), pra ela ganhar destaque visual — sempre inclua pelo menos uma.',
    },
    HINT,
  ],
  bottom: [FOTO_FUNDO, { nome: 'headline', label: 'Frase de respiro, mais longa', tipo: 'texto-longo', maxLength: 100 }],
  split: [
    FOTO_FUNDO,
    {
      nome: 'title',
      label: 'Título',
      tipo: 'texto',
      maxLength: 28,
      direcaoIA: 'Nome curto e concreto desse passo da cena — não uma frase de efeito genérica.',
    },
    {
      nome: 'text',
      label: 'Explicação',
      tipo: 'texto-longo',
      maxLength: 110,
      direcaoIA: 'Uma frase grounded e específica que continua a cena do slide anterior — não um conselho ou benefício genérico.',
    },
  ],
  item: [
    FOTO_FUNDO,
    {
      nome: 'title',
      label: 'Título',
      tipo: 'texto',
      maxLength: 28,
      direcaoIA: 'Nome curto da ideia desse slide — algo que dá pra lembrar sozinho.',
    },
    {
      nome: 'text',
      label: 'Explicação',
      tipo: 'texto-longo',
      maxLength: 110,
      direcaoIA: 'Explicação concreta dessa ideia, sem jargão sem contexto — uma frase que um leigo no assunto entenderia de primeira.',
    },
  ],
  list: [
    FOTO_FUNDO,
    { nome: 'headline', label: 'Título da lista', tipo: 'texto', maxLength: 52 },
    {
      nome: 'items',
      label: 'Itens (um por linha)',
      tipo: 'lista',
      direcaoIA: 'Itens curtos e concretos — cada um deve poder ser lido e entendido em menos de 2 segundos.',
    },
  ],
  photo: [
    { nome: 'photoDataUri', label: 'Foto', tipo: 'foto' },
    {
      nome: 'headline',
      label: 'Frase sobre a foto',
      tipo: 'texto-longo',
      maxLength: 64,
      direcaoIA:
        'Frase curta que funciona como legenda de uma cena real — mesmo sem saber qual foto será usada, escreva algo concreto, não uma frase genérica de marketing.',
    },
    HINT,
  ],
  cta: [
    FOTO_FUNDO,
    { nome: 'headline', label: 'O convite', tipo: 'texto-longo', maxLength: 90 },
    // Nunca vem da IA (ver MetodoConversao em conversao.ts) — resolvido no
    // servidor a partir do Perfil (telefone, url do site) ou de um texto fixo
    // ("Link na bio"), conforme o método de conversão escolhido. Opcional
    // porque, sem o dado do Perfil (ex.: telefone não preenchido), a peça
    // sai só com o convite, sem destino — não bloqueia a geração.
    { nome: 'url', label: 'Destino (telefone / link)', tipo: 'url', opcional: true },
  ],
  tweet: [
    // Opcional, igual ao campo de foto do layout `photo` (`camposFaltando`
    // ignora campo de foto por padrão) — imagem de referência/contexto que
    // aparece dentro do próprio card, entre o cabeçalho e o texto.
    { nome: 'photoDataUri', label: 'Imagem de referência (opcional)', tipo: 'foto' },
    {
      nome: 'text',
      label: 'Texto do tweet',
      tipo: 'texto-longo',
      maxLength: 260,
      minLength: 80,
      direcaoIA:
        'Texto de um card de uma thread explicativa — precisa ser uma ideia completa e desenvolvida (uma ou duas frases de verdade, com contexto e profundidade). NUNCA uma palavra solta, um número isolado ou uma frase de efeito de 2-3 palavras: esse formato existe pra reter quem já segue o perfil com conteúdo que vale a pena ler, não frases soltas de impacto. Continue a narrativa do card anterior, sem repetir o gancho do primeiro.',
    },
  ],
  enquete: [
    FOTO_FUNDO,
    {
      nome: 'headline',
      label: 'Pergunta da enquete',
      tipo: 'texto-longo',
      maxLength: 90,
      direcaoIA:
        'Uma pergunta clara, ligada à rotina ou necessidade real do público, fácil de responder num toque — nunca genérica. Nada de duas perguntas juntas.',
    },
    {
      nome: 'items',
      label: 'Opções da enquete (2)',
      tipo: 'lista',
      direcaoIA: 'Exatamente 2 opções curtas (poucas palavras cada), fáceis de tocar no sticker de enquete do Instagram.',
    },
    { nome: 'hint', label: 'Nota/instrução (opcional)', tipo: 'texto', maxLength: 60, opcional: true },
  ],
  grafico: [
    {
      nome: 'headline',
      label: 'Título do gráfico',
      tipo: 'texto-longo',
      maxLength: 90,
      direcaoIA:
        'A pergunta ou afirmação que o gráfico responde, direta e específica (ex.: "Quantas pessoas uma empresa precisa pra gerar US$ 30 bilhões?"), nunca genérica. No máximo 12 palavras, frase completa (nunca corte uma ideia pela metade).',
    },
    {
      nome: 'text',
      label: 'Subtítulo (explica o que cada barra representa)',
      tipo: 'texto-longo',
      maxLength: 140,
      opcional: true,
      direcaoIA:
        'Uma frase curta explicando o que exatamente cada barra representa: o leitor precisa entender o gráfico sem esforço. No máximo 18 palavras, frase completa.',
    },
    // Nunca preenchido pela IA (ver `EstiloVisual`) — dado numérico real,
    // sempre digitado manualmente na tela de edição do rascunho.
    { nome: 'barras', label: 'Barras do gráfico', tipo: 'grafico-itens' },
    { nome: 'hint', label: 'Fonte / observação (opcional)', tipo: 'texto', maxLength: 160, opcional: true },
  ],
}

export interface CampoFaltando {
  slideIndex: number
  campo: keyof Slide
  label: string
}

function campoVazio(valor: unknown): boolean {
  if (valor === undefined || valor === null || valor === '') return true
  return Array.isArray(valor) && valor.length === 0
}

// Uma barra "vazia" (rótulo/valor exibido em branco, ou valor numérico
// inválido) vira texto "undefined"/altura quebrada na imagem — mesmo risco
// que motivou essa função existir, só que por dentro de um array em vez de
// um campo solto.
function barraIncompleta(item: unknown): boolean {
  if (typeof item !== 'object' || item === null) return true
  const b = item as Record<string, unknown>
  return !b.rotulo || !b.valorExibido || typeof b.valor !== 'number' || !Number.isFinite(b.valor)
}

// Roda antes de gerar as imagens — sem isso, um campo obrigatório vazio vira
// o texto literal "undefined" na imagem renderizada (o motor de render só
// interpola o valor, não valida). Bloqueante: melhor um erro em tela agora
// do que uma imagem quebrada depois.
export function camposFaltando(slides: Slide[]): CampoFaltando[] {
  const faltando: CampoFaltando[] = []
  slides.forEach((slide, slideIndex) => {
    for (const campo of CAMPOS_POR_LAYOUT[slide.layout] ?? []) {
      if (campo.opcional || campo.tipo === 'foto') continue
      if (campo.tipo === 'grafico-itens') {
        const barras = slide[campo.nome]
        // Pelo menos 2 barras — um gráfico de 1 barra só não compara nada.
        if (!Array.isArray(barras) || barras.length < 2 || barras.some(barraIncompleta)) {
          faltando.push({ slideIndex, campo: campo.nome, label: campo.label })
        }
        continue
      }
      if (campoVazio(slide[campo.nome])) faltando.push({ slideIndex, campo: campo.nome, label: campo.label })
    }
  })
  return faltando
}
