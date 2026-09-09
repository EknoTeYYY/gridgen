import type { FastifyInstance } from 'fastify'
import { conversarSobreContexto } from './contexto.service.js'
import { enviarMensagemSchema } from './contexto.schemas.js'

export default async function contextoRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.get('/perfis/:perfilId/contexto', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const [contexto, mensagens] = await Promise.all([
      app.prisma.contextoMarkdown.findUnique({ where: { perfilId } }),
      app.prisma.mensagemContexto.findMany({ where: { perfilId }, orderBy: { createdAt: 'asc' } }),
    ])

    return reply.send({ conteudoMarkdown: contexto?.conteudoMarkdown ?? '', mensagens })
  })

  app.post('/perfis/:perfilId/contexto/mensagens', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const body = enviarMensagemSchema.parse(request.body)

    const [contextoExistente, historico] = await Promise.all([
      app.prisma.contextoMarkdown.findUnique({ where: { perfilId } }),
      app.prisma.mensagemContexto.findMany({ where: { perfilId }, orderBy: { createdAt: 'asc' } }),
    ])

    let resultado
    try {
      resultado = await conversarSobreContexto(
        contextoExistente?.conteudoMarkdown ?? '',
        historico.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.conteudo })),
        body.mensagem,
      )
    } catch (err) {
      // Detalhe real só no log — nunca na resposta (pode conter nome de env
      // var, mensagem de erro da Anthropic, etc.).
      app.log.error(err, 'falha ao conversar com a IA de contexto')
      return reply.code(502).send({ erro: 'Não foi possível responder agora. Tente novamente em instantes.' })
    }

    await app.prisma.mensagemContexto.create({ data: { perfilId, role: 'user', conteudo: body.mensagem } })
    await app.prisma.mensagemContexto.create({ data: { perfilId, role: 'assistant', conteudo: resultado.resposta } })
    await app.prisma.contextoMarkdown.upsert({
      where: { perfilId },
      create: { perfilId, conteudoMarkdown: resultado.markdown },
      update: { conteudoMarkdown: resultado.markdown },
    })

    return reply.send(resultado)
  })
}
