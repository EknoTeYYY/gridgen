import type { FastifyInstance } from 'fastify'
import {
  ANTECEDENCIA_DIAS,
  CALENDARIO_SAZONAL,
  diferencaEmDias,
  montarSlidesPadrao,
  proximaOcorrencia,
  type Formato,
  type TipoConteudo,
} from '@gridgen/shared'
import { gerarRascunhoComIA } from '../geracao/geracao.service.js'
import { proximoSlugDePost, resolverMetodoConversaoPadrao, slidesParaJson } from '../posts/posts.service.js'

// Nome do job de geração individual e sua política de retry — tentativas
// rápidas cobrem instabilidade passageira (ex.: rate limit da Anthropic); a
// varredura diária (plugins/scheduler.ts) é quem garante retry de prazo mais
// longo, reenfileirando todo dia enquanto a ocorrência não tiver post e
// ainda estiver dentro da antecedência.
export const JOB_GERAR_CAMPANHA = 'gerar'
export const TENTATIVAS_GERACAO = 3
export const BACKOFF_INICIAL_MS = 5 * 60 * 1000 // 5min, depois 10min, depois 20min

// BullMQ rejeita jobId customizado com ":" ("Custom Id cannot contain :") —
// usa "|" como separador em vez do mais óbvio ":".
export function idDoJobGerar(c: CampanhaCandidata): string {
  const dataIso = c.data.toISOString().slice(0, 10)
  return `gerar|${c.perfilId}|${c.slug}|${dataIso}`
}

export interface CampanhaCandidata {
  perfilId: string
  slug: string
  nome: string
  tipoSugerido: TipoConteudo
  data: Date
  // Preenchidos só quando a origem é uma PautaCalendario aprovada (proposta
  // de calendário mensal, §6) — dão o briefing de verdade (assunto/abordagem/
  // objetivo/direção visual da pauta) em vez do texto genérico de campanha
  // sazonal, e o formato que a pauta pediu (nem sempre "feed"). `pautaId`
  // deixa `gerarCampanha`/`marcarCampanhaComoFalha` linkarem de volta pro
  // Post real gerado.
  briefing?: string
  formato?: Formato
  pautaId?: string
}

export function proximasOcorrenciasCuradas(hoje: Date): Array<{ slug: string; nome: string; data: Date }> {
  return CALENDARIO_SAZONAL.map((d) => ({ slug: d.slug, nome: d.nome, data: proximaOcorrencia(d.calcular, hoje) }))
}

async function candidatosDoPerfil(
  app: FastifyInstance,
  perfilId: string,
  hoje: Date,
): Promise<Omit<CampanhaCandidata, 'perfilId'>[]> {
  const personalizadas = await app.prisma.dataPersonalizada.findMany({ where: { perfilId, ativa: true } })

  const curadas = CALENDARIO_SAZONAL.map((d) => ({
    slug: d.slug,
    nome: d.nome,
    tipoSugerido: d.tipoSugerido,
    data: proximaOcorrencia(d.calcular, hoje),
  }))

  const doPerfil = personalizadas.map((p) => ({
    slug: `perfil-${p.id}`,
    nome: p.nome,
    tipoSugerido: p.tipoSugerido as TipoConteudo,
    data: proximaOcorrencia(() => ({ mes: p.mes, dia: p.dia }), hoje),
  }))

  // Pautas de uma proposta de calendário mensal (§6) já aprovada, ainda sem
  // post gerado — a data aqui é a `dataHorario` real da pauta (não "próxima
  // ocorrência anual" como as duas fontes acima, que são recorrentes).
  const pautas = await app.prisma.pautaCalendario.findMany({
    where: { postId: null, proposta: { perfilId, status: 'aprovado' } },
  })
  const dasPautas = pautas.map((p) => ({
    slug: `pauta-${p.id}`,
    nome: p.assunto,
    tipoSugerido: p.tipo as TipoConteudo,
    data: p.dataHorario,
    formato: p.formato as Formato,
    pautaId: p.id,
    briefing: [
      `Assunto: ${p.assunto}. Abordagem: ${p.abordagem}.`,
      `Público-alvo desta peça: ${p.publico}.`,
      `Objetivo: ${p.objetivo}. Motivo da escolha: ${p.motivoEscolha}.`,
      `Direção visual pretendida: ${p.direcaoVisual}.`,
      `Ação desejada de quem vê: ${p.acaoDesejada}.`,
    ].join(' '),
  }))

  return [...curadas, ...doPerfil, ...dasPautas]
}

async function jaGerado(app: FastifyInstance, c: CampanhaCandidata): Promise<boolean> {
  const existente = await app.prisma.post.findFirst({
    where: { perfilId: c.perfilId, campanhaSlug: c.slug, campanhaData: c.data },
  })
  return Boolean(existente)
}

