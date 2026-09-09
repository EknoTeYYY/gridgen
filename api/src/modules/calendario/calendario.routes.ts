import type { FastifyInstance } from 'fastify'
import { proximaOcorrencia } from '@studio/shared'
import { criarDataPersonalizadaSchema } from './calendario.schemas.js'
import {
  BACKOFF_INICIAL_MS,
  dentroDaAntecedencia,
  idDoJobGerar,
  JOB_GERAR_CAMPANHA,
  proximasOcorrenciasCuradas,
  TENTATIVAS_GERACAO,
  type CampanhaCandidata,
} from './calendario.service.js'

export default async function calendarioRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Calendário curado é compartilhado entre todos os Perfis (vive em código,
  // @studio/shared) — só devolve a próxima ocorrência de cada um pra exibir.
  app.get('/calendario-sazonal', async (_request, reply) => {
    return reply.send({ datas: proximasOcorrenciasCuradas(new Date()) })
  })

  app.get('/perfis/:perfilId/datas-personalizadas', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const datas = await app.prisma.dataPersonalizada.findMany({
      where: { perfilId },
      orderBy: [{ mes: 'asc' }, { dia: 'asc' }],
    })
    return reply.send(datas)
  })

  app.post('/perfis/:perfilId/datas-personalizadas', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const body = criarDataPersonalizadaSchema.parse(request.body)
    const data = await app.prisma.dataPersonalizada.create({ data: { perfilId, ...body } })

    // Já pode cair dentro da antecedência no ato da criação (ex.: usuário
    // cadastra um aniversário pra daqui 2 dias) — não espera a varredura das
    // 6h de amanhã, enfileira a geração agora mesmo.
    const proxima = proximaOcorrencia(() => ({ mes: data.mes, dia: data.dia }), new Date())
    if (dentroDaAntecedencia(proxima)) {
      const candidato: CampanhaCandidata = {
        perfilId,
        slug: `perfil-${data.id}`,
        nome: data.nome,
        tipoSugerido: data.tipoSugerido,
        data: proxima,
      }
      await app.calendarioQueue.add(JOB_GERAR_CAMPANHA, candidato, {
        jobId: idDoJobGerar(candidato),
        attempts: TENTATIVAS_GERACAO,
        backoff: { type: 'exponential', delay: BACKOFF_INICIAL_MS },
      })
    }

    return reply.code(201).send(data)
  })

  app.delete('/datas-personalizadas/:id', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const existente = await app.prisma.dataPersonalizada.findFirst({ where: { id, perfil: { contaId } } })
    if (!existente) return reply.code(404).send({ erro: 'data não encontrada' })

    await app.prisma.dataPersonalizada.delete({ where: { id } })
    return reply.code(204).send()
  })

  // "Aguardando aprovação": qualquer post renderizado (pronto, de qualquer
  // origem); rascunhos que o calendário gerou sozinho (precisam de uma
  // primeira revisão antes de sequer renderizar); e campanhas que a fila não
  // conseguiu nem começar a gerar (ex.: chave da Anthropic ausente) — sem
  // isso apareceriam pra revisão, o usuário não teria como saber que precisa
  // configurar algo.
  app.get('/posts/pendentes', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId

    const posts = await app.prisma.post.findMany({
      where: {
        perfil: { contaId },
        OR: [{ status: 'pronto' }, { origem: 'agenda', status: { in: ['rascunho', 'erro'] } }],
      },
      include: { perfil: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(posts)
  })
}
