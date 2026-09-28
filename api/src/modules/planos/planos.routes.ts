import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PACOTE_EXTRA, PERFIL_EXTRA_PRECO, PLANOS } from '@gridgen/shared'
import { calcularUso } from './planos.service.js'

const solicitarUpgradeSchema = z.object({
  tipo: z.enum(['plano', 'pacote', 'perfil_extra', 'sob_medida']),
  planoId: z.enum(['essencial', 'profissional', 'agencia', 'sob_medida']).optional(),
  mensagem: z.string().max(1000).optional(),
})

export default async function planosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.get('/conta/uso', async (request, reply) => {
    return reply.send(await calcularUso(app.prisma, request.usuarioAtual!.contaId))
  })

  // Cobrança manual: o pedido vira um lead de origem "upgrade" no /admin/leads,
  // e o time comercial fecha a mudança com o cliente e aplica no painel.
  app.post('/conta/solicitar-upgrade', async (request, reply) => {
    const body = solicitarUpgradeSchema.parse(request.body)
    const { sub, contaId } = request.usuarioAtual!
    const [usuario, conta, uso] = await Promise.all([
      app.prisma.user.findUniqueOrThrow({ where: { id: sub } }),
      app.prisma.conta.findUniqueOrThrow({ where: { id: contaId } }),
      calcularUso(app.prisma, contaId),
    ])

    const pedido =
      body.tipo === 'pacote'
        ? `Pacote extra de +${PACOTE_EXTRA.geracoes} gerações (R$ ${PACOTE_EXTRA.preco})`
        : body.tipo === 'perfil_extra'
          ? `Perfil extra (R$ ${PERFIL_EXTRA_PRECO}/mês)`
          : body.tipo === 'sob_medida' || body.planoId === 'sob_medida'
            ? 'Proposta sob medida'
            : `Plano ${PLANOS[body.planoId ?? 'profissional'].nome}`
    const resumoUso = `Plano atual: ${uso.nomePlano} · gerações ${uso.geracoes.usadas}/${uso.geracoes.limite ?? '∞'} · Perfis ${uso.perfis.usados}/${uso.perfis.limite ?? '∞'}`

    await app.prisma.leadContato.create({
      data: {
        nome: usuario.nome,
        email: usuario.email,
        empresa: conta.nome,
        origem: 'upgrade',
        contaId,
        mensagem: [`Pedido: ${pedido}`, resumoUso, body.mensagem].filter(Boolean).join('\n'),
      },
    })
    return reply.code(201).send({ ok: true })
  })
}
