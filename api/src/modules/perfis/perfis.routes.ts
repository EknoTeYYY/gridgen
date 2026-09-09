import type { FastifyInstance } from 'fastify'
import { slugify } from '../../lib/slug.js'
import { atualizarPerfilSchema, criarPerfilSchema } from './perfis.schemas.js'

export default async function perfisRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.post('/perfis', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const body = criarPerfilSchema.parse(request.body)

    const baseSlug = slugify(body.nome)
    let slug = baseSlug
    let sufixo = 1
    while (await app.prisma.perfil.findUnique({ where: { contaId_slug: { contaId, slug } } })) {
      slug = `${baseSlug}-${++sufixo}`
    }

    const perfil = await app.prisma.perfil.create({ data: { contaId, slug, ...body } })
    return reply.code(201).send(perfil)
  })

  app.get('/perfis', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const perfis = await app.prisma.perfil.findMany({ where: { contaId }, orderBy: { createdAt: 'asc' } })
    return reply.send(perfis)
  })

  app.get('/perfis/:id', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })
    return reply.send(perfil)
  })

  app.patch('/perfis/:id', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }
    const body = atualizarPerfilSchema.parse(request.body)

    const existente = await app.prisma.perfil.findFirst({ where: { id, contaId } })
    if (!existente) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const perfil = await app.prisma.perfil.update({ where: { id }, data: body })
    return reply.send(perfil)
  })
}
