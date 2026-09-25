import type { FastifyInstance } from 'fastify'
import {
  ANTECEDENCIA_DIAS,
  CALENDARIO_SAZONAL,
  camposFaltando,
  diferencaEmDias,
  montarSlidesPadrao,
  proximaOcorrencia,
  type Formato,
  type TipoConteudo,
} from '@gridgen/shared'
import { resolverImagemAutomatica } from '../../lib/imagem-automatica.js'
import { gerarRascunhoComIA } from '../geracao/geracao.service.js'
import {
  brandKitDoPerfil,
  montarPayloadRenderPrincipal,
  proximoSlugDePost,
  resolverMetodoConversaoPadrao,
  slidesParaJson,
} from '../posts/posts.service.js'

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

interface PautaParaCandidato {
  id: string
  assunto: string
  abordagem: string
  publico: string
  objetivo: string
  motivoEscolha: string
  direcaoVisual: string
  acaoDesejada: string
  tipo: string
  formato: string
  dataHorario: Date
}

// Monta o candidato de geração a partir de uma pauta aprovada — mesmo formato
// usado tanto pela varredura diária (pautas que já caem dentro da
// antecedência) quanto pelo enfileiramento imediato ao aprovar o mês inteiro
// (calendario-mensal.service.ts, `aprovarPropostaMensal`).
export function candidatoDePauta(p: PautaParaCandidato): Omit<CampanhaCandidata, 'perfilId'> {
  return {
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
  }
}

// Enfileira a geração de um candidato imediatamente, sem esperar a varredura
// diária — usado tanto pra uma data personalizada que já nasce dentro da
// antecedência (calendario.routes.ts) quanto pra toda pauta de um mês
// recém-aprovado (calendario-mensal.service.ts). `jobId` determinístico evita
// duplicar caso a varredura diária pegue o mesmo candidato antes.
export async function enfileirarGeracaoImediata(app: FastifyInstance, candidato: CampanhaCandidata): Promise<void> {
  await app.calendarioQueue.add(JOB_GERAR_CAMPANHA, candidato, {
    jobId: idDoJobGerar(candidato),
    attempts: TENTATIVAS_GERACAO,
    backoff: { type: 'exponential', delay: BACKOFF_INICIAL_MS },
  })
}

// `PautaCalendario.dataHorario` guarda hora/minuto como dígitos "nus"
// (`Date.UTC(ano, mes, dia, hora, minuto)`, sem nenhum deslocamento de fuso —
// sempre lido de volta com `timeZone: 'UTC'`, nunca convertido, ver
// `formatarDataHorario` no frontend). `Post.agendadoPara`, por outro lado, é
// sempre um instante UTC de verdade (nasce de `new Date(...).toISOString()`
// no navegador, já convertido do horário de Brasília de quem preenche o
// `<input datetime-local>`). Os dois campos guardam a mesma hora de parede,
// só que em convenções diferentes — sem esse ajuste de +3h, o aviso por
// e-mail dispararia 3h adiantado e mostraria a hora errada no corpo do
// e-mail (Brasil não tem mais horário de verão desde 2019, então o
// deslocamento é uma constante).
function agendadoParaDaPauta(dataHorario: Date): Date {
  return new Date(dataHorario.getTime() + 3 * 60 * 60 * 1000)
}

// A proposta mensal (§6) já recebe as datas curadas/personalizadas do mês
// como insumo e pode decidir cobrir uma delas com pauta própria (contexto de
// marca de verdade, não o briefing genérico daqui), marcando `ocasiao` com o
// nome da data. Sem essa checagem, a mesma ocasião virava DOIS posts reais
// (achado real do usuário: "Dia das Crianças"/"Dia do Professor" aparecendo
// 2x no calendário — um de cada mecanismo). Comparação por texto
// (trim+lowercase), já que `ocasiao` é preenchido livremente pela IA, não é
// uma chave estrangeira de verdade pra `CALENDARIO_SAZONAL`/`DataPersonalizada`.
// Cacheia por (ano, mês) — mais de uma ocasião pode cair no mesmo mês (ex.:
// Dia das Crianças e Dia do Professor, ambos em outubro).
function criarVerificadorDeCobertura(app: FastifyInstance, perfilId: string) {
  const cache = new Map<string, Promise<Set<string>>>()

  async function ocasioesCobertas(ano: number, mes: number): Promise<Set<string>> {
    const chave = `${ano}-${mes}`
    let promessa = cache.get(chave)
    if (!promessa) {
      promessa = app.prisma.propostaCalendario
        .findUnique({
          where: { perfilId_mesReferencia: { perfilId, mesReferencia: new Date(Date.UTC(ano, mes - 1, 1)) } },
          include: { pautas: { where: { ocasiao: { not: null } }, select: { ocasiao: true } } },
        })
        .then((proposta) => {
          if (!proposta || proposta.status !== 'aprovado') return new Set<string>()
          return new Set(proposta.pautas.map((p) => p.ocasiao!.trim().toLowerCase()))
        })
      cache.set(chave, promessa)
    }
    return promessa
  }

  return async function jaCobertaPelaProposta(nome: string, data: Date): Promise<boolean> {
    const cobertas = await ocasioesCobertas(data.getUTCFullYear(), data.getUTCMonth() + 1)
    return cobertas.has(nome.trim().toLowerCase())
  }
}

