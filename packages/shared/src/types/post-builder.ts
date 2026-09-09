// Migrado do novo.mjs original: monta o esqueleto de slides de um post a
// partir da receita do tipo, e descreve que campos cada layout precisa — pra
// api validar e pro frontend construir o formulário dinamicamente. Antes
// vivia só como script de CLI; agora é lógica compartilhada de verdade.
import type { EstiloVisual, Layout, Slide, Tema, TipoConteudo } from './post.js'
import { receitaDe } from './tipos.js'
import { sortearVariante, VARIANTES_CAPA, VARIANTES_INTERNA } from './variantes.js'

// `estilo` decide COMO o carrossel fica visualmente; o `tipo` continua
// decidindo quantas "telas" a narrativa precisa (`receita.receita.length`) —
// no estilo "tweet", só a quantidade de slides da receita é reaproveitada,
// não a sequência de layouts nem o tratamento de capa (tema/full/logoTop não
// se aplicam a um card de tweet, que tem sua própria composição fixa).
export function montarSlidesPadrao(tipo: TipoConteudo, estilo: EstiloVisual = 'padrao', temaTweet: Tema = 'ink'): Slide[] {
  const receita = receitaDe(tipo)
  if (estilo === 'tweet') {
    return receita.receita.map(() => ({ layout: 'tweet' as Layout, theme: temaTweet }))
  }

  // Sorteia 1 variante por combinação (layout, capa ou uso interno) presente
  // na receita — todo slide que usa o MESMO layout na MESMA posição (capa ou
  // não) sai com a mesma composição, pra manter consistência visual dentro
  // do próprio carrossel. O sorteio é por chamada, então o próximo post do
  // mesmo tipo tende a sair diferente (achado real do usuário: hoje todo
  // post do mesmo tipo tem a cara idêntica).
  const varianteCapa = sortearVariante(VARIANTES_CAPA, receita.receita[0])
  const variantesInternas = new Map<Layout, number>()
  for (const layout of receita.receita.slice(1)) {
    if (!variantesInternas.has(layout)) variantesInternas.set(layout, sortearVariante(VARIANTES_INTERNA, layout))
  }

  return receita.receita.map((layout, i) => {
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

export type TipoCampoSlide = 'texto' | 'texto-longo' | 'numero' | 'lista' | 'foto' | 'url'

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

// Achado real: sem instrução própria, a IA às vezes escrevia literalmente o
// nome do tipo de conteúdo ("DADO", "DOR") como kicker — genérico, sem
// nenhuma moldura narrativa. Quando funciona bem (ex.: "A CENA DE DOMINGO",
// "ENQUANTO ISSO"), o kicker ancora a cena específica daquele slide; a
// direção existe pra puxar sempre pro segundo caso.
const KICKER: CampoSlide = {
  nome: 'kicker',
  label: 'Rótulo (kicker)',
  tipo: 'texto',
  maxLength: 40,
  direcaoIA:
    'Uma etiqueta curta (2-4 palavras) que ancora a cena ESPECÍFICA desse slide — algo como "A CENA DE DOMINGO", "ENQUANTO ISSO", "O DADO REAL". NUNCA o nome do tipo de conteúdo ou uma categoria genérica (proibido: "DOR", "DADO", "PROVA", "OFERTA" sozinhos, ou qualquer variação óbvia deles).',
}
const HINT: CampoSlide = { nome: 'hint', label: 'Legenda pequena (opcional)', tipo: 'texto', maxLength: 60, opcional: true }

export const CAMPOS_POR_LAYOUT: Record<Layout, CampoSlide[]> = {
  logocover: [{ nome: 'tagline', label: 'Tagline sob a logo', tipo: 'texto', maxLength: 60 }],
  cover: [
    KICKER,
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
    KICKER,
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
  bottom: [KICKER, { nome: 'headline', label: 'Frase de respiro, mais longa', tipo: 'texto-longo', maxLength: 100 }],
  split: [
    KICKER,
    {
      nome: 'num',
      label: 'Número/passo',
      tipo: 'numero',
      maxLength: 3,
      direcaoIA:
        'Um marcador BEM CURTO (máx. 3 caracteres) que ancora esse passo da cena — um horário arredondado ("22h", não "22h04"), uma contagem, uma métrica real. Não um índice genérico como "1".',
    },
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
      maxLength: 72,
      direcaoIA: 'Uma frase grounded e específica que continua a cena do slide anterior — não um conselho ou benefício genérico.',
    },
  ],
  item: [
    KICKER,
    {
      nome: 'num',
      label: 'Número',
      tipo: 'numero',
      maxLength: 3,
      direcaoIA: 'Número do passo/ideia, na ordem certa da explicação — bem curto (ex.: "1", "2").',
    },
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
      maxLength: 72,
      direcaoIA: 'Explicação concreta dessa ideia, sem jargão sem contexto — uma frase que um leigo no assunto entenderia de primeira.',
    },
  ],
  list: [
    KICKER,
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
    KICKER,
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
    KICKER,
    { nome: 'headline', label: 'O convite', tipo: 'texto-longo', maxLength: 64 },
    { nome: 'url', label: 'URL', tipo: 'url' },
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

// Roda antes de gerar as imagens — sem isso, um campo obrigatório vazio vira
// o texto literal "undefined" na imagem renderizada (o motor de render só
// interpola o valor, não valida). Bloqueante: melhor um erro em tela agora
// do que uma imagem quebrada depois.
export function camposFaltando(slides: Slide[]): CampoFaltando[] {
  const faltando: CampoFaltando[] = []
  slides.forEach((slide, slideIndex) => {
    for (const campo of CAMPOS_POR_LAYOUT[slide.layout] ?? []) {
      if (campo.opcional || campo.tipo === 'foto') continue
      if (campoVazio(slide[campo.nome])) faltando.push({ slideIndex, campo: campo.nome, label: campo.label })
    }
  })
  return faltando
}
