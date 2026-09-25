import type { Prisma, PrismaClient } from '@prisma/client'
import {
  METODO_CONVERSAO_PADRAO,
  receitaDe,
  TIPOS,
  type BrandKit,
  type MetodoConversao,
  type RenderJobPayload,
  type Slide,
  type TipoConteudo,
} from '@gridgen/shared'

// Prisma tipa a coluna Json como JsonValue (leitura) / InputJsonValue
// (escrita) — nenhum dos dois casa direto com Slide[], então o cast passa
// por `unknown` nas duas pontas. O formato real é garantido pelo zod na
// entrada e pelo próprio motor de render na saída.
export function slidesParaJson(slides: Slide[]): Prisma.InputJsonValue {
  return slides as unknown as Prisma.InputJsonValue
}
export function slidesDoJson(json: unknown): Slide[] {
  return json as unknown as Slide[]
}

// Título exibido pro usuário (card na lista) — nome legível do tipo de
// conteúdo, não a chave técnica ("dor", "oferta"...). Nomes compostos da
// receita ("Dor / Provocação") viram só a primeira palavra.
function tituloDoTipo(tipo: TipoConteudo): string {
  return TIPOS[tipo].nome.split(' / ')[0]
}

// `tituloPersonalizado` sobrescreve o nome legível do tipo — usado pelo
// calendário sazonal, pra o post gerado se chamar "Dia dos Pais-1" em vez de
// "Oferta-1" (identifica a campanha de cara, sem precisar abrir o post).
export async function proximoSlugDePost(
  prisma: PrismaClient,
  perfilId: string,
  tipo: TipoConteudo,
  tituloPersonalizado?: string,
): Promise<string> {
  const titulo = tituloPersonalizado ?? tituloDoTipo(tipo)
  let n = 1
  let slug = `${titulo}-${n}`
  while (await prisma.post.findUnique({ where: { perfilId_slug: { perfilId, slug } } })) {
    n++
    slug = `${titulo}-${n}`
  }
  return slug
}

// A consistência visual do tipo de conteúdo depende de seguir a receita
// (mesmo princípio do render.mjs original — só que aqui vira validação de
// verdade, não um aviso que não bloqueia, já que agora o conteúdo entra
// estruturado por formulário, não editado à mão num JSON). No estilo "tweet"
// a CONTAGEM de slides ainda vem da receita do tipo (é ela que decide quantas
// telas a narrativa precisa), mas a sequência de layouts não se aplica — todo
// slide é `tweet`, não `photo/split/word/...`. No estilo "padrao" a contagem
// é flexível dentro de `minTelas`/`maxTelas` (doc editorial: "extensão
// conforme narrativa, até dez telas") — não precisa mais bater exatamente
// com `receita.receita.length`, só respeitar a faixa, abrir com a capa do
// tipo, e usar só layouts já previstos na receita.
export function validarSlidesContraReceita(tipo: TipoConteudo, slides: Slide[], estiloVisual = 'padrao'): string | null {
  // Peça estática única, independente da receita do tipo (mesmo espírito do
  // "tweet", só que a contagem de slides também não se aplica aqui — sempre
  // exatamente 1, do layout `grafico`).
  if (estiloVisual === 'grafico') {
    if (slides.length !== 1 || slides[0].layout !== 'grafico') {
      return `no estilo "gráfico" o post deveria ter 1 slide só, do layout "grafico"`
    }
    return null
  }
  const receita = receitaDe(tipo)
  if (estiloVisual === 'tweet') {
    if (slides.length !== receita.receita.length) {
      return `a receita de "${tipo}" espera ${receita.receita.length} slides, vieram ${slides.length}`
    }
    const fora = slides.find((s) => s.layout !== 'tweet')
    if (fora) return `no estilo "tweet" todo slide deveria ser do layout "tweet", veio "${fora.layout}"`
    return null
  }
  if (slides.length < receita.minTelas || slides.length > receita.maxTelas) {
    return `o tipo "${tipo}" aceita entre ${receita.minTelas} e ${receita.maxTelas} slides, vieram ${slides.length}`
  }
  if (slides[0]?.layout !== receita.capa.layout) {
    return `o primeiro slide deveria ser a capa ("${receita.capa.layout}"), veio "${slides[0]?.layout}"`
  }
  const layoutsPermitidos = new Set(receita.receita)
  for (let i = 0; i < slides.length; i++) {
    if (!layoutsPermitidos.has(slides[i].layout)) {
      return `slide ${i + 1}: layout "${slides[i].layout}" não é usado pelo tipo "${tipo}"`
    }
  }
  return null
}

const NOME_ARQUIVO_VALIDO = /^([0-9]{2}\.png|legenda\.txt)$/

export function arquivoValido(nome: string): boolean {
  return NOME_ARQUIVO_VALIDO.test(nome)
}

export function arquivosEsperados(totalSlides: number): string[] {
  const nomes = Array.from({ length: totalSlides }, (_, i) => `${String(i + 1).padStart(2, '0')}.png`)
  nomes.push('legenda.txt')
  return nomes
}

