import type { FastifyInstance } from 'fastify'
import { editarPautaSchema, gerarPropostaMensalSchema } from './calendario-mensal.schemas.js'
import { aprovarPropostaMensal, gerarPropostaMensal, PropostaJaAprovadaError } from './calendario-mensal.service.js'

export default async function calendarioMensalRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.post('/perfis/:perfilId/calendario-mensal/gerar', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const { ano, mes } = gerarPropostaMensalSchema.parse(request.body)

    let resultado
    try {
      resultado = await gerarPropostaMensal(app, perfilId, ano, mes)
    } catch (err) {
      if (err instanceof PropostaJaAprovadaError) {
        return reply.code(409).send({ erro: err.message })
      }
      app.log.error(err, 'falha ao gerar proposta de calendário mensal')
      return reply.code(502).send({ erro: 'Não foi possível gerar a proposta de calendário agora. Tente novamente em instantes.' })
    }

    const proposta = await app.prisma.propostaCalendario.findUniqueOrThrow({
      where: { id: resultado.propostaId },
      include: { pautas: { orderBy: { dataHorario: 'asc' } } },
    })
    return reply.code(201).send(proposta)
  })

  app.get('/perfis/:perfilId/calendario-mensal', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }
    const { ano, mes } = request.query as { ano?: string; mes?: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    if (!ano || !mes) return reply.code(400).send({ erro: 'informe ano e mes na query' })
    const mesReferencia = new Date(Date.UTC(Number(ano), Number(mes) - 1, 1))

    const proposta = await app.prisma.propostaCalendario.findUnique({
      where: { perfilId_mesReferencia: { perfilId, mesReferencia } },
      include: { pautas: { orderBy: { dataHorario: 'asc' } } },
    })
    return reply.send(proposta)
  })

  app.post('/calendario-mensal/:propostaId/aprovar', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { propostaId } = request.params as { propostaId: string }

    const proposta = await app.prisma.propostaCalendario.findFirst({ where: { id: propostaId, perfil: { contaId } } })
    if (!proposta) return reply.code(404).send({ erro: 'proposta não encontrada' })
    if (proposta.status === 'aprovado') return reply.code(400).send({ erro: 'esta proposta já está aprovada' })

    await aprovarPropostaMensal(app, propostaId)
    const atualizada = await app.prisma.propostaCalendario.findUniqueOrThrow({
      where: { id: propostaId },
      include: { pautas: { orderBy: { dataHorario: 'asc' } } },
    })
    return reply.send(atualizada)
  })

  // Editar uma pauta — livre enquanto a proposta ainda é rascunho; depois de
  // aprovada, exige `motivoTroca` (doc §6: "proposta de troca com motivo e
  // impacto") e só é permitida se o post real ainda não foi gerado (depois
  // disso, o conteúdo já existe como Post de verdade e se edita por lá).
  app.patch('/calendario-mensal/pautas/:pautaId', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { pautaId } = request.params as { pautaId: string }

    const pauta = await app.prisma.pautaCalendario.findFirst({
      where: { id: pautaId, proposta: { perfil: { contaId } } },
      include: { proposta: true },
    })
    if (!pauta) return reply.code(404).send({ erro: 'pauta não encontrada' })
    if (pauta.postId) {
      return reply.code(400).send({ erro: 'esta pauta já gerou o post — edite o post diretamente em vez da pauta' })
    }

    const body = editarPautaSchema.parse(request.body)
    if (pauta.proposta.status === 'aprovado' && !body.motivoTroca) {
      return reply.code(400).send({ erro: 'esta proposta já foi aprovada — informe o motivo da troca pra editar esta pauta' })
    }

    const { motivoTroca, ...campos } = body
    const atualizada = await app.prisma.pautaCalendario.update({
      where: { id: pautaId },
      data: { ...campos, ...(motivoTroca ? { motivoUltimaTroca: motivoTroca } : {}) },
    })
    return reply.send(atualizada)
  })
}