// Varre todos os Perfis ativos e devolve as ocorrências (calendário curado +
// datas personalizadas) que caem dentro da antecedência e ainda não têm post
// — só decide o que precisa ser gerado. Quem gera de fato é `gerarCampanha`,
// chamada pelo worker da fila (ver plugins/scheduler.ts) — assim cada
// ocorrência ganha retry de verdade em vez de só um log-and-forget diário.
export async function candidatosPendentes(app: FastifyInstance, hoje: Date = new Date()): Promise<CampanhaCandidata[]> {
  const pendentes: CampanhaCandidata[] = []
  const perfis = await app.prisma.perfil.findMany({ where: { status: 'ativo' } })

  for (const perfil of perfis) {
    const candidatos = await candidatosDoPerfil(app, perfil.id, hoje)
    for (const c of candidatos) {
      const dias = diferencaEmDias(hoje, c.data)
      if (dias < 0 || dias > ANTECEDENCIA_DIAS) continue

      const candidato: CampanhaCandidata = { perfilId: perfil.id, ...c }
      if (await jaGerado(app, candidato)) continue
      pendentes.push(candidato)
    }
  }

  return pendentes
}

// Verifica se uma única ocorrência (ex.: data personalizada recém-criada) já
// cai dentro da antecedência agora — usado pra enfileirar geração imediata em
// vez de esperar a próxima varredura diária (ver calendario.routes.ts).
export function dentroDaAntecedencia(data: Date, hoje: Date = new Date()): boolean {
  const dias = diferencaEmDias(hoje, data)
  return dias >= 0 && dias <= ANTECEDENCIA_DIAS
}

// Gera e persiste o rascunho de uma única ocorrência. Sem try/catch de
// propósito — o erro propaga pra quem chama (o worker da fila) aplicar retry
// de verdade (tentativas + backoff), em vez de engolir e só tentar de novo no
// dia seguinte.
export async function gerarCampanha(app: FastifyInstance, c: CampanhaCandidata): Promise<void> {
  if (await jaGerado(app, c)) return // idempotente: corrida ou retry duplicado

  const perfil = await app.prisma.perfil.findUniqueOrThrow({ where: { id: c.perfilId } })
  const contexto = await app.prisma.contextoMarkdown.findUnique({ where: { perfilId: c.perfilId } })
  const metodoConversao = resolverMetodoConversaoPadrao(c.tipoSugerido, perfil)
  const rascunho = await gerarRascunhoComIA(
    c.tipoSugerido,
    contexto?.conteudoMarkdown ?? '',
    c.briefing ?? `Post pra campanha sazonal "${c.nome}".`,
    undefined,
    'padrao',
    'ink',
    metodoConversao,
  )
  const slug = await proximoSlugDePost(app.prisma, c.perfilId, c.tipoSugerido, c.nome)
  const post = await app.prisma.post.create({
    data: {
      perfilId: c.perfilId,
      slug,
      tipo: c.tipoSugerido,
      formato: c.formato ?? 'feed',
      caption: rascunho.caption,
      hashtags: rascunho.hashtags,
      slides: slidesParaJson(rascunho.slides),
      metodoConversao,
      origem: 'agenda',
      campanhaSlug: c.slug,
      campanhaNome: c.nome,
      campanhaData: c.data,
    },
  })
  if (c.pautaId) await app.prisma.pautaCalendario.update({ where: { id: c.pautaId }, data: { postId: post.id } })
}

// Chamado quando a fila esgota todas as tentativas de `gerarCampanha` (ex.:
// ANTHROPIC_API_KEY nunca configurada) — cria um post vazio já em "erro" pra
// aparecer nas Aprovações, em vez de a campanha simplesmente sumir sem
// nenhum aviso. O usuário completa/gera manualmente pela tela de edição do
// post assim que resolver a causa (mesmo fluxo de "salvar e tentar de novo").
export async function marcarCampanhaComoFalha(app: FastifyInstance, c: CampanhaCandidata): Promise<void> {
  if (await jaGerado(app, c)) return

  const slug = await proximoSlugDePost(app.prisma, c.perfilId, c.tipoSugerido, c.nome)
  const post = await app.prisma.post.create({
    data: {
      perfilId: c.perfilId,
      slug,
      tipo: c.tipoSugerido,
      formato: c.formato ?? 'feed',
      slides: slidesParaJson(montarSlidesPadrao(c.tipoSugerido)),
      status: 'erro',
      origem: 'agenda',
      campanhaSlug: c.slug,
      campanhaNome: c.nome,
      campanhaData: c.data,
    },
  })
  if (c.pautaId) await app.prisma.pautaCalendario.update({ where: { id: c.pautaId }, data: { postId: post.id } })
}
