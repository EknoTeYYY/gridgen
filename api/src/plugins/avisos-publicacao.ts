// Varre a cada 15min por posts com `agendadoPara` já vencido que ainda não
// receberam o e-mail de aviso — idempotente por construção (a condição
// `avisoAgendamentoEnviadoEm: null` já evita reenvio, então não precisa do
// aparato de retry/backoff da fila do calendário sazonal: uma falha de envio
// simplesmente tenta de novo na próxima varredura, sem duplicar).
import { Queue, Worker } from 'bullmq'
import fp from 'fastify-plugin'
import { Redis } from 'ioredis'
import type { FastifyInstance } from 'fastify'
import { REDE_NOME, type RedeSocial } from '@gridgen/shared'
import { env } from '../env.js'
import { enviarAvisoPublicacao } from '../lib/email.js'

const QUEUE_NAME = 'avisos-publicacao'
const JOB_ESCANEAR = 'escanear'
const REPEAT_KEY = 'avisos-publicacao-15min'

export default fp(async (app: FastifyInstance) => {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  const queue = new Queue(QUEUE_NAME, { connection })

  await queue.add(JOB_ESCANEAR, {}, { repeat: { pattern: '*/15 * * * *', key: REPEAT_KEY } })

  const repetiveis = await queue.getRepeatableJobs()
  for (const job of repetiveis) {
    if (job.key !== REPEAT_KEY) await queue.removeRepeatableByKey(job.key)
  }

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const pendentes = await app.prisma.post.findMany({
        where: { status: 'pronto', agendadoPara: { lte: new Date() }, avisoAgendamentoEnviadoEm: null },
        include: { perfil: { include: { conta: { include: { usuarios: true } } } }, saidas: true },
      })

      for (const post of pendentes) {
        const redes = [...new Set(post.saidas.map((s) => s.canal))].map(
          (canal) => REDE_NOME[canal as RedeSocial] ?? canal,
        )
        const link = `${env.WEB_APP_URL}/dashboard/perfis/${post.perfilId}/posts?post=${post.id}`

        try {
          for (const usuario of post.perfil.conta.usuarios) {
            await enviarAvisoPublicacao({
              email: usuario.email,
              perfilNome: post.perfil.nome,
              postSlug: post.slug,
              agendadoPara: post.agendadoPara!,
              redes,
              link,
            })
          }
          await app.prisma.post.update({ where: { id: post.id }, data: { avisoAgendamentoEnviadoEm: new Date() } })
          app.log.info(`aviso de publicação enviado: post ${post.id} (${post.slug})`)
        } catch (err) {
          // Não marca como enviado — a próxima varredura (15min depois) tenta
          // de novo. Detalhe real só no log, nunca em resposta HTTP nenhuma
          // (isso roda em background, sem request associada).
          app.log.error(err, `falha ao enviar aviso de publicação do post ${post.id}`)
        }
      }
    },
    { connection: connection.duplicate() },
  )

  app.addHook('onClose', async () => {
    await worker.close()
    await queue.close()
    connection.disconnect()
  })
})
