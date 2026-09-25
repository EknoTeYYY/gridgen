import Fastify from 'fastify'
import { ZodError } from 'zod'
import authPlugin from './plugins/auth.js'
import avisosPublicacaoPlugin from './plugins/avisos-publicacao.js'
import prepararRedesPlugin from './plugins/preparar-redes.js'
import prismaPlugin from './plugins/prisma.js'
import queuePlugin from './plugins/queue.js'
import schedulerPlugin from './plugins/scheduler.js'
import adminRoutes from './modules/admin/admin.routes.js'
import authRoutes from './modules/auth/auth.routes.js'
import calendarioRoutes from './modules/calendario/calendario.routes.js'
import calendarioMensalRoutes from './modules/calendario-mensal/calendario-mensal.routes.js'
import contextoRoutes from './modules/contexto/contexto.routes.js'
import galeriaRoutes from './modules/galeria/galeria.routes.js'
import geracaoRoutes from './modules/geracao/geracao.routes.js'
import imagensRoutes from './modules/imagens/imagens.routes.js'
import leadsRoutes from './modules/leads/leads.routes.js'
import perfisRoutes from './modules/perfis/perfis.routes.js'
import postsRoutes from './modules/posts/posts.routes.js'

export async function buildApp() {
  // Padrão do Fastify é 1MB de corpo — pequeno demais pra posts com fotos em
  // base64 (várias por post) e assets de BrandKit embutidos. 25MB dá folga
  // sem ser irrestrito.
  const app = Fastify({ logger: true, bodyLimit: 25 * 1024 * 1024 })

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ erro: 'validação falhou', detalhes: error.flatten() })
    }
    // Erros que o próprio Fastify já classifica como erro de cliente (ex.:
    // FST_ERR_CTP_EMPTY_JSON_BODY) carregam seu próprio statusCode — repassa
    // em vez de mascarar tudo como 500 "erro interno".
    if (error instanceof Error && 'statusCode' in error) {
      const statusCode = (error as Error & { statusCode?: unknown }).statusCode
      if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
        return reply.code(statusCode).send({ erro: error.message })
      }
    }
    request.log.error(error)
    return reply.code(500).send({ erro: 'erro interno' })
  })

  await app.register(prismaPlugin)
  await app.register(authPlugin)
  await app.register(queuePlugin)
  await app.register(prepararRedesPlugin)
  await app.register(schedulerPlugin)
  await app.register(avisosPublicacaoPlugin)

  app.get('/health', async () => ({ status: 'ok' }))

  await app.register(authRoutes)
  await app.register(adminRoutes)
  await app.register(perfisRoutes)
  await app.register(postsRoutes)
  await app.register(contextoRoutes)
  await app.register(geracaoRoutes)
  await app.register(imagensRoutes)
  await app.register(calendarioRoutes)
  await app.register(calendarioMensalRoutes)
  await app.register(galeriaRoutes)
  await app.register(leadsRoutes)

  return app
}
