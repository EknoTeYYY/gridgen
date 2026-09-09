import type { FastifyInstance } from 'fastify'
import type { RedeSocial } from '@gridgen/shared'
import { resolverImagemAutomatica } from '../../lib/imagem-automatica.js'
import { idDoJobPrepararRede } from '../../plugins/preparar-redes.js'
import { extrairHandleInstagram, proximoSlugDePost, slidesDoJson, slidesParaJson } from '../posts/posts.service.js'
import { adaptarRascunhoParaRede, gerarRascunhoComIA } from './geracao.service.js'
import { gerarComIaSchema } from './geracao.schemas.js'

const REDES_SOCIAIS: RedeSocial[] = ['instagram', 'linkedin', 'tiktok']

export default async function geracaoRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.post('/perfis/:perfilId/posts/gerar-ia', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { perfilId } = request.params as { perfilId: string }

    const perfil = await app.prisma.perfil.findFirst({ where: { id: perfilId, contaId } })
    if (!perfil) return reply.code(404).send({ erro: 'perfil não encontrado' })

    const body = gerarComIaSchema.parse(request.body)

    // O card do estilo "tweet" mostra o @ do Instagram do Perfil — sem isso
    // preenchido, o card sairia com o handle vazio. Bloqueia antes de gastar
    // a chamada de IA, mesmo espírito de `camposFaltando` pro render.
    if (body.estilo === 'tweet' && !extrairHandleInstagram(perfil.instagramUrl)) {
      return reply
        .code(400)
        .send({ erro: 'preencha o Instagram do perfil (aba Contato) antes de usar o estilo Tweet — ele aparece no card gerado' })
    }

    const contexto = await app.prisma.contextoMarkdown.findUnique({ where: { perfilId } })

    let rascunho
    try {
      rascunho = await gerarRascunhoComIA(
        body.tipo,
        contexto?.conteudoMarkdown ?? '',
        body.briefing,
        body.nome,
        body.estilo,
        body.fundoClaro ? 'light' : 'ink',
      )
    } catch (err) {
      // O detalhe real (chave ausente, erro da API da Anthropic, etc.) fica só
      // no log do servidor — nunca no corpo da resposta, que qualquer usuário
      // final do produto pode ver.
      app.log.error(err, 'falha ao gerar post via IA')
      return reply.code(502).send({ erro: 'Não foi possível gerar o conteúdo agora. Tente novamente em instantes.' })
    }

    // Pra cada slide onde a IA sugeriu uma busca de imagem (`buscasImagem`,
    // opcional no estilo "tweet", obrigatória nos slides `photo` do estilo
    // "padrão"), resolve de verdade — Galeria do Perfil primeiro, Pexels de
    // fallback — sem o usuário precisar anexar nada manualmente. Em paralelo
    // (cada slide é independente); falha em uma busca não derruba as outras
    // nem a geração (mesmo espírito de "foto sempre opcional" já
    // estabelecido no resto do produto — no pior caso, o slide `photo` cai
    // no fallback visual de gradiente que já existe).
    if (rascunho.buscasImagem) {
      await Promise.all(
        rascunho.buscasImagem.map(async (consulta, i) => {
          if (!consulta) return
          const imagem = await resolverImagemAutomatica(app.prisma, perfilId, consulta)
          if (imagem) rascunho.slides[i].photoDataUri = imagem
        }),
      )
    }

    // `rascunho.nomePost` já resolve pro nome certo (manual, se o usuário deu
    // um; senão o que a IA sugeriu) — mesmo parâmetro `tituloPersonalizado`
    // já usado pelo calendário sazonal pra nomear posts pela campanha.
    const slug = await proximoSlugDePost(app.prisma, perfilId, body.tipo, rascunho.nomePost)
    const post = await app.prisma.post.create({
      data: {
        perfilId,
        slug,
        tipo: body.tipo,
        formato: body.formato,
        caption: rascunho.caption,
        hashtags: rascunho.hashtags,
        slides: slidesParaJson(rascunho.slides),
        estiloVisual: body.estilo,
      },
    })

    // Redes extra marcadas já na criação: cada uma ganha uma SaidaEntrega
    // "em preparo" (`imagemStatus: 'processando'` desde já, não só depois de
    // adaptar — sinaliza pra tela que o pipeline automático já começou) e um
    // job que adapta o texto e, se der certo, já enfileira o render sozinho —
    // sem o usuário precisar voltar e clicar em "Adaptar"/"Gerar imagem".
    for (const canal of body.redes) {
      await app.prisma.saidaEntrega.create({
        data: { postId: post.id, canal, status: 'pendente', disponivel: false, imagemStatus: 'processando' },
      })
      await app.prepararRedesQueue.add('preparar', { postId: post.id, canal }, { jobId: idDoJobPrepararRede(post.id, canal) })
    }

    return reply.code(201).send(post)
  })

  app.post('/posts/:id/canais/:canal/adaptar', async (request, reply) => {
    const contaId = request.usuarioAtual!.contaId
    const { id, canal: canalParam } = request.params as { id: string; canal: string }
    if (!REDES_SOCIAIS.includes(canalParam as RedeSocial)) return reply.code(400).send({ erro: 'rede inválida' })
    const rede = canalParam as RedeSocial

    const post = await app.prisma.post.findFirst({ where: { id, perfil: { contaId } } })
    if (!post) return reply.code(404).send({ erro: 'post não encontrado' })

    const saida = await app.prisma.saidaEntrega.findFirst({ where: { postId: id, canal: rede } })
    if (!saida) return reply.code(400).send({ erro: 'marque essa rede pro post antes de adaptar o conteúdo pra ela' })

    const contexto = await app.prisma.contextoMarkdown.findUnique({ where: { perfilId: post.perfilId } })

    let adaptado
    try {
      adaptado = await adaptarRascunhoParaRede(post.tipo as never, contexto?.conteudoMarkdown ?? '', slidesDoJson(post.slides), rede)
    } catch (err) {
      app.log.error(err, 'falha ao adaptar post pra rede')
      return reply.code(502).send({ erro: 'Não foi possível adaptar o conteúdo agora. Tente novamente em instantes.' })
    }

    const atualizado = await app.prisma.saidaEntrega.update({
      where: { id: saida.id },
      // A imagem anterior (se houver) ficou desatualizada — mesmo espírito
      // do `PATCH /posts/:id`, que volta o Post pra "rascunho" quando o
      // conteúdo muda.
      data: {
        caption: adaptado.caption,
        hashtags: adaptado.hashtags,
        slides: slidesParaJson(adaptado.slides),
        imagemStatus: 'pendente',
      },
    })
    return reply.send(atualizado)
  })
}
