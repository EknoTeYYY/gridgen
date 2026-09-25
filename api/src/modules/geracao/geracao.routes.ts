import type { FastifyInstance } from 'fastify'
import { type RedeSocial } from '@gridgen/shared'
import { resolverImagemAutomatica } from '../../lib/imagem-automatica.js'
import { idDoJobPrepararRede } from '../../plugins/preparar-redes.js'
import {
  extrairHandleInstagram,
  proximoSlugDePost,
  resolverMetodoConversaoPadrao,
  slidesDoJson,
  slidesParaJson,
  textoConversao,
} from '../posts/posts.service.js'
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

    // Prova Social nunca pode ser fabricada (doc editorial: "não produzir
    // Prova Social fictícia") — exige pelo menos 1 print real já guardado na
    // pasta "Prova Social" da Galeria antes de gastar a chamada de IA.
    if (body.tipo === 'prova_social') {
      const temMaterial = await app.prisma.galeriaItem.count({ where: { perfilId, pasta: 'Prova Social' } })
      if (temMaterial === 0) {
        return reply.code(400).send({
          erro: 'adicione pelo menos um print de feedback real na pasta "Prova Social" da Galeria antes de gerar este tipo de post',
        })
      }
    }

    // Pasta de referência da publicação (ex.: "Imóvel Lançamento X") — material
    // real específico dessa peça, não do Perfil todo. Confere que a pasta
    // existe de verdade antes de gastar a chamada de IA (mesmo espírito do
    // gate de Prova Social) — sem isso, um nome digitado errado passaria
    // batido e caía silenciosamente na busca genérica, sem avisar ninguém.
    let imagensReferencia: string[] = []
    if (body.pastaReferencia) {
      const itensReferencia = await app.prisma.galeriaItem.findMany({
        where: { perfilId, pasta: body.pastaReferencia },
        orderBy: { createdAt: 'asc' },
      })
      if (itensReferencia.length === 0) {
        return reply.code(400).send({
          erro: `a pasta "${body.pastaReferencia}" da Galeria não tem nenhuma imagem — confira o nome ou adicione as fotos de referência antes de gerar`,
        })
      }
      imagensReferencia = itensReferencia.map((item) => item.url)
    }

    const contexto = await app.prisma.contextoMarkdown.findUnique({ where: { perfilId } })
    const metodoConversao = body.metodoConversao ?? resolverMetodoConversaoPadrao(body.tipo, perfil)

    let rascunho
    try {
      rascunho = await gerarRascunhoComIA(
        body.tipo,
        contexto?.conteudoMarkdown ?? '',
        body.briefing,
        body.nome,
        body.estilo,
        body.fundoClaro ? 'light' : 'ink',
        metodoConversao,
      )
    } catch (err) {
      // O detalhe real (chave ausente, erro da API da Anthropic, etc.) fica só
      // no log do servidor — nunca no corpo da resposta, que qualquer usuário
      // final do produto pode ver.
      app.log.error(err, 'falha ao gerar post via IA')
      return reply.code(502).send({ erro: 'Não foi possível gerar o conteúdo agora. Tente novamente em instantes.' })
    }

    // Pra cada slide onde a IA sugeriu uma busca de imagem (`buscasImagem`,
    // obrigatória só na capa e no layout `photo` — opcional nos demais, pra o
    // carrossel variar entre telas flat e humanizadas, ver comentário de
    // `layoutsComImagemObrigatoria` em geracao.service.ts), resolve de
    // verdade sem o usuário precisar anexar nada manualmente — nessa ordem:
    // 1) pasta de referência da publicação (quando informada), uma imagem
    // DISTINTA por slide, em ordem; 2) Galeria geral do Perfil por palavra-
    // chave; 3) Pexels. Falha em uma busca não derruba as outras nem a
    // geração (mesmo espírito de "foto sempre opcional" já estabelecido no
    // resto do produto — no pior caso, o slide cai no fallback visual de
    // gradiente que já existe).
    if (rascunho.buscasImagem) {
      await Promise.all(
        rascunho.buscasImagem.map(async (consulta, i) => {
          if (imagensReferencia[i]) {
            rascunho.slides[i].photoDataUri = imagensReferencia[i]
            return
          }
          if (!consulta) return
          const imagem = await resolverImagemAutomatica(app.prisma, perfilId, consulta)
          if (imagem) rascunho.slides[i].photoDataUri = imagem
        }),
      )
    }

    // O slide de CTA (quando existe na receita do tipo) nunca tem a URL
    // preenchida pela IA (excluída do schema em `schemaParaLayout`) — resolve
    // aqui, a partir de dado real do Perfil, nunca inventado.
    const slideCta = rascunho.slides.find((s) => s.layout === 'cta')
    if (slideCta) slideCta.url = textoConversao(metodoConversao, perfil)

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
        metodoConversao,
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
      adaptado = await adaptarRascunhoParaRede(
        post.tipo as never,
        contexto?.conteudoMarkdown ?? '',
        slidesDoJson(post.slides),
        rede,
        post.estiloVisual as never,
      )
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
