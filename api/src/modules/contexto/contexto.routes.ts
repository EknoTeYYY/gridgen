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
        perfil.canalConversaoConfirmado,
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

    // Canal de conversão confirmado nesta troca — persiste no Perfil (doc
    // editorial: "coletar canal no diagnóstico e recuperar destino
    // confirmado", reaproveitado sem perguntar de novo a cada post). O
    // destino em si vai pro campo certo do Perfil conforme o canal
    // ("ligacao"/"whatsapp" → telefone, "lp" → site); "whatsapp_bio"/
    // "cardapio_bio" não têm destino próprio, o link é sempre o da bio.
    if (resultado.canalConversaoTipo) {
      const destino = resultado.canalConversaoDestino
      const dadosDestino =
        destino && (resultado.canalConversaoTipo === 'ligacao' || resultado.canalConversaoTipo === 'whatsapp')
          ? { telefoneContato: destino }
          : destino && resultado.canalConversaoTipo === 'lp'
            ? { url: destino }
            : {}
      await app.prisma.perfil.update({
        where: { id: perfilId },
        data: { canalConversaoTipo: resultado.canalConversaoTipo, canalConversaoConfirmado: true, ...dadosDestino },
      })
    }

    return reply.send({
      resposta: resultado.resposta,
      markdown: resultado.markdown,
      canalConversaoConfirmado: Boolean(resultado.canalConversaoTipo) || perfil.canalConversaoConfirmado,
    })
  })
}
