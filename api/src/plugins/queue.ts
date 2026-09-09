// Fila BullMQ: a api enfileira jobs de render (Queue) e escuta quando o
// worker `render` termina (QueueEvents) pra atualizar Post/RenderJob no
// banco — tudo dentro do próprio processo da api, sem um serviço "worker"
// separado só pra isso.
import { Queue, QueueEvents } from 'bullmq'
import fp from 'fastify-plugin'
import { Redis } from 'ioredis'
import type { FastifyInstance } from 'fastify'
import { RENDER_QUEUE_NAME, type RenderJobResult } from '@studio/shared'
import { env } from '../env.js'

declare module 'fastify' {
  interface FastifyInstance {
    renderQueue: Queue
  }
}

// Nulo (`renderJob.canal`) = render do post principal, atualiza `Post.status`
// (comportamento de sempre). Preenchido = render de uma rede específica,
// atualiza `SaidaEntrega.imagemStatus` daquele (postId, canal) em vez disso.
async function atualizarAlvoDoRender(app: FastifyInstance, renderJob: { postId: string; canal: string | null }, status: 'concluido' | 'erro') {
  if (!renderJob.canal) {
    await app.prisma.post.update({ where: { id: renderJob.postId }, data: { status: status === 'concluido' ? 'pronto' : 'erro' } })
    return
  }
  await app.prisma.saidaEntrega.updateMany({
    where: { postId: renderJob.postId, canal: renderJob.canal as never },
    data: { imagemStatus: status },
  })
}

async function marcarConcluido(app: FastifyInstance, jobId: string, resultado: RenderJobResult) {
  const renderJob = await app.prisma.renderJob
    .update({
      where: { id: jobId },
      data: {
        status: resultado.status === 'concluido' ? 'concluido' : 'erro',
        erroMsg: resultado.erro ?? null,
        finishedAt: new Date(),
      },
    })
    .catch(() => null)
  if (!renderJob) return

  await atualizarAlvoDoRender(app, renderJob, resultado.status === 'concluido' ? 'concluido' : 'erro')
}

// Só cai aqui numa falha genuína do BullMQ (crash fora do try/catch do
// worker, timeout, etc.) — o caminho normal de erro de render já vem
// sanitizado em `resultado.erro` (ver render/src/worker.ts). `motivo` pode
// conter stack/detalhe interno, então só vai pro log, nunca pro banco.
async function marcarFalha(app: FastifyInstance, jobId: string, motivo: string) {
  const renderJob = await app.prisma.renderJob
    .update({
      where: { id: jobId },
      data: { status: 'erro', erroMsg: 'Falha ao gerar as imagens. Tente novamente.', finishedAt: new Date() },
    })
    .catch(() => null)
  if (!renderJob) return

  app.log.error(new Error(motivo), `job de render ${jobId} falhou`)
  await atualizarAlvoDoRender(app, renderJob, 'erro')
}

export default fp(async (app: FastifyInstance) => {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  const queue = new Queue(RENDER_QUEUE_NAME, { connection })
  const queueEvents = new QueueEvents(RENDER_QUEUE_NAME, { connection: connection.duplicate() })

  queueEvents.on('completed', ({ jobId, returnvalue }) => {
    // O próprio BullMQ já faz JSON.parse(returnvalue) internamente antes de
    // emitir o evento (ver queue-events.js) — o tipo declarado é `string`,
    // mas em runtime já chega como objeto. Fazer parse de novo aqui quebrava
    // com "[object Object] is not valid JSON" e o Post nunca saía de "gerando".
    const resultado = returnvalue as unknown as RenderJobResult
    marcarConcluido(app, jobId, resultado).catch((err) => app.log.error(err, 'falha ao processar job concluído'))
  })
  queueEvents.on('failed', ({ jobId, failedReason }) => {
    marcarFalha(app, jobId, failedReason).catch((err) => app.log.error(err, 'falha ao processar job com erro'))
  })

  app.decorate('renderQueue', queue)
  app.addHook('onClose', async () => {
    await queueEvents.close()
    await queue.close()
    connection.disconnect()
  })
})
