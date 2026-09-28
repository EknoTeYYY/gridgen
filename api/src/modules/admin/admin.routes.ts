import type { FastifyInstance } from 'fastify'
import { requireSuperAdmin } from '../../plugins/auth.js'
import { PACOTE_EXTRA, PILOTO_DIAS } from '@gridgen/shared'
import { calcularUso, cicloAtual } from '../planos/planos.service.js'
import {
  adicionarPacoteSchema,
  alterarPlanoContaSchema,
  alterarStatusContaSchema,
  criarContaSchema,
  reenviarConviteSchema,
} from './admin.schemas.js'
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

  app.patch('/admin/contas/:id/plano', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = alterarPlanoContaSchema.parse(request.body)

    const conta = await app.prisma.conta.findUnique({ where: { id } })
    if (!conta) return reply.code(404).send({ erro: 'conta não encontrada' })

    // Piloto: prazo informado vale (inclusive `null` = sem prazo); sem o campo,
    // mantém o que já existia ou ganha os 14 dias padrão. Sair do piloto limpa
    // o prazo (não vale mais nada).
    const pilotoExpiraEm =
      body.plano !== 'piloto'
        ? null
        : body.pilotoExpiraEm !== undefined
          ? body.pilotoExpiraEm
          : conta.pilotoExpiraEm ?? new Date(Date.now() + PILOTO_DIAS * 24 * 60 * 60 * 1000)

    await app.prisma.conta.update({
      where: { id },
      data: {
        plano: body.plano,
        pilotoExpiraEm,
        ...(body.reiniciarCiclo ? { cicloInicio: new Date(), geracoesExtras: 0, geracoesExtrasCiclo: null } : {}),
        ...(body.limiteGeracoes !== undefined ? { limiteGeracoes: body.limiteGeracoes } : {}),
        ...(body.limitePerfis !== undefined ? { limitePerfis: body.limitePerfis } : {}),
        ...(body.perfisExtras !== undefined ? { perfisExtras: body.perfisExtras } : {}),
      },
    })
    return reply.send(await calcularUso(app.prisma, id))
  })

  // Pacote extra vale só pro ciclo atual — lançar num ciclo novo zera o que
  // sobrou do ciclo anterior (não acumula).
  app.post('/admin/contas/:id/pacote-extra', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { pacotes } = adicionarPacoteSchema.parse(request.body)

    const conta = await app.prisma.conta.findUnique({ where: { id } })
    if (!conta) return reply.code(404).send({ erro: 'conta não encontrada' })

    const { inicio } = cicloAtual(conta.cicloInicio)
    const mesmoCiclo = conta.geracoesExtrasCiclo?.getTime() === inicio.getTime()
    await app.prisma.conta.update({
      where: { id },
      data: {
        geracoesExtras: (mesmoCiclo ? conta.geracoesExtras : 0) + pacotes * PACOTE_EXTRA.geracoes,
        geracoesExtrasCiclo: inicio,
      },
    })
    return reply.send(await calcularUso(app.prisma, id))
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
