// Worker BullMQ: consome a fila "render" populada pela api, gera os PNGs
// numerados + legenda.txt de um Post, escreve num volume compartilhado com a
// api (OUTPUT_DIR) — em vez de devolver os PNGs em base64 pelo próprio job do
// BullMQ, o que incharia o Redis. A api lê os arquivos desse mesmo volume pra
// servir o download do post.
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Worker, type Job } from 'bullmq'
import { Redis } from 'ioredis'
import type { RenderJobPayload, RenderJobResult } from '@studio/shared'
import { RENDER_QUEUE_NAME } from '@studio/shared'
import { closeBrowser, getBrowser } from './browser.js'
import { dimensoesPara, pageHTML, CANVAS_SCALE } from './engine.js'

const OUTPUT_DIR = process.env.OUTPUT_DIR || '/data/output'
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const CONCORRENCIA = Number(process.env.RENDER_CONCURRENCY ?? 2)

// maxRetriesPerRequest:null é exigido pelo BullMQ em conexões usadas por Worker
// (ele mesmo controla os retries dos comandos bloqueantes).
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null })

async function processar(job: Job<RenderJobPayload>): Promise<RenderJobResult> {
  const { postId, brand, post, canal } = job.data
  const dir = canal ? path.join(OUTPUT_DIR, postId, canal) : path.join(OUTPUT_DIR, postId)
  await mkdir(dir, { recursive: true })

  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    const { largura, altura, padTop, padBottom } = dimensoesPara(post.formato)
    await page.setViewport({ width: largura, height: altura, deviceScaleFactor: CANVAS_SCALE })

    const total = post.slides.length
    const arquivos: string[] = []
    for (let i = 0; i < total; i++) {
      // Fontes e fotos já chegam embutidas como data URI — não há requisição de
      // rede de verdade pra esperar, então 'load' é suficiente (setContent nem
      // aceita 'networkidle0'/'networkidle2').
      const html = pageHTML(post.slides[i], i, total, altura, padTop, padBottom, brand)
      await page.setContent(html, { waitUntil: 'load' })
      const nome = `${String(i + 1).padStart(2, '0')}.png`
      await page.screenshot({ path: path.join(dir, nome) as `${string}.png` })
      arquivos.push(nome)
    }

    const legenda = `${post.caption}\n\n${post.hashtags}\n`
    await writeFile(path.join(dir, 'legenda.txt'), legenda, 'utf8')
    arquivos.push('legenda.txt')

    return { postId, status: 'concluido', outputDir: canal ? `${postId}/${canal}` : postId, arquivos }
  } catch (erro) {
    // Detalhe real (stack do Puppeteer/Chrome, caminho de arquivo etc.) só no
    // log deste container — o que vai no `erro` do resultado acaba na tela do
    // usuário final (via RenderJob.erroMsg), então não pode vazar internals.
    console.error(`[render] falha ao renderizar post ${postId}:`, erro)
    return { postId, status: 'erro', erro: 'Falha ao gerar as imagens. Tente novamente.' }
  } finally {
    await page.close()
  }
}

const worker = new Worker<RenderJobPayload, RenderJobResult>(RENDER_QUEUE_NAME, processar, {
  connection,
  concurrency: CONCORRENCIA,
})

worker.on('completed', (job) => console.log(`[render] job ${job.id} concluído (post ${job.data.postId})`))
worker.on('failed', (job, err) => console.error(`[render] job ${job?.id} falhou:`, err))

console.log(`[render] worker no ar — concorrência ${CONCORRENCIA}, saída em ${OUTPUT_DIR}`)

async function encerrar() {
  console.log('[render] encerrando...')
  await worker.close()
  await closeBrowser()
  process.exit(0)
}
process.on('SIGTERM', encerrar)
process.on('SIGINT', encerrar)