async function candidatosDoPerfil(
  app: FastifyInstance,
  perfilId: string,
  hoje: Date,
): Promise<Omit<CampanhaCandidata, 'perfilId'>[]> {
  const personalizadas = await app.prisma.dataPersonalizada.findMany({ where: { perfilId, ativa: true } })
  const jaCobertaPelaProposta = criarVerificadorDeCobertura(app, perfilId)

  const curadasBrutas = CALENDARIO_SAZONAL.map((d) => ({
    slug: d.slug,
    nome: d.nome,
    tipoSugerido: d.tipoSugerido,
    data: proximaOcorrencia(d.calcular, hoje),
  }))
  const curadas = []
  for (const c of curadasBrutas) {
    if (!(await jaCobertaPelaProposta(c.nome, c.data))) curadas.push(c)
  }

  const doPerfilBrutas = personalizadas.map((p) => ({
    slug: `perfil-${p.id}`,
    nome: p.nome,
    tipoSugerido: p.tipoSugerido as TipoConteudo,
    data: proximaOcorrencia(() => ({ mes: p.mes, dia: p.dia }), hoje),
  }))
  const doPerfil = []
  for (const p of doPerfilBrutas) {
    if (!(await jaCobertaPelaProposta(p.nome, p.data))) doPerfil.push(p)
  }

  // Pautas de uma proposta de calendário mensal (§6) já aprovada, ainda sem
  // post gerado — a data aqui é a `dataHorario` real da pauta (não "próxima
  // ocorrência anual" como as duas fontes acima, que são recorrentes).
  const pautas = await app.prisma.pautaCalendario.findMany({
    where: { postId: null, proposta: { perfilId, status: 'aprovado' } },
  })
  const dasPautas = pautas.map((p) => candidatoDePauta(p))

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

// Gera e persiste o post de uma única ocorrência — texto, imagem resolvida
// sozinha e render já enfileirado, sem parar num "rascunho" esperando alguém
// lembrar de abrir (a aprovação do mês/o cadastro da data já É a decisão
// humana; o aviso por e-mail é quem avisa depois, não uma segunda revisão
// manual no meio do caminho). Sem try/catch de propósito — o erro propaga pra
// quem chama (o worker da fila) aplicar retry de verdade (tentativas +
// backoff), em vez de engolir e só tentar de novo no dia seguinte.
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

  // Mesma resolução automática de imagem já usada na criação manual via IA
  // (`geracao.routes.ts`) — sem isso, todo post nascido do calendário caía
  // sempre no fallback de gradiente, nunca ganhava foto de verdade.
  if (rascunho.buscasImagem) {
    await Promise.all(
      rascunho.buscasImagem.map(async (consulta, i) => {
        if (!consulta) return
        const imagem = await resolverImagemAutomatica(app.prisma, c.perfilId, consulta)
        if (imagem) rascunho.slides[i].photoDataUri = imagem
      }),
    )
  }

  const slug = await proximoSlugDePost(app.prisma, c.perfilId, c.tipoSugerido, c.nome)

  // Campo obrigatório vazio (raro — a IA não garante 100%, ver `required` no
  // schema da ferramenta) vira o texto literal "undefined" na imagem, então
  // bloqueia o render (não a criação do post) — igual à checagem que a rota
  // manual já faz antes de gerar. Cai em "erro" pra aparecer nas Aprovações e
  // ser completado manualmente, mesmo tratamento de `marcarCampanhaComoFalha`.
  const faltando = camposFaltando(rascunho.slides)
  if (faltando.length > 0) {
    const detalhe = faltando.map((f) => `slide ${f.slideIndex + 1}: "${f.label}"`).join(', ')
    app.log.warn(`campanha "${c.nome}" gerou com campo obrigatório vazio (${detalhe}) — post criado em erro pra completar manualmente`)
  }

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
      // Só pautas da proposta mensal têm hora real definida (curadas/
      // personalizadas só têm dia — sem horário específico pra agendar o
      // aviso de publicação).
      ...(c.pautaId && { agendadoPara: agendadoParaDaPauta(c.data) }),
      status: faltando.length > 0 ? 'erro' : 'gerando',
    },
  })
  if (c.pautaId) await app.prisma.pautaCalendario.update({ where: { id: c.pautaId }, data: { postId: post.id } })

  if (faltando.length === 0) {
    const renderJob = await app.prisma.renderJob.create({ data: { postId: post.id, status: 'processando' } })
    await app.renderQueue.add('render', montarPayloadRenderPrincipal(post, brandKitDoPerfil(perfil)), { jobId: renderJob.id })
  }
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
