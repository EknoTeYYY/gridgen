import type { FastifyInstance } from 'fastify'
import { requireSuperAdmin } from '../../plugins/auth.js'
import { alterarStatusContaSchema, criarContaSchema, reenviarConviteSchema } from './admin.schemas.js'
import {
  alterarStatusConta,
  criarContaComConvite,
  excluirConta,
  listarContas,
  reenviarConvite,
} from './admin.service.js'

export default async function adminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)
  app.addHook('preHandler', requireSuperAdmin)

  app.get('/admin/contas', async (_request, reply) => {
    const contas = await listarContas(app.prisma)
    return reply.send(contas)
  })

  app.get('/admin/leads', async (_request, reply) => {
    const leads = await app.prisma.leadContato.findMany({ orderBy: { createdAt: 'desc' } })
    return reply.send(leads)
  })

  app.post('/admin/contas', async (request, reply) => {
    const body = criarContaSchema.parse(request.body)
    const criadoPorUserId = request.usuarioAtual!.sub

    const { conta, emailEnviado } = await criarContaComConvite(app.prisma, {
      nome: body.nome,
      email: body.email,
      criadoPorUserId,
    })
    return reply.code(201).send({ conta, emailEnviado })
  })

  app.post('/admin/contas/:id/convite/reenviar', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = reenviarConviteSchema.parse(request.body ?? {})
    const criadoPorUserId = request.usuarioAtual!.sub

    const conta = await app.prisma.conta.findUnique({ where: { id } })
    if (!conta) return reply.code(404).send({ erro: 'conta não encontrada' })

    const jaTemUsuario = await app.prisma.user.findFirst({ where: { contaId: id } })
    if (jaTemUsuario) return reply.code(409).send({ erro: 'essa conta já tem um usuário ativo' })

    const ultimoConvite = await app.prisma.conviteConta.findFirst({
      where: { contaId: id },
      orderBy: { createdAt: 'desc' },
    })
    const email = body.email ?? ultimoConvite?.email
    if (!email) return reply.code(400).send({ erro: 'informe o e-mail do convite' })

    const { emailEnviado } = await reenviarConvite(app.prisma, { contaId: id, email, criadoPorUserId })
    return reply.send({ emailEnviado })
  })

  app.patch('/admin/contas/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = alterarStatusContaSchema.parse(request.body)

    const conta = await app.prisma.conta.findUnique({ where: { id } })
    if (!conta) return reply.code(404).send({ erro: 'conta não encontrada' })

    const { erro } = await alterarStatusConta(app.prisma, id, body.status)
    if (erro) return reply.code(409).send({ erro })
    return reply.send({ status: body.status })
  })

  app.delete('/admin/contas/:id', async (request, reply) => {
    const { id } = request.params as { id: string }

    const conta = await app.prisma.conta.findUnique({ where: { id } })
    if (!conta) return reply.code(404).send({ erro: 'conta não encontrada' })

    const { erro } = await excluirConta(app.prisma, id)
    if (erro) return reply.code(409).send({ erro })
    return reply.code(204).send()
  })
}
