// Prepara automaticamente uma rede extra (LinkedIn/TikTok) já na criação do
// post: só o TEXTO (mesma lógica de `POST /canais/:canal/adaptar`), em
// background, sem o usuário precisar voltar e clicar em nada. A IMAGEM fica
// de propósito como passo manual — mesmo motivo do post principal nunca
// renderizar sozinho: sem foto de referência (galeria/Pexels) escolhida pelo
// usuário, a capa cai no fallback de gradiente da marca, o que ficou "seco"
// na prática (achado real reportado pelo usuário, corrigido aqui). Fila
// própria (não a de render, que só existe pro worker de imagem): isso aqui é
// banco + IA, roda dentro do próprio processo da api — mesmo espírito do
// `calendario-sazonal`.
import { Queue, Worker, type Job } from 'bullmq'
import fp from 'fastify-plugin'
import { Redis } from 'ioredis'
import type { FastifyInstance } from 'fastify'
import type { RedeSocial } from '@gridgen/shared'
import { env } from '../env.js'
import { adaptarRascunhoParaRede } from '../modules/geracao/geracao.service.js'
import { slidesDoJson, slidesParaJson } from '../modules/posts/posts.service.js'

const QUEUE_NAME = 'preparar-redes'

export interface PrepararRedeJobData {
  postId: string
  canal: RedeSocial
}

// `|`, não `:` — BullMQ rejeita jobId com ":" (achado real numa rodada
// anterior desta sessão, no agendador do calendário sazonal).
export function idDoJobPrepararRede(postId: string, canal: RedeSocial): string {
  return `${postId}|${canal}`
}

declare module 'fastify' {
  interface FastifyInstance {
    prepararRedesQueue: Queue<PrepararRedeJobData>
  }
}

async function marcarErro(app: FastifyInstance, postId: string, canal: RedeSocial) {
  await app.prisma.saidaEntrega
    .updateMany({ where: { postId, canal: canal as never }, data: { imagemStatus: 'erro' } })
    .catch(() => null)
}

export default fp(async (app: FastifyInstance) => {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  const queue = new Queue<PrepararRedeJobData>(QUEUE_NAME, { connection })

  const worker = new Worker<PrepararRedeJobData>(
    QUEUE_NAME,
    async (job: Job<PrepararRedeJobData>) => {
      const { postId, canal } = job.data
      const post = await app.prisma.post.findUnique({ where: { id: postId } })
      const saida = await app.prisma.saidaEntrega.findFirst({ where: { postId, canal: canal as never } })
      // Post ou rede podem ter sido removidos/desmarcados nesse meio tempo —
      // nada a preparar, não é uma falha de verdade.
      if (!post || !saida) return

      const contexto = await app.prisma.contextoMarkdown.findUnique({ where: { perfilId: post.perfilId } })

      let adaptado
      try {
        adaptado = await adaptarRascunhoParaRede(
          post.tipo as never,
          contexto?.conteudoMarkdown ?? '',
          slidesDoJson(post.slides),
          canal,
          post.estiloVisual as never,
        )
      } catch (err) {
        app.log.error(err, `falha ao preparar rede "${canal}" automaticamente pro post ${postId}`)
        await marcarErro(app, postId, canal)
        return
      }

      // `imagemStatus` volta pra "pendente" (não "concluido"): o texto pronto
      // já fica visível na hora, a imagem é o próximo passo — o usuário
      // escolhe uma foto (ou aceita o fallback) e clica "Gerar imagem", igual
      // ao fluxo manual de sempre.
      await app.prisma.saidaEntrega.update({
        where: { id: saida.id },
        data: { caption: adaptado.caption, hashtags: adaptado.hashtags, slides: slidesParaJson(adaptado.slides), imagemStatus: 'pendente' },
      })
    },
    { connection: connection.duplicate() },
  )

  worker.on('failed', (job, err) => {
    app.log.error(err, `job de preparar-redes ${job?.id} falhou de forma inesperada`)
    if (job?.data) marcarErro(app, job.data.postId, job.data.canal).catch(() => null)
  })

  app.decorate('prepararRedesQueue', queue)
  app.addHook('onClose', async () => {
    await worker.close()
    await queue.close()
    connection.disconnect()
  })
})
