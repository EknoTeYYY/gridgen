import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { baixarComoDataUri, buscarFotos } from '../../lib/pexels.js'

const buscarQuerySchema = z.object({ q: z.string().min(1) })
const baixarQuerySchema = z.object({ url: z.string().url() })

export default async function imagensRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  // Busca de imagem de referência (Pexels) — complemento ao upload próprio,
  // pra quando o Perfil ainda não tem foto de produto/ambiente pronta.
  app.get('/imagens-referencia/buscar', async (request, reply) => {
    const { q } = buscarQuerySchema.parse(request.query)
    try {
      const fotos = await buscarFotos(q)
      return reply.send({ fotos })
    } catch (err) {
      // Detalhe real (chave ausente, erro da API do Pexels) só no log.
      app.log.error(err, 'falha ao buscar imagens de referência')
      return reply.code(502).send({ erro: 'Não foi possível buscar imagens agora. Tente novamente em instantes.' })
    }
  })

  // Baixa a imagem escolhida e devolve como data URI — mesmo formato que o
  // upload próprio usa em `photoDataUri`, sem depender do Pexels continuar no
  // ar depois que o post já foi renderizado.
  app.get('/imagens-referencia/baixar', async (request, reply) => {
    const { url } = baixarQuerySchema.parse(request.query)
    try {
      const dataUri = await baixarComoDataUri(url)
      return reply.send({ dataUri })
    } catch (err) {
      app.log.error(err, 'falha ao baixar imagem de referência')
      return reply.code(502).send({ erro: 'Não foi possível baixar a imagem escolhida. Tente novamente.' })
    }
  })
}
