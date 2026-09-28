// Planos comerciais do Gridgen (precificação aprovada em 27/09/2026). Fonte
// única pra api (limites e cota), dashboard (uso e upgrade) e LP (/planos) —
// mudar um preço ou limite aqui muda nos três lugares.
//
// Unidade de cobrança: 1 "geração" = 1 peça pronta criada (carrossel de até
// 8 telas, sequência de stories, thread ou gráfico). Cada adaptação pra outra
// rede conta como mais 1 geração. Regenerar uma adaptação já feita não conta
// até `REGENERACOES_GRATIS_POR_POST` por post (uso justo) — custa centavos e
// evita o cliente com medo de testar.

export type PlanoId = 'piloto' | 'essencial' | 'profissional' | 'agencia' | 'sob_medida'

export interface Plano {
  id: PlanoId
  nome: string
  publico: string
  // Mensal, em reais. `null` = sem preço de tabela (piloto é gratuito; sob
  // medida é proposta).
  precoMensal: number | null
  // `null` = definido por conta (sob medida: override no admin).
  perfis: number | null
  geracoesMes: number | null
  destaque?: boolean
  // Calendário mensal com IA (a IA propõe o mês inteiro e gera tudo na
  // aprovação): diferencial do Profissional pra cima.
  calendarioMensal: boolean
  // Adaptação do post pra LinkedIn e TikTok (cada adaptação é mais 1
  // geração): também do Profissional pra cima.
  adaptacaoRedes: boolean
  recursos: string[]
}

export const PLANOS: Record<PlanoId, Plano> = {
  piloto: {
    id: 'piloto',
    nome: 'Piloto',
    publico: 'Para conhecer o Gridgen com uma marca real',
    precoMensal: 0,
    perfis: 1,
    geracoesMes: 10,
    calendarioMensal: false,
    adaptacaoRedes: false,
    recursos: ['1 Perfil', '10 gerações', '14 dias de uso', 'Implantação assistida'],
  },
  essencial: {
    id: 'essencial',
    nome: 'Essencial',
    publico: 'Para pequenas empresas com uma marca',
    precoMensal: 149,
    perfis: 1,
    geracoesMes: 30,
    calendarioMensal: false,
    adaptacaoRedes: false,
    recursos: ['1 Perfil', '30 gerações por mês', 'Implantação assistida'],
  },
  profissional: {
    id: 'profissional',
    nome: 'Profissional',
    publico: 'Para social medias e freelancers',
    precoMensal: 397,
    perfis: 5,
    geracoesMes: 120,
    destaque: true,
    calendarioMensal: true,
    adaptacaoRedes: true,
    recursos: ['Até 5 Perfis', '120 gerações por mês', 'Calendário mensal com IA', 'Adaptação para LinkedIn e TikTok', 'Implantação assistida'],
  },
  agencia: {
    id: 'agencia',
    nome: 'Agência',
    publico: 'Para agências com carteira de clientes',
    precoMensal: 897,
    perfis: 15,
    geracoesMes: 400,
    calendarioMensal: true,
    adaptacaoRedes: true,
    recursos: ['Até 15 Perfis', '400 gerações por mês', 'Calendário mensal com IA', 'Adaptação para LinkedIn e TikTok', 'Implantação assistida'],
  },
  sob_medida: {
    id: 'sob_medida',
    nome: 'Sob medida',
    publico: 'Para operações acima de 15 marcas',
    precoMensal: null,
    perfis: null,
    geracoesMes: null,
    calendarioMensal: true,
    adaptacaoRedes: true,
    recursos: ['Perfis e gerações sob medida', 'Condições comerciais próprias', 'Acompanhamento dedicado'],
  },
}

// Escada de upgrade (do menor pro maior). Piloto e sob medida ficam fora: o
// piloto recomenda um plano de entrada; acima da Agência, só proposta.
export const PLANOS_EM_ORDEM: PlanoId[] = ['essencial', 'profissional', 'agencia']

export const PACOTE_EXTRA = { geracoes: 50, preco: 129 }
export const PERFIL_EXTRA_PRECO = 59
export const REGENERACOES_GRATIS_POR_POST = 3
export const PILOTO_DIAS = 14

// A partir de que fração do limite o uso vira aviso.
export const LIMIAR_ATENCAO = 0.8
export const LIMIAR_CRITICO = 0.95

export type NivelUso = 'ok' | 'atencao' | 'critico' | 'esgotado'

export function nivelDeUso(usadas: number, limite: number | null): NivelUso {
  if (limite === null) return 'ok'
  if (usadas >= limite) return 'esgotado'
  if (usadas >= limite * LIMIAR_CRITICO) return 'critico'
  if (usadas >= limite * LIMIAR_ATENCAO) return 'atencao'
  return 'ok'
}

export interface RecomendacaoUpgrade {
  tipo: 'plano' | 'pacote' | 'perfil_extra' | 'sob_medida'
  planoId?: PlanoId
  motivo: string
}

