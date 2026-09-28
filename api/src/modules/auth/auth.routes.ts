import type { FastifyInstance } from 'fastify'
import { env } from '../../env.js'
import { enviarRedefinicaoSenha } from '../../lib/email.js'
import { gerarTokenOpaco, hashToken } from '../../lib/token.js'
import { aceitarConviteSchema, esqueciSenhaSchema, loginSchema, redefinirSenhaSchema, refreshSchema } from './auth.schemas.js'
import { conferirSenha, emitirSessao, hashSenha, revogarSessao, rotacionarSessao } from './auth.service.js'

const VALIDADE_REDEFINICAO_MIN = 60
const INTERVALO_MINIMO_MS = 60 * 1000

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

  // "Esqueci minha senha". Resposta SEMPRE igual (202), exista o e-mail ou
  // não — senão a rota vira um jeito de descobrir quem tem conta no Gridgen.
  // Pedidos repetidos em menos de 1 min pro mesmo usuário não reenviam
  // (evita usar a rota pra disparar e-mail em massa pra alguém).
  app.post('/auth/senha/esqueci', async (request, reply) => {
    const { email } = esqueciSenhaSchema.parse(request.body)
    const resposta = { ok: true, mensagem: 'Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.' }

    const user = await app.prisma.user.findUnique({ where: { email }, include: { conta: true } })
    if (!user || user.conta.status === 'inativa') return reply.code(202).send(resposta)

    const recente = await app.prisma.redefinicaoSenha.findFirst({
      where: { userId: user.id, createdAt: { gt: new Date(Date.now() - INTERVALO_MINIMO_MS) } },
    })
    if (recente) return reply.code(202).send(resposta)

    const token = gerarTokenOpaco()
    await app.prisma.$transaction([
      // Um link novo invalida os anteriores ainda não usados.
      app.prisma.redefinicaoSenha.updateMany({ where: { userId: user.id, usadoEm: null }, data: { usadoEm: new Date() } }),
      app.prisma.redefinicaoSenha.create({
        data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + VALIDADE_REDEFINICAO_MIN * 60 * 1000) },
      }),
    ])

    try {
      await enviarRedefinicaoSenha({
        email: user.email,
        nome: user.nome,
        link: `${env.WEB_APP_URL}/redefinir-senha/${token}`,
        validadeMinutos: VALIDADE_REDEFINICAO_MIN,
      })
    } catch (err) {
      // Falha de envio fica no log; a resposta continua a mesma (não vaza
      // que o e-mail existe).
      app.log.error(err, 'falha ao enviar e-mail de redefinição de senha')
    }
    return reply.code(202).send(resposta)
  })

  app.get('/auth/senha/redefinir/:token', async (request, reply) => {
    const { token } = request.params as { token: string }
    const pedido = await app.prisma.redefinicaoSenha.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } })
    if (!pedido || pedido.usadoEm || pedido.expiresAt < new Date()) {
      return reply.code(410).send({ erro: 'link inválido ou expirado' })
    }
    return reply.send({ email: pedido.user.email })
  })

  // Troca a senha, gasta o link e encerra todas as sessões abertas do usuário
  // (quem pediu a redefinição pode estar recuperando uma conta comprometida).
  app.post('/auth/senha/redefinir/:token', async (request, reply) => {
    const { token } = request.params as { token: string }
    const { senha } = redefinirSenhaSchema.parse(request.body)

    const pedido = await app.prisma.redefinicaoSenha.findUnique({ where: { tokenHash: hashToken(token) } })
    if (!pedido || pedido.usadoEm || pedido.expiresAt < new Date()) {
      return reply.code(410).send({ erro: 'link inválido ou expirado' })
    }

    const senhaHash = await hashSenha(senha)
    const agora = new Date()
    await app.prisma.$transaction([
      app.prisma.user.update({ where: { id: pedido.userId }, data: { senhaHash } }),
      app.prisma.redefinicaoSenha.update({ where: { id: pedido.id }, data: { usadoEm: agora } }),
      app.prisma.refreshToken.updateMany({ where: { userId: pedido.userId, revokedAt: null }, data: { revokedAt: agora } }),
    ])
    return reply.send({ ok: true })
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
