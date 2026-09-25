import type { Layout, Tema, TipoConteudo } from './post.js'

/**
 * Migrado de tipos.mjs do eknotech-content-studio original. A consistência vem
 * do motor (mesmos tokens, mesmo lockup, mesma tipografia); a variedade vem
 * daqui — cada tipo de conteúdo tem sua receita de layouts.
 *
 * REGRA DO GRADIENTE: theme "brand" é usado só no logocover da âncora — o único
 * momento em que a marca é o conteúdo. Em todo o resto: foto ou "ink".
 */
export interface ReceitaTipo {
  nome: string
  objetivo: string
  quandoUsar: string
  cadencia: string
  capa: { layout: Layout; theme: Tema; full?: boolean }
  // Sequência PADRÃO de layouts — usada como esqueleto de preview/edição
  // manual, e como o conjunto de layouts que a geração por IA pode
  // reaproveitar (nunca inventa um layout fora desta lista). A contagem real
  // de um post gerado pode variar dentro de `minTelas`/`maxTelas` (doc
  // editorial: "extensão conforme narrativa, até dez telas; oito como
  // referência de carrossel longo") — não precisa bater com `receita.length`.
  receita: Layout[]
  // Faixa de telas aceitável pra este tipo (contando capa e fecho). O
  // primeiro slide sempre precisa ser `capa.layout`.
  minTelas: number
  maxTelas: number
  temaInterno: Tema
  tom: string
  cta: string
  naGrade: string
  nota?: string
}

