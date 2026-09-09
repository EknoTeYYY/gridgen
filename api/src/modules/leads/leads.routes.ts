import type { FastifyInstance } from 'fastify'
import { criarLeadSchema } from './leads.schemas.js'

// Rota pública de propósito — quem preenche o formulário "Fale com a gente"
// da LP ainda não tem conta nem sessão. A listagem (pra Eknotech ver os
// leads) fica no módulo admin, atrás de authenticate + requireSuperAdmin.
export default async function leadsRoutes(app: FastifyInstance) {
  app.post('/leads', async (request, reply) => {
    const body = criarLeadSchema.parse(request.body)
    await app.prisma.leadContato.create({ data: body })
    return reply.code(201).send({ ok: true })
  })
}
