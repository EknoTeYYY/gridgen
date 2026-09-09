// Duas responsabilidades separadas de propósito: um job diário só ESCANEIA
// (decide o que falta gerar, ver calendario.service.ts) e enfileira um job
// por ocorrência — cada um ganha retry de verdade (tentativas + backoff) via
// BullMQ, em vez de um log-and-forget que só tenta de novo no dia seguinte.
// Fila própria (não a de render, que só existe pro worker de imagem): isso
// aqui é banco + IA, roda dentro do próprio processo da api.
import { Queue, Worker, type Job } from 'bullmq'
import fp from 'fastify-plugin'
import { Redis } from 'ioredis'
import type { FastifyInstance } from 'fastify'
import { env } from '../env.js'
import {
  BACKOFF_INICIAL_MS,
  candidatosPendentes,
  gerarCampanha,
  idDoJobGerar,
  JOB_GERAR_CAMPANHA,
  marcarCampanhaComoFalha,
  TENTATIVAS_GERACAO,
  type CampanhaCandidata,
} from '../modules/calendario/calendario.service.js'

const QUEUE_NAME = 'calendario-sazonal'
const JOB_ESCANEAR = 'escanear'
// Sem uma `key` explícita, a chave interna do repeatable do BullMQ nem
// sempre é estável entre boots (visto na prática: dois hashes diferentes pro
// mesmo padrão depois de reiniciar o container) — resultado: um repeatable
// "fantasma" novo a cada restart, nunca removido sozinho. Fixando a key aqui
// a fila sempre reconhece "é o mesmo agendamento", em vez de criar outro.
const REPEAT_KEY_ESCANEAR = 'escanear-diario'

// Duas formas de payload na mesma fila (o `escanear` diário não carrega
// dados) — mais simples deixar o BullMQ sem generic aqui e checar `job.name`
// em runtime do que forçar um tipo único artificial pras duas.
declare module 'fastify' {
  interface FastifyInstance {
    calendarioQueue: Queue
  }
}

// BullMQ serializa `data` como JSON — o `Date` vira string no Redis mesmo o
// tipo declarado dizendo `Date` (mesma pegadinha do `returnvalue` da fila de
// render). Reconstrói de volta antes de usar.
function candidataDoJob(dados: CampanhaCandidata): CampanhaCandidata {
  return { ...dados, data: new Date(dados.data) }
}

export default fp(async (app: FastifyInstance) => {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  const queue = new Queue(QUEUE_NAME, { connection })

  await queue.add(JOB_ESCANEAR, {}, { repeat: { pattern: '0 6 * * *', key: REPEAT_KEY_ESCANEAR } })

  // Limpa repeatables órfãos (de versões anteriores do código, ou de boots
  // antes desse fix, que criaram uma chave nova cada vez) — mantém só o
  // agendamento com a key atual.
  const repetiveis = await queue.getRepeatableJobs()
  for (const job of repetiveis) {
    // Mantém só o agendamento atual — qualquer outro repeatable nesta fila
    // (nome antigo tipo "verificar", de antes da fila ter sido dividida em
    // escanear+gerar, ou uma key diferente da atual) é resíduo e sai.
    if (job.key !== REPEAT_KEY_ESCANEAR) {
      await queue.removeRepeatableByKey(job.key)
      app.log.info(`calendário sazonal: removido agendamento órfão "${job.name}" (${job.key})`)
    }
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      if (job.name === JOB_ESCANEAR) {
        const pendentes = await candidatosPendentes(app)
        for (const c of pendentes) {
          await queue.add(JOB_GERAR_CAMPANHA, c, {
            jobId: idDoJobGerar(c),
            attempts: TENTATIVAS_GERACAO,
            backoff: { type: 'exponential', delay: BACKOFF_INICIAL_MS },
          })
        }
        if (pendentes.length > 0) app.log.info(`calendário sazonal: ${pendentes.length} geração(ões) enfileirada(s)`)
        return
      }

      if (job.name === JOB_GERAR_CAMPANHA) {
        await gerarCampanha(app, candidataDoJob(job.data as CampanhaCandidata))
      }
    },
    { connection: connection.duplicate() },
  )

  worker.on('failed', (job, err) => {
    if (!job || job.name !== JOB_GERAR_CAMPANHA) {
      app.log.error(err, 'falha ao verificar calendário sazonal')
      return
    }
    const c = candidataDoJob(job.data as CampanhaCandidata)
    app.log.error(err, `falha ao gerar campanha "${c.nome}" (tentativa ${job.attemptsMade})`)
    const esgotou = job.attemptsMade >= (typeof job.opts.attempts === 'number' ? job.opts.attempts : 1)
    if (esgotou) {
      marcarCampanhaComoFalha(app, c).catch((e) => app.log.error(e, 'falha ao registrar campanha como erro'))
    }
  })

  app.decorate('calendarioQueue', queue)
  app.addHook('onClose', async () => {
    await worker.close()
    await queue.close()
    connection.disconnect()
  })
})