// Taxonomia de 5 tipos + Interativo, da entrega editorial da Ellen
// (GRIDGEN-ENTREGA-PARA-ERICK.md §3, §7 e §9) — substitui os 6 tipos antigos
// (ancora/dor/prova/didatico/dado/oferta). `receita` é a sequência PADRÃO
// (esqueleto de preview/edição manual); a geração por IA de verdade pode
// devolver mais ou menos telas dentro de `minTelas`/`maxTelas`, reaproveitando
// só os layouts já listados em `receita` (nunca um layout novo) — "extensão
// conforme narrativa, até dez telas; oito como referência de carrossel
// longo" (doc §9). Ver `geracao.service.ts` pro mecanismo.
export const TIPOS: Record<TipoConteudo, ReceitaTipo> = {
  educativo: {
    nome: 'Educativo',
    objetivo: 'Ensinar algo útil, esclarecer uma dúvida real e ajudar numa decisão do público. Não é lista genérica.',
    quandoUsar: 'Uma dúvida ou conceito específico do nicho do Perfil, com exemplo prático de verdade.',
    cadencia: '1× por semana',
    capa: { layout: 'cover', theme: 'ink' },
    receita: ['cover', 'split', 'split', 'item', 'photo', 'cta'],
    minTelas: 1,
    maxTelas: 10,
    temaInterno: 'ink',
    tom: 'Professor, não guru. Parte de uma cena ou pergunta específica, desenvolve com exemplo, conclui com aplicação prática.',
    cta: 'Ajuda ou atendimento pelo canal confirmado — nunca peça pra salvar o post',
    naGrade: 'texto sobre fundo escuro — o mais sóbrio da grade, dá respiro entre as fotos',
    nota: 'Não reduzir a uma lista de dicas genéricas: uma dúvida, desenvolvida com profundidade e exemplo real, vale mais que várias dicas soltas.',
  },
  conexao: {
    nome: 'Conexão',
    objetivo: 'Demonstrar compreensão da rotina, dos desejos e das dificuldades do público — gera identificação de verdade.',
    quandoUsar: 'Toda semana tem uma cena, rotina ou dúvida do público pra nomear com empatia.',
    cadencia: '1–2× por semana',
    capa: { layout: 'photo', theme: 'ink', full: true },
    receita: ['photo', 'split', 'split', 'word', 'photo', 'cta'],
    minTelas: 1,
    maxTelas: 10,
    temaInterno: 'ink',
    tom: 'Segunda pessoa. Descreve a cena que o público vive, sem julgar. Não precisa vender em toda peça — pergunta ou convite leve também servem de fecho.',
    cta: 'Pergunta ou convite leve, sem forçar venda — puxa comentário/identificação',
    naGrade: 'foto escura sangrada — a mais fácil de reconhecer na grade',
    nota: 'Não depende de "dor": abrange identificação, desejo, história e bastidores autênticos, sem inventar vivência que a empresa não teve.',
  },
  prova_social: {
    nome: 'Prova Social',
    objetivo: 'Transmitir confiança pela opinião, feedback ou experiência real de um cliente — nunca foto de produto isolada.',
    quandoUsar: 'Sempre que existir um print de feedback real e legível — nunca fabricado.',
    cadencia: '1× por semana, quando houver material',
    capa: { layout: 'photo', theme: 'ink', full: false },
    receita: ['photo'],
    minTelas: 1,
    maxTelas: 1,
    temaInterno: 'ink',
    tom: 'Como conversa com um amigo, complementando a sensação do feedback — nunca explicando ou repetindo o elogio ao leitor.',
    cta: 'Convite concreto pra conhecer o produto/atendimento, pelo canal confirmado, quando houver convite comercial',
    naGrade: 'o print real recortado — peça única, nunca carrossel',
    nota: 'Peça única, título fixo "Feedback", sempre com um print real da pasta Prova Social da Galeria. Sem feedback real, não produzir — proponha outro tipo em vez de inventar.',
  },
  produtos_servicos: {
    nome: 'Produtos e Serviços',
    objetivo: 'Apresentar oferta real e ajudar a desejar, entender e contratar — vitrine, portfólio, demonstração, lançamento ou promoção.',
    quandoUsar: 'Sempre que houver um produto/serviço concreto pra mostrar, com condição regular ou por tempo real (nunca inventada).',
    cadencia: '1× por semana',
    capa: { layout: 'photo', theme: 'ink', full: true },
    receita: ['photo', 'list', 'photo', 'split', 'cta'],
    minTelas: 1,
    maxTelas: 10,
    temaInterno: 'ink',
    tom: 'Direto: situação de uso ou desejo, o produto/serviço concreto, detalhes confirmados, e um próximo passo. Sem inventar preço, prazo, desconto ou escassez.',
    cta: 'Contato ou compra pelo destino confirmado',
    naGrade: 'produto como protagonista — fotos precisam corresponder ao item real',
    nota: 'Nunca inventar preço, prazo, condição, desconto ou escassez que não estejam no contexto de marca ou no briefing. Produto é sempre o protagonista visual.',
  },
  interativo: {
    nome: 'Interativo',
    objetivo: 'Convidar o público a participar de algo relevante com pouco esforço — enquete nativa do Instagram.',
    quandoUsar: 'Uma pergunta clara, ligada à rotina/necessidade do público, com alternativas fáceis de tocar.',
    cadencia: '1× por semana',
    capa: { layout: 'enquete', theme: 'ink' },
    receita: ['enquete', 'cta'],
    minTelas: 1,
    maxTelas: 2,
    temaInterno: 'ink',
    tom: 'Direto e leve. Uma pergunta só, nunca duas enquetes seguidas. Não presumir qual resposta a pessoa deu.',
    cta: 'Enquete nativa inserida manualmente pela empresa — a peça só reserva o espaço',
    naGrade: 'não aparece no feed — é exclusivo de Stories',
    nota: 'Sempre formato Stories, nunca carrossel de feed. Uma 2ª tela comercial é opcional, só quando continuar o mesmo assunto.',
  },
}

export function receitaDe(tipo: TipoConteudo): ReceitaTipo {
  const t = TIPOS[tipo]
  if (!t) throw new Error(`Tipo de conteúdo desconhecido: "${tipo}". Válidos: ${Object.keys(TIPOS).join(', ')}`)
  return t
}
