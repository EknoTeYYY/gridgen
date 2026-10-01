import type { Conta, Prisma, PrismaClient } from '@prisma/client'
import {
  PLANOS,
  REGENERACOES_GRATIS_POR_POST,
  nivelDeUso,
  planoDeEntradaComRecurso,
  recomendarUpgrade,
  type PlanoId,
  type RedeSocial,
  type UsoConta,
} from '@gridgen/shared'

const DIA_MS = 24 * 60 * 60 * 1000

export function planoDaConta(conta: Pick<Conta, 'plano'>): PlanoId {
  return conta.plano in PLANOS ? (conta.plano as PlanoId) : 'sob_medida'
}

// Mesmo dia da âncora em cada mês (dia 31 cai no último dia dos meses
// menores). Tudo em UTC — o ciclo é uma janela de cobrança, não uma data de
// calendário de parede.
function diaNoMes(ano: number, mes: number, dia: number, ref: Date): Date {
  const ultimo = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
  return new Date(Date.UTC(ano, mes, Math.min(dia, ultimo), ref.getUTCHours(), ref.getUTCMinutes()))
}

export function cicloAtual(ancora: Date, agora: Date = new Date()): { inicio: Date; fim: Date } {
  const dia = ancora.getUTCDate()
  let inicio = diaNoMes(agora.getUTCFullYear(), agora.getUTCMonth(), dia, ancora)
  if (inicio > agora) inicio = diaNoMes(agora.getUTCFullYear(), agora.getUTCMonth() - 1, dia, ancora)
  if (inicio < ancora) inicio = ancora
  const fim = diaNoMes(inicio.getUTCFullYear(), inicio.getUTCMonth() + 1, dia, ancora)
  return { inicio, fim }
}

export function limitesDaConta(conta: Conta, inicioCiclo: Date): { geracoes: number | null; perfis: number | null; extras: number } {
  const plano = PLANOS[planoDaConta(conta)]
  const extras = conta.geracoesExtrasCiclo && conta.geracoesExtrasCiclo.getTime() === inicioCiclo.getTime() ? conta.geracoesExtras : 0
  const baseGeracoes = conta.limiteGeracoes ?? plano.geracoesMes
  const basePerfis = conta.limitePerfis ?? plano.perfis
  return {
    geracoes: baseGeracoes === null ? null : baseGeracoes + extras,
    perfis: basePerfis === null ? null : basePerfis + conta.perfisExtras,
    extras,
  }
}

export async function calcularUso(prisma: PrismaClient, contaId: string, agora: Date = new Date()): Promise<UsoConta> {
  const conta = await prisma.conta.findUniqueOrThrow({ where: { id: contaId } })
  const plano = planoDaConta(conta)
  const { inicio, fim } = cicloAtual(conta.cicloInicio, agora)
  const limites = limitesDaConta(conta, inicio)

  const [usadas, perfisUsados] = await Promise.all([
    prisma.consumoGeracao.count({ where: { contaId, contabilizada: true, createdAt: { gte: inicio, lt: fim } } }),
    prisma.perfil.count({ where: { contaId } }),
  ])

  // Projeção linear pelo ritmo do ciclo até agora — com piso de 1 dia pra
  // não explodir no primeiro dia do ciclo.
  const decorridos = Math.max((agora.getTime() - inicio.getTime()) / DIA_MS, 1)
  const totalDias = (fim.getTime() - inicio.getTime()) / DIA_MS
  const projecaoCiclo = Math.max(usadas, Math.round((usadas / decorridos) * totalDias))

  const piloto =
    plano === 'piloto'
      ? {
          expiraEm: conta.pilotoExpiraEm?.toISOString() ?? null,
          expirado: conta.pilotoExpiraEm !== null && conta.pilotoExpiraEm <= agora,
          diasRestantes: conta.pilotoExpiraEm ? Math.max(0, Math.ceil((conta.pilotoExpiraEm.getTime() - agora.getTime()) / DIA_MS)) : null,
        }
      : null

  const nivel = piloto?.expirado ? 'esgotado' : nivelDeUso(usadas, limites.geracoes)

  return {
    plano,
    nomePlano: PLANOS[plano].nome,
    ciclo: { inicio: inicio.toISOString(), fim: fim.toISOString(), diasRestantes: Math.max(0, Math.ceil((fim.getTime() - agora.getTime()) / DIA_MS)) },
    geracoes: {
      usadas,
      limite: limites.geracoes,
      restantes: limites.geracoes === null ? null : Math.max(0, limites.geracoes - usadas),
      extras: limites.extras,
      projecaoCiclo,
    },
    perfis: { usados: perfisUsados, limite: limites.perfis },
    nivel,
    piloto,
    recomendacao: recomendarUpgrade(plano, {
      geracoesUsadas: usadas,
      limiteGeracoes: limites.geracoes,
      projecaoCiclo,
      perfisUsados,
      limitePerfis: limites.perfis,
    }),
  }
}

export type CodigoCota = 'COTA_ESGOTADA' | 'LIMITE_PERFIS' | 'PILOTO_EXPIRADO' | 'RECURSO_DO_PLANO'