// Extrai um "@handle" normalizado do que o usuário digitou em
// `Perfil.instagramUrl` (o campo aceita livremente "@fulano", "fulano" ou a
// URL completa) — usado pelo card do layout `tweet`, que mostra o @ do
// Instagram do Perfil (não é uma rede nova: o card é publicado no próprio
// Instagram, só imita o visual de uma publicação de rede social).
export function extrairHandleInstagram(valor: string | null): string | null {
  if (!valor) return null
  const semProtocolo = valor.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  const semDominio = semProtocolo.replace(/^instagram\.com\//i, '')
  const semBarras = semDominio.replace(/^\/+|\/+$/g, '')
  const semQuery = semBarras.split(/[?#]/)[0].trim()
  const usuario = semQuery.replace(/^@/, '')
  return usuario ? `@${usuario}` : null
}

// Destino mostrado no slide final de CTA — nunca inventado pela IA (ver
// `DIRECAO_CONVITE_POR_METODO`/`schemaParaLayout`). Resolvido aqui, a partir
// de dado real do Perfil, pros métodos que precisam de um; "comentario"
// nunca precisou de nada, "link_bio"/"whatsapp_bio"/"cardapio_bio" são
// sempre o mesmo texto fixo (não dependem do Perfil ter link configurado —
// o destino de verdade é o link da própria bio do Instagram, fora do
// controle da ferramenta). Perfil sem o dado necessário (telefone/site
// vazio) simplesmente devolve string vazia — o slide sai só com o convite,
// sem destino, sem bloquear a geração.
export function textoConversao(
  metodo: MetodoConversao,
  perfil: { telefoneContato: string | null; url: string | null },
): string {
  if (metodo === 'ligacao' || metodo === 'whatsapp') return perfil.telefoneContato ?? ''
  if (metodo === 'lp') return perfil.url ?? ''
  if (metodo === 'link_bio' || metodo === 'whatsapp_bio' || metodo === 'cardapio_bio') return 'Link na bio'
  return ''
}

// Doc editorial: "coletar canal no diagnóstico e recuperar destino
// confirmado pra CTA executável" — uma vez que o Perfil confirma um canal
// real (via chat de contexto), ele substitui o padrão genérico por tipo
// (`METODO_CONVERSAO_PADRAO`) pra qualquer post gerado depois, sem precisar
// perguntar de novo a cada post. "Conexão" fica de fora de propósito: o tipo
// existe pra identificação/engajamento leve, nunca deveria empurrar o canal
// de venda em toda peça (mesmo com um canal já confirmado).
export function resolverMetodoConversaoPadrao(
  tipo: TipoConteudo,
  perfil: { canalConversaoTipo: string | null; canalConversaoConfirmado: boolean },
): MetodoConversao {
  if (tipo !== 'conexao' && perfil.canalConversaoConfirmado && perfil.canalConversaoTipo) {
    return perfil.canalConversaoTipo as MetodoConversao
  }
  return METODO_CONVERSAO_PADRAO[tipo]
}

export function brandKitDoPerfil(perfil: {
  nome: string
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  corTexto: string
  fonte: string
  logoColorUrl: string | null
  logoBrancoUrl: string | null
  iconeColorUrl: string | null
  iconeBrancoUrl: string | null
  lockupTag: string | null
  url: string | null
  temaPadrao: string
  instagramUrl: string | null
}): BrandKit {
  return {
    corPrimaria: perfil.corPrimaria,
    corSecundaria: perfil.corSecundaria,
    corFundo: perfil.corFundo,
    corTexto: perfil.corTexto,
    fonte: perfil.fonte as BrandKit['fonte'],
    logoColorUrl: perfil.logoColorUrl,
    logoBrancoUrl: perfil.logoBrancoUrl,
    iconeColorUrl: perfil.iconeColorUrl,
    iconeBrancoUrl: perfil.iconeBrancoUrl,
    lockupTag: perfil.lockupTag,
    url: perfil.url,
    temaPadrao: perfil.temaPadrao as BrandKit['temaPadrao'],
    nome: perfil.nome,
    instagramHandle: extrairHandleInstagram(perfil.instagramUrl),
  }
}

// Compartilhado entre a rota manual (`POST /posts/:id/gerar`) e a geração
// automática do calendário (`calendario.service.ts`, ao aprovar o mês) — o
// mesmo payload de render do post principal, venha o gatilho de onde vier.
export function montarPayloadRenderPrincipal(
  post: { id: string; slug: string; tipo: string; formato: string; caption: string; hashtags: string; slides: unknown },
  brand: BrandKit,
): RenderJobPayload {
  return {
    postId: post.id,
    brand,
    post: {
      slug: post.slug,
      tipo: post.tipo as never,
      formato: post.formato as never,
      caption: post.caption,
      hashtags: post.hashtags,
      slides: slidesDoJson(post.slides),
    },
  }
}

// Compartilhado entre a rota manual (`POST /posts/:id/canais/:canal/gerar`) e
// o worker que prepara a rede automaticamente na criação do post — os dois
// precisam montar o mesmo payload de render, só o gatilho é diferente.
export function montarPayloadRenderCanal(
  post: { id: string; slug: string; tipo: string; formato: string; caption: string; hashtags: string },
  brand: BrandKit,
  saida: { canal: string; caption: string | null; hashtags: string | null; slides: unknown },
): RenderJobPayload {
  return {
    postId: post.id,
    brand,
    post: {
      slug: post.slug,
      tipo: post.tipo as never,
      formato: post.formato as never,
      caption: saida.caption ?? post.caption,
      hashtags: saida.hashtags ?? post.hashtags,
      slides: slidesDoJson(saida.slides),
    },
    canal: saida.canal as never,
  }
}