// Retrato do consumo de uma Conta no ciclo atual — o que `GET /conta/uso`
// devolve e o dashboard mostra.
export interface UsoConta {
  plano: PlanoId
  nomePlano: string
  ciclo: { inicio: string; fim: string; diasRestantes: number }
  geracoes: {
    usadas: number
    // `null` = sem limite (sob medida sem override)
    limite: number | null
    restantes: number | null
    extras: number
    projecaoCiclo: number
  }
  perfis: { usados: number; limite: number | null }
  nivel: NivelUso
  piloto: { expiraEm: string | null; expirado: boolean; diasRestantes: number | null } | null
  recomendacao: RecomendacaoUpgrade | null
}

// Próximo plano da escada que comporta `geracoes` e `perfis` — ou sob medida
// quando nem a Agência comporta.
export function planoQueComporta(geracoes: number, perfis: number): PlanoId {
  for (const id of PLANOS_EM_ORDEM) {
    const p = PLANOS[id]
    if ((p.geracoesMes ?? Infinity) >= geracoes && (p.perfis ?? Infinity) >= perfis) return id
  }
  return 'sob_medida'
}

// Regra de recomendação, em ordem de prioridade:
// 1. Piloto → o plano de entrada que comporta o que ele já usa.
// 2. Gerações: se a projeção do ciclo estoura o limite (ou o uso já passou
//    do limiar de atenção), recomenda um pacote extra quando o excesso cabe
//    em um pacote e sai mais barato que subir de plano; senão, o próximo
//    plano que comporta a projeção.
// Perfis NÃO geram recomendação sozinhos: usar exatamente os Perfis do plano
// é o estado normal (todo Essencial usa 1/1) e viraria um alerta permanente.
// Quem tenta criar um Perfil além do limite recebe o 402 LIMITE_PERFIS, que
// já orienta o upgrade no momento certo.
export function recomendarUpgrade(
  plano: PlanoId,
  uso: { geracoesUsadas: number; limiteGeracoes: number | null; projecaoCiclo: number; perfisUsados: number; limitePerfis: number | null },
): RecomendacaoUpgrade | null {
  if (plano === 'sob_medida') return null

  if (plano === 'piloto') {
    // Projeção já é mensal (ciclo de 30 dias); o Essencial é o piso.
    const alvo = planoQueComporta(Math.max(uso.projecaoCiclo, PLANOS.essencial.geracoesMes!), uso.perfisUsados)
    return { tipo: 'plano', planoId: alvo, motivo: `Para seguir depois do piloto, o plano ${PLANOS[alvo].nome} comporta o seu ritmo de uso.` }
  }

  const indice = PLANOS_EM_ORDEM.indexOf(plano)
  const proximo = PLANOS_EM_ORDEM[indice + 1] as PlanoId | undefined

  if (uso.limiteGeracoes === null) return null
  const nivel = nivelDeUso(uso.geracoesUsadas, uso.limiteGeracoes)
  const estouraProjecao = uso.projecaoCiclo > uso.limiteGeracoes
  if (nivel === 'ok' && !estouraProjecao) return null

  const excesso = Math.max(uso.projecaoCiclo - uso.limiteGeracoes, 1)
  const precoAtual = PLANOS[plano].precoMensal ?? 0
  const precoProximo = proximo ? PLANOS[proximo].precoMensal ?? Infinity : Infinity
  const pacotes = Math.ceil(excesso / PACOTE_EXTRA.geracoes)
  if (pacotes === 1 && precoAtual + PACOTE_EXTRA.preco < precoProximo) {
    return {
      tipo: 'pacote',
      motivo: `No ritmo atual, faltam cerca de ${excesso} gerações neste ciclo. Um pacote de +${PACOTE_EXTRA.geracoes} gerações (R$ ${PACOTE_EXTRA.preco}) resolve.`,
    }
  }
  const alvo = planoQueComporta(uso.projecaoCiclo, uso.perfisUsados)
  // Nem a Agência comporta a projeção → proposta sob medida, nunca um plano
  // que o próprio texto mostraria como insuficiente.
  if (alvo === 'sob_medida') {
    return { tipo: 'sob_medida', motivo: `No ritmo atual, você vai usar cerca de ${uso.projecaoCiclo} gerações neste ciclo, acima do plano ${PLANOS.agencia.nome}. O time comercial monta uma proposta sob medida.` }
  }
  if (proximo) {
    const destino = PLANOS_EM_ORDEM.indexOf(alvo) > indice ? alvo : proximo
    return { tipo: 'plano', planoId: destino, motivo: `No ritmo atual, você vai usar cerca de ${uso.projecaoCiclo} gerações neste ciclo. O ${PLANOS[destino].nome} inclui ${PLANOS[destino].geracoesMes}.` }
  }
  return { tipo: 'sob_medida', motivo: 'Seu volume passou do plano Agência. O time comercial monta uma proposta sob medida.' }
}
