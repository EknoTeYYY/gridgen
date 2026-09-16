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
  receita: Layout[]
  temaInterno: Tema
  tom: string
  cta: string
  naGrade: string
  nota?: string
}

export const TIPOS: Record<TipoConteudo, ReceitaTipo> = {
  ancora: {
    nome: 'Âncora',
    objetivo: 'Institucional. Diz quem somos e para quem. Fica fixado no perfil.',
    quandoUsar: 'Uma vez, fixado. Refaz só quando o posicionamento mudar.',
    cadencia: 'fixo no perfil',
    capa: { layout: 'logocover', theme: 'brand' },
    receita: ['logocover', 'photo', 'bottom', 'list', 'word', 'cta'],
    temaInterno: 'ink',
    tom: 'Institucional sem ser corporativo. Primeira pessoa do plural. Diz o que faz, não o que é.',
    cta: 'Convite direto de contato: quem chegou até aqui já quer conversar',
    naGrade: 'gradiente da marca — é a âncora visual, coloque no meio da linha',
  },
  dor: {
    nome: 'Dor / Provocação',
    objetivo: 'Criar identificação imediata. É o tipo que mais gera comentário e compartilhamento.',
    quandoUsar: 'O carro-chefe. Toda semana tem uma dor do mercado pra nomear.',
    cadencia: '1–2× por semana',
    capa: { layout: 'photo', theme: 'ink', full: true },
    receita: ['photo', 'split', 'split', 'word', 'photo', 'photo', 'cta'],
    temaInterno: 'ink',
    tom: 'Segunda pessoa. Descreve a cena que ele vive, sem julgar. Nomeia o problema antes de vender.',
    cta: 'Pergunta aberta na legenda (puxa comentário)',
    naGrade: 'foto escura sangrada — contrasta com o gradiente da âncora',
    nota: 'A narrativa em split numerado é o motor deste tipo: cada slide é um passo da cena.',
  },
  prova: {
    nome: 'Prova / Portfólio',
    objetivo: 'Mostrar o trabalho real. Substitui qualquer promessa por evidência.',
    quandoUsar: 'Sempre que entregar um vídeo, um lançamento, um resultado.',
    cadencia: '1× por semana',
    capa: { layout: 'photo', theme: 'ink', full: true },
    receita: ['photo', 'word', 'photo', 'split', 'split', 'photo', 'cta'],
    temaInterno: 'ink',
    tom: 'Menos texto, mais imagem. Deixa o trabalho falar. Diga que é real e de quem é.',
    cta: 'Quer ver com um caso seu?',
    naGrade: 'foto do trabalho — o tipo mais bonito na grade, use nas pontas',
    nota: 'Regra: no mínimo 3 dos 6 slides são foto. Se não tem imagem boa, não é post de prova.',
  },
  didatico: {
    nome: 'Didático',
    objetivo: 'Ensinar algo útil. É o tipo que o seguidor SALVA — e salvamento pesa no alcance.',
    quandoUsar: 'Explicar um conceito do nicho do Perfil.',
    cadencia: '1× por semana',
    capa: { layout: 'cover', theme: 'ink' },
    receita: ['cover', 'item', 'item', 'item', 'item', 'photo', 'cta'],
    temaInterno: 'ink',
    tom: 'Professor, não guru. Uma ideia por slide. Sem jargão sem explicar.',
    cta: 'Pergunta direta pra puxar comentário sobre a própria experiência de quem lê',
    naGrade: 'texto sobre fundo escuro — o mais sóbrio da grade, dá respiro entre as fotos',
    nota: 'Usa "item" (número empilhado), não "split". O empilhado lê como lista de aula.',
  },
  dado: {
    nome: 'Dado / Benchmark',
    objetivo: 'Autoridade por número. Um dado concreto vale mais que três adjetivos.',
    quandoUsar: 'Um dado de mercado, uma métrica, um benchmark do nicho.',
    cadencia: '1× a cada 15 dias',
    capa: { layout: 'photo', theme: 'ink', full: true },
    receita: ['photo', 'bottom', 'split', 'photo', 'cta'],
    temaInterno: 'ink',
    tom: 'O número primeiro, o contexto depois. Sempre cite de onde veio.',
    cta: 'Como está o seu?',
    naGrade: 'o número sobre foto — o dado ganha escala e contexto',
    nota: 'Post curto (5 slides, incluindo o CTA final). O dado é o conteúdo; o resto é moldura.',
  },
  oferta: {
    nome: 'Oferta / Urgência',
    objetivo: 'Converter. Chamada direta, sem rodeio.',
    quandoUsar: 'Vaga aberta na agenda, condição por tempo limitado, lançamento.',
    cadencia: 'no máximo 1× por mês — queima rápido se repetir',
    capa: { layout: 'photo', theme: 'ink', full: true },
    receita: ['photo', 'list', 'photo', 'cta'],
    temaInterno: 'ink',
    tom: 'Direto. Diz o que é, para quem, e o que fazer agora. Sem falsa escassez.',
    cta: 'Chamada direta pra agir agora, sem enrolação',
    naGrade: 'foto com o convite por cima — direto, sem parecer anúncio de template',
    nota: 'Post curto (4 slides, incluindo o CTA final). Se precisar de mais slides pra explicar, não é oferta, é didático.',
  },
}

export function receitaDe(tipo: TipoConteudo): ReceitaTipo {
  const t = TIPOS[tipo]
  if (!t) throw new Error(`Tipo de conteúdo desconhecido: "${tipo}". Válidos: ${Object.keys(TIPOS).join(', ')}`)
  return t
}