// Vira 402 no error handler da app (ver app.ts), com o `uso` no corpo pro
// dashboard mostrar a recomendação de upgrade junto do erro.
export class CotaError extends Error {
  constructor(
    public codigo: CodigoCota,
    message: string,
    public uso: UsoConta,
  ) {
    super(message)
  }
}

// Confere, ANTES de gastar a chamada de IA, se cabem `quantidade` gerações
// no ciclo. Não reserva nada — a contagem é o que já foi registrado; numa
// corrida entre duas gerações simultâneas no limite, uma pode passar de 1.
export async function exigirCotaDeGeracoes(prisma: PrismaClient, contaId: string, quantidade: number): Promise<UsoConta> {
  const uso = await calcularUso(prisma, contaId)
  if (uso.piloto?.expirado) {
    throw new CotaError('PILOTO_EXPIRADO', 'O período de piloto terminou. Escolha um plano para continuar gerando conteúdo.', uso)
  }
  if (uso.geracoes.restantes !== null && uso.geracoes.restantes < quantidade) {
    const restantes = uso.geracoes.restantes
    const mensagem =
      restantes === 0
        ? `As ${uso.geracoes.limite} gerações do seu plano neste ciclo acabaram. Adicione um pacote extra ou mude de plano para continuar.`
        : `Esta ação precisa de ${quantidade} gerações e restam ${restantes} no seu plano neste ciclo. Adicione um pacote extra ou mude de plano.`
    throw new CotaError('COTA_ESGOTADA', mensagem, uso)
  }
  return uso
}

// Recursos que são diferencial dos planos pagos (flags em `Plano`). O plano de
// entrada de cada um sai de `planoDeEntradaComRecurso` — não chumbar aqui.
const NOME_DO_RECURSO = {
  calendarioMensal: 'O calendário mensal com IA',
  adaptacaoRedes: 'A adaptação para LinkedIn e TikTok',
} as const

export type RecursoDoPlano = keyof typeof NOME_DO_RECURSO

export async function exigirRecursoDoPlano(prisma: PrismaClient, contaId: string, recurso: RecursoDoPlano): Promise<void> {
  const uso = await calcularUso(prisma, contaId)
  if (!PLANOS[uso.plano][recurso]) {
    throw new CotaError(
      'RECURSO_DO_PLANO',
      `${NOME_DO_RECURSO[recurso]} está disponível a partir do plano ${planoDeEntradaComRecurso(recurso).nome}. Mude de plano para usar.`,
      uso,
    )
  }
}

export async function exigirVagaDePerfil(prisma: PrismaClient, contaId: string): Promise<void> {
  const uso = await calcularUso(prisma, contaId)
  if (uso.perfis.limite !== null && uso.perfis.usados >= uso.perfis.limite) {
    throw new CotaError(
      'LIMITE_PERFIS',
      `Seu plano inclui ${uso.perfis.limite} ${uso.perfis.limite === 1 ? 'Perfil' : 'Perfis'} e todos já estão em uso. Mude de plano ou adicione um Perfil extra.`,
      uso,
    )
  }
}

export interface UsoTokens {
  modelo?: string
  inputTokens?: number
  outputTokens?: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
}

export async function registrarConsumo(
  prisma: PrismaClient | Prisma.TransactionClient,
  // `contexto` (chat de marca) e `calendario` (proposta do mês) nunca contam
  // na cota — ficam registrados só pra medir o custo real de IA por Conta.
  dados: {
    contaId: string
    perfilId?: string
    postId?: string
    canal?: RedeSocial
    tipo: 'post' | 'adaptacao' | 'regeneracao' | 'contexto' | 'calendario'
    contabilizada?: boolean
  } & UsoTokens,
): Promise<void> {
  await prisma.consumoGeracao.create({
    data: {
      contaId: dados.contaId,
      perfilId: dados.perfilId,
      postId: dados.postId,
      canal: dados.canal as never,
      tipo: dados.tipo,
      contabilizada: dados.contabilizada ?? true,
      modelo: dados.modelo,
      inputTokens: dados.inputTokens,
      outputTokens: dados.outputTokens,
      cacheReadTokens: dados.cacheReadTokens,
      cacheWriteTokens: dados.cacheWriteTokens,
    },
  })
}

// Adaptar de novo uma rede que já foi adaptada é regeneração: grátis até
// `REGENERACOES_GRATIS_POR_POST` por post, depois conta como geração.
export async function classificarAdaptacao(
  prisma: PrismaClient,
  postId: string,
  canal: RedeSocial,
): Promise<{ tipo: 'adaptacao' | 'regeneracao'; contabilizada: boolean }> {
  const jaAdaptada = await prisma.consumoGeracao.count({ where: { postId, canal: canal as never, tipo: { in: ['adaptacao', 'regeneracao'] } } })
  if (jaAdaptada === 0) return { tipo: 'adaptacao', contabilizada: true }
  const regeneracoes = await prisma.consumoGeracao.count({ where: { postId, tipo: 'regeneracao' } })
  return { tipo: 'regeneracao', contabilizada: regeneracoes >= REGENERACOES_GRATIS_POR_POST }
}
