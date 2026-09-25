import { createReadStream, existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import archiver from 'archiver'
import type { Prisma, SaidaCanal } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { camposFaltando, type RenderJobPayload, type Slide } from '@gridgen/shared'
import { env } from '../../env.js'
import {
  arquivoValido,
  arquivosEsperados,
  brandKitDoPerfil,
  extrairHandleInstagram,
  montarPayloadRenderCanal,
  montarPayloadRenderPrincipal,
  slidesDoJson,
  slidesParaJson,
  validarSlidesContraReceita,
} from './posts.service.js'
import { agendarPostSchema, atualizarPostSchema } from './posts.schemas.js'

// Adiciona `arquivos` calculado (mesma lógica do Post: só existe lista
// esperada quando a imagem dessa rede já foi renderizada) em cada saída —
// usado pela grade/detalhe do post pra saber se já dá pra mostrar preview.
function comArquivos<T extends { imagemStatus: string; slides: unknown }>(saida: T): T & { arquivos: string[] } {
  const arquivos = saida.imagemStatus === 'concluido' ? arquivosEsperados(slidesDoJson(saida.slides).length) : []
  return { ...saida, arquivos }
}

// Fase 5 (publicação automática) ainda não existe — marcar um post pra uma
// rede aqui é só intenção/planejamento (mesmo espírito do agendamento por
// data/hora).
const CANAIS_SOCIAIS: SaidaCanal[] = ['instagram', 'linkedin', 'tiktok']

export default async function postsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.get('/perfis/:perfilId/posts', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const posts = await app.prisma.post.findMany({
      where: { perfilId },
      orderBy: { createdAt: 'desc' },
      include: { saidas: { orderBy: { createdAt: 'desc' } } },
    })
    return reply.send(posts.map((p) => ({ ...p, saidas: p.saidas.map(comArquivos) })))
  })

  app.get('/posts/:id', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const post = await app.prisma.post.findFirst({
      where: { id, perfil: { contaId } },
      include: {
        renderJobs: { orderBy: { createdAt: 'desc' }, take: 1 },
        saidas: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    // Último download de QUALQUER artefato deste post (principal ou por
    // rede) — só um sinal informativo pra tela, nunca usado pra bloquear
    // nem inferir aprovação/publicação (doc §12).
    const ultimoDownload = await app.prisma.postDownloadEvento.findFirst({
      where: { postId: id },
      orderBy: { createdAt: 'desc' },
    })

    const arquivos = post.status === 'pronto' ? arquivosEsperados(slidesDoJson(post.slides).length) : []
    return reply.send({
      ...post,
      arquivos,
      saidas: post.saidas.map(comArquivos),
      ultimoDownloadEm: ultimoDownload?.createdAt ?? null,
    })
  })

  app.patch('/posts/:id', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const existente = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!existente) return reply.code(404).send({ erro: 'post não encontrado' })

    const body = atualizarPostSchema.parse(request.body)
    if (body.slides) {
      const erroReceita = validarSlidesContraReceita(existente.tipo as never, body.slides as Slide[], existente.estiloVisual)
      if (erroReceita) return reply.code(400).send({ erro: erroReceita })
    }

    // Conteúdo mudou — o render anterior (se houver) ficou desatualizado.
    // Doc editorial: "edição gera versão nova sem herdar check" — só sobe a
    // versão quando havia de fato uma versão PRONTA sendo substituída (editar
    // um rascunho ainda não renderizado não é uma "nova versão" de nada).
    // `aprovadoEm`/`aprovadaVersao` nunca são apagados aqui: continuam sendo
    // o histórico real de quando/qual versão foi aprovada, mesmo depois de
    // uma edição — a UI compara `versao` com `aprovadaVersao` pra saber se o
    // que existe hoje já foi aprovado ou não.
    const dados: Prisma.PostUpdateInput = {
      ...(body.formato && { formato: body.formato }),
      ...(body.caption !== undefined && { caption: body.caption }),
      ...(body.hashtags !== undefined && { hashtags: body.hashtags }),
      ...(body.slides && { slides: slidesParaJson(body.slides as Slide[]) }),
      status: 'rascunho',
      ...(existente.status === 'pronto' && { versao: { increment: 1 } }),
    }
    const post = await app.prisma.post.update({ where: { id }, data: dados })
    return reply.send(post)
  })

  // Check final explícito (doc §12) — nunca inferido de download ou geração.
  // Ausência de aprovação não é rejeição, só "não informado ainda".
  app.post('/posts/:id/aprovar', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const existente = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!existente) return reply.code(404).send({ erro: 'post não encontrado' })
    if (existente.status !== 'pronto') {
      return reply.code(400).send({ erro: 'gere as imagens do post antes de aprovar' })
    }

    const post = await app.prisma.post.update({
      where: { id },
      data: { aprovadoEm: new Date(), aprovadaVersao: existente.versao },
    })
    return reply.send(post)
  })

  app.patch('/posts/:id/agendar', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const existente = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!existente) return reply.code(404).send({ erro: 'post não encontrado' })

    // Só faz sentido agendar o aviso de conteúdo que já existe de fato.
    if (existente.status !== 'pronto') {
      return reply.code(400).send({ erro: 'gere as imagens do post antes de agendar o aviso de publicação' })
    }

    const { agendadoPara } = agendarPostSchema.parse(request.body)
    const post = await app.prisma.post.update({
      where: { id },
      // Reseta o aviso por e-mail sempre que a data muda (novo agendamento
      // ou remoção) — sem isso, reagendar um post já avisado uma vez nunca
      // dispararia um segundo e-mail pro novo horário.
      data: { agendadoPara: agendadoPara ? new Date(agendadoPara) : null, avisoAgendamentoEnviadoEm: null },
    })
    return reply.send(post)
  })

  app.post('/posts/:id/canais/:canal', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id, canal: canalParam } = request.params as { id: string; canal: string }
    if (!CANAIS_SOCIAIS.includes(canalParam as SaidaCanal)) return reply.code(400).send({ erro: 'rede inválida' })
    // Instagram é sempre o formato principal do post — não é uma rede extra
    // pra marcar/desmarcar, então nem faz sentido ter uma SaidaEntrega dela.
    if (canalParam === 'instagram') {
      return reply.code(400).send({ erro: 'Instagram já é o formato principal do post, não precisa marcar' })
    }
    const canal = canalParam as SaidaCanal

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    // Tweet é exclusivo do Instagram (card de publicação de rede social não
    // faz sentido em outro lugar). Gráfico permite só LinkedIn — o mesmo
    // gráfico de barras reaproveitado, com título/legenda reescritos pro tom
    // de lá (infográfico/dado converte bem no LinkedIn, validado com o
    // usuário); TikTok continua fora, formato de vídeo curto não combina com
    // uma peça estática de dado.
    if (post.estiloVisual === 'tweet' || (post.estiloVisual === 'grafico' && canal !== 'linkedin')) {
      return reply.code(400).send({ erro: 'esse estilo não permite marcar essa rede extra' })
    }

    const existente = await app.prisma.saidaEntrega.findFirst({ where: { postId: id, canal } })
    if (existente) return reply.send(existente)

    const saida = await app.prisma.saidaEntrega.create({
      data: { postId: id, canal, status: 'pendente', disponivel: false },
    })
    return reply.code(201).send(saida)
  })

  app.delete('/posts/:id/canais/:canal', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id, canal: canalParam } = request.params as { id: string; canal: string }
    if (!CANAIS_SOCIAIS.includes(canalParam as SaidaCanal)) return reply.code(400).send({ erro: 'rede inválida' })
    if (canalParam === 'instagram') {
      return reply.code(400).send({ erro: 'Instagram é sempre o formato principal do post, não dá pra desmarcar' })
    }
    const canal = canalParam as SaidaCanal

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    // Depois de ter conteúdo (legenda adaptada ou imagem gerada), desmarcar
    // destruiria trabalho de verdade (chamada de IA, possivelmente um
    // render) — trava até o usuário decidir de propósito (readaptar não
    // ajuda aqui, teria que ser uma ação explícita de "esvaziar" que não
    // existe hoje; por ora, simplesmente bloqueado).
    const existente = await app.prisma.saidaEntrega.findFirst({ where: { postId: id, canal } })
    if (existente && (existente.caption || existente.imagemStatus === 'concluido')) {
      return reply.code(400).send({ erro: 'essa rede já tem conteúdo gerado, não dá pra desmarcar' })
    }

    await app.prisma.saidaEntrega.deleteMany({ where: { postId: id, canal } })
    await rm(path.join(env.OUTPUT_DIR, id, canal), { recursive: true, force: true })
    return reply.code(204).send()
  })

  app.delete('/posts/:id', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const existente = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!existente) return reply.code(404).send({ erro: 'post não encontrado' })

    // RenderJob/SaidaEntrega cascateiam no banco — só os arquivos gerados em
    // disco (PNGs/legenda) precisam de limpeza manual aqui.
    await app.prisma.post.delete({ where: { id } })
    await rm(path.join(env.OUTPUT_DIR, id), { recursive: true, force: true })

    return reply.code(204).send()
  })

  app.post('/posts/:id/gerar', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } }, include: { perfil: true } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    // Bloqueante: um campo obrigatório vazio vira o texto literal "undefined"
    // na imagem renderizada (o motor de render só interpola, não valida).
    const faltando = camposFaltando(slidesDoJson(post.slides))
    if (faltando.length > 0) {
      return reply.code(400).send({
        erro: 'preencha os campos obrigatórios antes de gerar',
        detalhes: faltando.map((f) => `Slide ${f.slideIndex + 1}: "${f.label}" está vazio`),
      })
    }

    // Mesma checagem já feita na criação (`/posts/gerar-ia`), repetida aqui
    // porque o Instagram do Perfil pode ter sido apagado depois — o card do
    // estilo "tweet" não pode renderizar com o @ vazio.
    if (post.estiloVisual === 'tweet' && !extrairHandleInstagram(post.perfil.instagramUrl)) {
      return reply.code(400).send({ erro: 'preencha o Instagram do perfil (aba Contato) antes de gerar as imagens deste post' })
    }

    const renderJob = await app.prisma.renderJob.create({ data: { postId: post.id, status: 'processando' } })
    await app.prisma.post.update({ where: { id: post.id }, data: { status: 'gerando' } })

    const payload = montarPayloadRenderPrincipal(post, brandKitDoPerfil(post.perfil))
    await app.renderQueue.add('render', payload, { jobId: renderJob.id })
    return reply.code(202).send({ renderJobId: renderJob.id })
  })

  app.get('/posts/:id/arquivos/:nome', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id, nome } = request.params as { id: string; nome: string }

    if (!arquivoValido(nome)) return reply.code(400).send({ erro: 'nome de arquivo inválido' })

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    const caminho = path.join(env.OUTPUT_DIR, post.id, nome)
    if (!existsSync(caminho)) return reply.code(404).send({ erro: 'arquivo não encontrado' })

    reply.type(nome.endsWith('.png') ? 'image/png' : 'text/plain; charset=utf-8')
    return reply.send(createReadStream(caminho))
  })

  // Baixa o post inteiro num .zip (imagens numeradas + legenda.txt, mesma
  // estrutura de pasta que o script original já produzia) — vira a forma
  // principal de tirar o conteúdo pronto da ferramenta, já que a entrega
  // automática (Drive) saiu de escopo e a publicação automática (Fase 5)
  // ainda não existe.
  app.get('/posts/:id/download', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id } = request.params as { id: string }

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })
    if (post.status !== 'pronto') {
      return reply.code(400).send({ erro: 'gere as imagens do post antes de baixar' })
    }

    const pastaPost = path.join(env.OUTPUT_DIR, post.id)
    if (!existsSync(pastaPost)) return reply.code(404).send({ erro: 'arquivos não encontrados' })

    // Evento técnico observável (doc §12) — registrado ANTES de servir o
    // arquivo: o download em si é o evento que importa, não uma confirmação
    // de que o navegador salvou com sucesso (isso não é observável daqui).
    await app.prisma.postDownloadEvento.create({ data: { postId: post.id, versao: post.versao } })

    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.on('error', (err) => request.log.error(err, 'falha ao montar o zip de download do post'))
    archive.directory(pastaPost, false)
    archive.finalize()

    reply.type('application/zip')
    reply.header('Content-Disposition', `attachment; filename="${post.slug}.zip"`)
    return reply.send(archive)
  })

  // Render específico de uma rede (ex.: a imagem única do LinkedIn) —
  // separado de /gerar (post principal) igual o padrão já usado no resto do
  // produto: primeiro adapta o texto, revisa, só depois gasta um render.
  app.post('/posts/:id/canais/:canal/gerar', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id, canal: canalParam } = request.params as { id: string; canal: string }
    if (!CANAIS_SOCIAIS.includes(canalParam as SaidaCanal)) return reply.code(400).send({ erro: 'rede inválida' })
    const canal = canalParam as SaidaCanal

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } }, include: { perfil: true } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    const saida = await app.prisma.saidaEntrega.findFirst({ where: { postId: id, canal } })
    if (!saida) return reply.code(404).send({ erro: 'marque essa rede pro post antes de gerar a imagem' })
    if (!saida.slides) {
      return reply.code(400).send({ erro: 'adapte o conteúdo pra essa rede antes de gerar a imagem' })
    }

    const slides = slidesDoJson(saida.slides)
    const faltando = camposFaltando(slides)
    if (faltando.length > 0) {
      return reply.code(400).send({
        erro: 'preencha os campos obrigatórios antes de gerar',
        detalhes: faltando.map((f) => `Slide ${f.slideIndex + 1}: "${f.label}" está vazio`),
      })
    }

    const renderJob = await app.prisma.renderJob.create({ data: { postId: post.id, canal, status: 'processando' } })
    await app.prisma.saidaEntrega.update({ where: { id: saida.id }, data: { imagemStatus: 'processando' } })

    const payload: RenderJobPayload = montarPayloadRenderCanal(post, brandKitDoPerfil(post.perfil), saida)
    await app.renderQueue.add('render', payload, { jobId: renderJob.id })
    return reply.code(202).send({ renderJobId: renderJob.id })
  })

  app.get('/posts/:id/canais/:canal/arquivos/:nome', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id, canal, nome } = request.params as { id: string; canal: string; nome: string }
    if (!CANAIS_SOCIAIS.includes(canal as SaidaCanal)) return reply.code(400).send({ erro: 'rede inválida' })
    if (!arquivoValido(nome)) return reply.code(400).send({ erro: 'nome de arquivo inválido' })

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    const caminho = path.join(env.OUTPUT_DIR, post.id, canal, nome)
    if (!existsSync(caminho)) return reply.code(404).send({ erro: 'arquivo não encontrado' })

    reply.type(nome.endsWith('.png') ? 'image/png' : 'text/plain; charset=utf-8')
    return reply.send(createReadStream(caminho))
  })

  app.get('/posts/:id/canais/:canal/download', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id, canal: canalParam } = request.params as { id: string; canal: string }
    if (!CANAIS_SOCIAIS.includes(canalParam as SaidaCanal)) return reply.code(400).send({ erro: 'rede inválida' })
    const canal = canalParam as SaidaCanal

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    const saida = await app.prisma.saidaEntrega.findFirst({ where: { postId: id, canal } })
    if (!saida || saida.imagemStatus !== 'concluido') {
      return reply.code(400).send({ erro: 'gere a imagem dessa rede antes de baixar' })
    }

    const pastaCanal = path.join(env.OUTPUT_DIR, post.id, canal)
    if (!existsSync(pastaCanal)) return reply.code(404).send({ erro: 'arquivos não encontrados' })

    await app.prisma.postDownloadEvento.create({ data: { postId: post.id, canal, versao: post.versao } })

    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.on('error', (err) => request.log.error(err, 'falha ao montar o zip de download por rede'))
    archive.directory(pastaCanal, false)
    archive.finalize()

    reply.type('application/zip')
    reply.header('Content-Disposition', `attachment; filename="${post.slug}-${canal}.zip"`)
    return reply.send(archive)
  })
}
