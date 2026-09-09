import type { FastifyInstance } from 'fastify'
import { atualizarItemGaleriaSchema, criarItemGaleriaSchema, criarPastaGaleriaSchema } from './galeria.schemas.js'

export default async function galeriaRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.get('/perfis/:perfilId/galeria', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const itens = await app.prisma.galeriaItem.findMany({ where: { perfilId }, orderBy: { createdAt: 'desc' } })
    return reply.send(itens)
  })

  app.post('/perfis/:perfilId/galeria', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const body = criarItemGaleriaSchema.parse(request.body)
    const item = await app.prisma.galeriaItem.create({ data: { perfilId, ...body } })
    return reply.code(201).send(item)
  })

  // "Criar pasta" sem anexar imagem nenhuma ainda — uma pasta normalmente só
  // existe por ter ≥1 GaleriaItem; isso registra o nome pra ela não sumir
  // num reload antes da primeira imagem entrar. Upsert: criar uma pasta que
  // já existe (por já ter itens, ou por já ter sido criada assim antes) não
  // é erro, só confirma o nome de novo.
  app.post('/perfis/:perfilId/galeria/pastas', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const body = criarPastaGaleriaSchema.parse(request.body)
    const pasta = await app.prisma.galeriaPasta.upsert({
      where: { perfilId_nome: { perfilId, nome: body.nome } },
      update: {},
      create: { perfilId, nome: body.nome },
    })
    return reply.code(201).send(pasta)
  })

  app.get('/perfis/:perfilId/galeria/pastas', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const pastas = await app.prisma.galeriaPasta.findMany({ where: { perfilId }, orderBy: { createdAt: 'asc' } })
    return reply.send(pastas)
  })

  app.patch('/galeria/:id', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const existente = await app.prisma.galeriaItem.findFirst({ where: { id, perfil: { contaId } } })
    if (!existente) return reply.code(404).send({ erro: 'item não encontrado' })

    const body = atualizarItemGaleriaSchema.parse(request.body)
    const item = await app.prisma.galeriaItem.update({
      where: { id },
      data: { nome: body.nome || null },
    })
    return reply.send(item)
  })

  app.delete('/galeria/:id', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const existente = await app.prisma.galeriaItem.findFirst({ where: { id, perfil: { contaId } } })
    if (!existente) return reply.code(404).send({ erro: 'item não encontrado' })

    await app.prisma.galeriaItem.delete({ where: { id } })
    return reply.code(204).send()
  })
}
