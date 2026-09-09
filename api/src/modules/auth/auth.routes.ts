import type { FastifyInstance } from 'fastify'
import { hashToken } from '../../lib/token.js'
import { aceitarConviteSchema, loginSchema, refreshSchema } from './auth.schemas.js'
import { conferirSenha, emitirSessao, hashSenha, revogarSessao, rotacionarSessao } from './auth.service.js'

export default async function authRoutes(app: FastifyInstance) {
  // Não existe mais autocadastro público — Contas são provisionadas por um
  // superadmin (módulo admin) e o primeiro usuário de cada uma entra através
  // de um convite por e-mail, aceito aqui.
  app.get('/auth/convite/:token', async (request, reply) => {
    const { token } = request.params as { token: string }

    const convite = await app.prisma.conviteConta.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { conta: true },
    })
    if (!convite) return reply.code(404).send({ erro: 'convite não encontrado' })
    if (convite.aceitoEm || convite.revokedAt || convite.expiresAt < new Date()) {
      return reply.code(410).send({ erro: 'convite inválido ou expirado' })
    }

    return reply.send({ email: convite.email, contaNome: convite.conta.nome })
  })

  app.post('/auth/convite/:token/aceitar', async (request, reply) => {
    const { token } = request.params as { token: string }
    const body = aceitarConviteSchema.parse(request.body)

    const convite = await app.prisma.conviteConta.findUnique({ where: { tokenHash: hashToken(token) } })
    if (!convite) return reply.code(404).send({ erro: 'convite não encontrado' })
    if (convite.aceitoEm || convite.revokedAt || convite.expiresAt < new Date()) {
      return reply.code(410).send({ erro: 'convite inválido ou expirado' })
    }

    const existente = await app.prisma.user.findUnique({ where: { email: convite.email } })
    if (existente) return reply.code(409).send({ erro: 'e-mail já cadastrado' })

    const user = await app.prisma.$transaction(async (tx) => {
      const novoUser = await tx.user.create({
        data: {
          contaId: convite.contaId,
          nome: body.nome,
          email: convite.email,
          senhaHash: await hashSenha(body.senha),
          papel: 'owner',
        },
      })
      await tx.conviteConta.update({ where: { id: convite.id }, data: { aceitoEm: new Date() } })
      return novoUser
    })

    const conta = await app.prisma.conta.findUniqueOrThrow({ where: { id: convite.contaId } })
    const sessao = await emitirSessao(app.prisma, user.id, conta.id, user.isSuperAdmin)
    return reply.code(201).send({
      conta: { id: conta.id, nome: conta.nome, slug: conta.slug },
      user: { id: user.id, nome: user.nome, email: user.email },
      ...sessao,
    })
  })

  app.post('/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const user = await app.prisma.user.findUnique({ where: { email: body.email }, include: { conta: true } })
    if (!user || !(await conferirSenha(body.senha, user.senhaHash))) {
      return reply.code(401).send({ erro: 'e-mail ou senha inválidos' })
    }
    if (user.conta.status === 'inativa') {
      return reply.code(403).send({ erro: 'esta conta está inativa — fale com quem administra o Gridgen' })
    }

    const sessao = await emitirSessao(app.prisma, user.id, user.contaId, user.isSuperAdmin)
    return reply.send({ user: { id: user.id, nome: user.nome, email: user.email }, ...sessao })
  })

  app.post('/auth/refresh', async (request, reply) => {
    const body = refreshSchema.parse(request.body)
    try {
      const sessao = await rotacionarSessao(app.prisma, body.refreshToken)
      return reply.send(sessao)
    } catch {
      return reply.code(401).send({ erro: 'refresh token inválido, expirado ou revogado' })
    }
  })

  app.post('/auth/logout', async (request, reply) => {
    const body = refreshSchema.parse(request.body)
    await revogarSessao(app.prisma, body.refreshToken)
    return reply.code(204).send()
  })

  app.get('/me', { preHandler: app.authenticate }, async (request, reply) => {
    const payload = request.usuarioAtual!
    const user = await app.prisma.user.findUnique({ where: { id: payload.sub }, include: { conta: true } })
    if (!user) return reply.code(404).send({ erro: 'usuário não encontrado' })

    return reply.send({
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      isSuperAdmin: user.isSuperAdmin,
      conta: { id: user.conta.id, nome: user.conta.nome, slug: user.conta.slug },
    })
  })
}
