// Motor de layout/tema — migrado de render.mjs + brand.mjs do
// eknotech-content-studio original. O núcleo visual (layouts, temas,
// tipografia) não muda de comportamento; o que muda:
//
//  - marca deixa de vir de um brand.mjs estático e passa a ser parâmetro
//    (BrandKit do Perfil) em toda função deste módulo;
//  - acentos/gradientes que na versão original eram cor fixa (#a78bfa,
//    #6D28D9→#2563EB etc., specíficos da eknotech) agora derivam de
//    corPrimaria/corSecundaria via color-mix(), senão todo Perfil de todo
//    tenant sairia com acento roxo da eknotech independente da própria marca;
//  - BUG CORRIGIDO: o gradiente de texto dos temas light/paper era uma string
//    entre aspas duplas (`"linear-gradient(...${x}...)"`), não um template
//    literal — o CSS gerado era inválido e o texto saía invisível. Aqui é
//    template literal de verdade;
//  - fotos chegam como `slide.photoDataUri` (já resolvido pela API) em vez
//    de caminho de arquivo lido do disco.
import type { BrandKit, Formato, Layout, Slide, TipoConteudo } from '@gridgen/shared'
import { pacoteFonte } from './fonts.js'

export const CANVAS_WIDTH = 1080
export const CANVAS_SCALE = 2
const ALTURA_FEED_PADRAO = 1350

// Neutros fixos dos temas claros — a versão original também não derivava
// esses da marca (só o tema "ink" usa cor de texto vinda do brand).
const CLARO_TEXTO = '#1A1830'
const CLARO_MUDO = '#6C6890'
const PAPER_BG = '#F4F4F6'

// Paleta do card estilo tweet — literal, não deriva da marca (a ideia é
// parecer uma publicação de rede social real, não um slide com a cara da
// marca). Mesmo azul de "verificado" usado pela maioria das redes.
const TWEET_AZUL = '#1d9bf0'
const TWEET_CLARO_TEXTO = '#0f1419'
const TWEET_CLARO_MUDO = '#536471'
const TWEET_ESCURO_TEXTO = '#e7e9ea'
const TWEET_ESCURO_MUDO = '#71767b'

export interface Dimensoes {
  largura: number
  altura: number
  padTop: number
  padBottom: number
}

export function dimensoesPara(formato: Formato): Dimensoes {
  const altura = formato === 'story' ? 1920 : formato === 'square' ? 1080 : ALTURA_FEED_PADRAO
  // Área segura do story: o Instagram cobre topo/rodapé com a própria UI.
  const padTop = formato === 'story' ? 280 : 96
  const padBottom = formato === 'story' ? 320 : 96
  return { largura: CANVAS_WIDTH, altura, padTop, padBottom }
}

function css(brand: BrandKit, H: number, padTop: number, padBottom: number, tipo?: TipoConteudo): string {
  const fonte = pacoteFonte(brand.fonte)
  const grad = `linear-gradient(120deg,${brand.corPrimaria},${brand.corSecundaria})`
  const brandBg = `color-mix(in srgb, ${brand.corPrimaria} 55%, black)`

  // "Produtos e Serviços" existe pra mostrar o produto/serviço com clareza
  // (nota da própria receita: "produto é sempre o protagonista visual") — o
  // time relatou que o filtro/scrim padrão, pensado pra garantir
  // legibilidade de texto sobre QUALQUER foto, estava ofuscando demais a
  // foto nesse tipo especificamente (era o antigo tipo "prova", migrado pra
  // cá). Reduz (não remove) tint/scrim/filtro de imagem só aqui, mantendo um
  // pouco mais de escurecida perto do texto pra não perder legibilidade.
  const fotoSuave = tipo === 'produtos_servicos'
  const bleedImgFiltro = fotoSuave
    ? 'grayscale(.05) brightness(.94) contrast(1.02)'
    : 'grayscale(.14) brightness(.8) contrast(1.06)'
  const bleedTint = fotoSuave
    ? `color-mix(in srgb, ${brand.corPrimaria} 12%, transparent),color-mix(in srgb, ${brand.corSecundaria} 8%, transparent)`
    : `color-mix(in srgb, ${brand.corPrimaria} 30%, transparent),color-mix(in srgb, ${brand.corSecundaria} 20%, transparent)`
  const bleedScrim = fotoSuave
    ? 'rgba(6,5,20,.78) 6%,rgba(6,5,20,.12) 46%,rgba(6,5,20,.38) 100%'
    : 'rgba(6,5,20,.94) 6%,rgba(6,5,20,.34) 46%,rgba(6,5,20,.66) 100%'
  const bleedScrimV1 = fotoSuave
    ? 'rgba(6,5,20,.15) 0%, rgba(6,5,20,.5) 100%'
    : 'rgba(6,5,20,.3) 0%, rgba(6,5,20,.74) 100%'
  const bleedScrimV2 = fotoSuave
    ? 'rgba(6,5,20,.65) 0%,rgba(6,5,20,.24) 34%,rgba(6,5,20,0) 58%'
    : 'rgba(6,5,20,.92) 0%,rgba(6,5,20,.48) 34%,rgba(6,5,20,0) 58%'
  const bleedScrimV3 = fotoSuave
    ? 'rgba(6,5,20,.12) 0%, rgba(6,5,20,0) 36%'
    : 'rgba(6,5,20,.24) 0%, rgba(6,5,20,0) 36%'
  const frameImgFiltro = fotoSuave
    ? 'grayscale(.10) brightness(1) contrast(1)'
    : 'grayscale(.26) brightness(.94) contrast(1.03)'
  const frameTint = fotoSuave ? 'rgba(46,40,140,.10),rgba(29,78,216,.06)' : 'rgba(46,40,140,.26),rgba(29,78,216,.15)'
  const frameScrim = fotoSuave ? 'rgba(8,6,28,.55),rgba(8,6,28,0) 55%' : 'rgba(8,6,28,.85),rgba(8,6,28,0) 55%'

  // Escala tipográfica do motor — todo font-size do sistema vem daqui, nunca
  // mais um número solto por composição. Base 24px, progressão ~1.2 ("terça
  // menor", proporção comum em escalas tipográficas), arredondada por papel.
  // Achado real da auditoria: antes desse token existir, o arquivo tinha ~30
  // valores de font-size distintos, vários quase iguais por deriva (42/45/46,
  // 63/64, 148/150) — sem nenhuma relação matemática entre eles. Consolidado
  // aqui: cada papel usa sempre o MESMO tamanho em qualquer layout que o use.
  // As 4 variações extras de manchete (headlineSm/Lg/Xl/Hero) são flavors
  // deliberados das 5 composições de capa (`photo-full-v1..v4`) — uma
  // sub-progressão nomeada, não números soltos. Ficam FORA desta escala, de
  // propósito, dois sistemas com identidade visual própria já documentada: o
  // card estilo "tweet" (`.tw-*`, imita a tipografia real de uma rede social,
  // não a da marca) e as dimensões de componente (altura de moldura de foto,
  // diâmetro de badge/círculo, border-radius) — isso é grid/proporção de
  // layout, uma frente própria, não escala de texto.
  const T = {
    micro: 20, // notas auxiliares bem pequenas (rodapé do gráfico, nota da enquete)
    label: 24, // rótulos mono uppercase (rótulo do gráfico, contador de slide)
    caption: 28, // legendas/hints mono (hint, url, lockup, pill do CTA)
    small: 34, // texto de apoio (subtítulo/valor do gráfico)
    body: 45, // parágrafo padrão (texto de todo layout com corpo)
    subhead: 58, // subtítulo/título menor (list-title, título do gráfico, card de foto)
    title: 64, // título de destaque (item-title, split/item)
    headline: 78, // manchete padrão (h-display/h-sans, título sobre foto)
    headlineSm: 84, // manchete flavor — capa v2 (ancorada no topo)
    headlineLg: 90, // manchete flavor — capa v0/base sobre foto
    headlineXl: 100, // manchete flavor — capa v1 (centralizada)
    headlineHero: 112, // manchete flavor — capa v4 (estilo capa de jornal, caixa alta)
    display: 148, // a maior manchete do sistema (h-word, palavra única)
    circleNum: 26, // número dentro do círculo bem pequeno (list-v1)
  }

  // Escala de espaçamento — base 8px, dá ritmo consistente a gap/margin/
  // padding (princípio de Proximidade/Repetição) em vez de cada regra inventar
  // seu próprio número. Acertos ópticos finos (poucos px, tipo alinhar a base
  // de duas fontes distintas) ficam fora da escala de propósito — não são
  // espaçamento de composição, são ajuste de linha de base.
  const SP = { xxs: 8, xs: 16, sm: 24, md: 32, lg: 40, xl: 48, xxl: 64, xxxl: 96 }

  return `
${fonte.faces}
    html,body{margin:0;width:${CANVAS_WIDTH}px;height:${H}px;overflow:hidden}
    *{box-sizing:border-box}
    .slide{width:${CANVAS_WIDTH}px;height:${H}px;padding:${padTop}px ${SP.xxxl}px ${padBottom}px;display:flex;
      flex-direction:column;justify-content:space-between;position:relative;z-index:0;overflow:hidden;
      font-family:${fonte.fontSans};-webkit-font-smoothing:antialiased}
    .t-light{background:#FFFFFF;color:${CLARO_TEXTO};--muted:${CLARO_MUDO};--acc:${brand.corPrimaria}}
    .t-paper{background:${PAPER_BG};color:${CLARO_TEXTO};--muted:${CLARO_MUDO};--acc:${brand.corPrimaria}}
    .t-ink{background:radial-gradient(900px 640px at 88% -8%, color-mix(in srgb, ${brand.corPrimaria} 16%, transparent), transparent 60%),radial-gradient(760px 560px at -8% 106%, color-mix(in srgb, ${brand.corSecundaria} 13%, transparent), transparent 60%),${brand.corFundo};color:${brand.corTexto};--muted:color-mix(in srgb, ${brand.corTexto} 70%, ${brand.corFundo});--acc:color-mix(in srgb, ${brand.corPrimaria} 78%, white)}
    .t-brand{background:${brandBg};color:#FFFFFF;--muted:color-mix(in srgb, white 75%, ${brand.corPrimaria});--acc:color-mix(in srgb, white 80%, ${brand.corSecundaria})}
    .t-tweet-light{background:#fff;color:${TWEET_CLARO_TEXTO}}
    .t-tweet-dark{background:#000;color:${TWEET_ESCURO_TEXTO}}
    .tw-content{flex:1;display:flex;flex-direction:column;gap:44px}
    .tw-head{display:flex;align-items:center;gap:28px}
    .tw-avatar{width:120px;height:120px;border-radius:50%;object-fit:cover;flex:none;background:#e5e7eb}
    .tw-id{display:flex;flex-direction:column;gap:4px}
    .tw-name-row{display:flex;align-items:center;gap:10px}
    .tw-name{font-family:${fonte.fontDisplay};font-weight:800;font-size:44px;line-height:1.15}
    .tw-badge{width:34px;height:34px;flex:none}
    .tw-handle{font-family:${fonte.fontSans};font-size:32px}
    .t-tweet-light .tw-handle{color:${TWEET_CLARO_MUDO}}
    .t-tweet-dark .tw-handle{color:${TWEET_ESCURO_MUDO}}
    .tw-photo{width:100%;border-radius:28px;overflow:hidden}
    .tw-photo img{width:100%;max-height:620px;display:block;object-fit:cover}
    .tw-body{font-family:${fonte.fontSans};font-size:50px;line-height:1.3;font-weight:700;letter-spacing:-.01em;white-space:pre-wrap}
    /* Foto + texto longo juntos podem passar da altura do card (confirmado
       na prática — texto cortado no final) — encolhe os dois quando os dois
       coexistem, mesmo princípio já usado em ".split.wide" (estilo reage ao
       tamanho do conteúdo em vez de arriscar estourar). */
    .tw-content.tw-compact .tw-photo img{max-height:380px}
    .tw-content.tw-compact .tw-body{font-size:42px;line-height:1.28}
    .wm{position:absolute;right:-150px;top:-160px;width:760px;pointer-events:none;height:auto;z-index:0}
    .t-light .wm,.t-paper .wm{opacity:.07}
    .t-ink .wm{opacity:.09}
    .t-brand .wm{opacity:.11}
    .head,.mid,.foot{position:relative;z-index:3}
    .mid.photo-over{justify-content:center}
    .photo-frame{position:relative;width:100%;border-radius:34px;overflow:hidden;background:linear-gradient(140deg,${brand.corPrimaria},${brand.corSecundaria});box-shadow:0 24px 64px rgba(12,10,45,.22)}
    .photo-over .photo-frame{height:600px}
    .photo-frame .photo-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:${frameImgFiltro}}
    .photo-frame .photo-tint{position:absolute;inset:0;background:linear-gradient(150deg,${frameTint})}
    .photo-frame .photo-scrim{position:absolute;inset:0;background:linear-gradient(to top,${frameScrim})}
    .photo-cap{position:absolute;left:0;right:0;bottom:0;padding:${SP.xl}px}
    .photo-cap .h-sans{font-size:${T.subhead}px;line-height:1.16;color:#fff;margin:0}
    .photo-cap .h-sans em{color:#C7D2FE}
    .photo-hint{font-family:${fonte.fontMono};font-size:${T.caption}px;color:rgba(255,255,255,.82);margin-top:${SP.xs}px}
    .photo-bleed{position:absolute;inset:0;z-index:0;overflow:hidden}
    .photo-bleed img{width:100%;height:100%;object-fit:cover;filter:${bleedImgFiltro}}
    .photo-bleed .bleed-tint{position:absolute;inset:0;background:linear-gradient(150deg,${bleedTint})}
    .photo-bleed .bleed-scrim{position:absolute;inset:0;background:linear-gradient(to top,${bleedScrim})}
    .photo-bleed-fallback{position:absolute;inset:0;z-index:-1;background:linear-gradient(to top,rgba(6,5,20,.72) 6%,rgba(6,5,20,.15) 46%,rgba(6,5,20,.4) 100%),linear-gradient(140deg,${brand.corPrimaria},${brand.corSecundaria})}
    .mid.photo-full{justify-content:flex-end;padding-bottom:${SP.sm}px}
    .mid.photo-full .h-sans{font-family:${fonte.fontDisplay};font-size:${T.headlineLg}px;line-height:1.14;color:#fff}
    .mid.photo-full .h-sans em{color:#c4b5fd}
    .mid.photo-full .hint{color:rgba(255,255,255,.86);margin-top:${SP.sm}px}
    /* Layouts tipográficos com foto de fundo (cover/word/bottom/split/item/
       list/cta/enquete) reaproveitam este mesmo tratamento — sempre texto
       branco, independente do tema, já que a foto (não o tema) define o
       fundo agora. */
    .mid.photo-full .h-word,.mid.photo-full .h-display{color:#fff}
    .mid.photo-full .h-word em,.mid.photo-full .h-display em{color:#c4b5fd}
    /* split e item sobre foto: o usuário rejeitou tanto o número gigante
       original quanto as duas tentativas seguintes de conter/diferenciar
       ele (badge menor, depois badge vs. número empilhado) — pediu pra
       remover o marcador por completo e dar mais peso ao texto em si.
       Composição unificada (sem badge, sem número), título grande no
       mesmo peso visual de um headline de capa sobre foto. */
    .mid.photo-full .split-item-title{font-family:${fonte.fontDisplay};font-weight:700;font-size:${T.headline}px;line-height:1.1;letter-spacing:-.02em;color:#fff;margin:0}
    .mid.photo-full .split-item-text{font-family:${fonte.fontSans};font-weight:400;font-size:${T.body}px;line-height:1.34;color:rgba(255,255,255,.86);margin:${SP.sm}px 0 0;max-width:26ch}
    /* 5 composições alternativas da capa (photo, full:true) — sorteada uma
       por post em montarSlidesPadrao (Slide.variante). Variante 0 é a
       original (acima, intocada). As 4 abaixo reaproveitam .photo-bleed/
       .photo-bleed-fallback como fundo, só mudando o scrim (pra photo real)
       e onde o texto fica. */
    .photo-bleed .bleed-scrim-v1{position:absolute;inset:0;background:radial-gradient(120% 85% at 50% 48%, ${bleedScrimV1})}
    .mid.photo-full-v1{justify-content:center;align-items:center;text-align:center}
    .mid.photo-full-v1 .h-sans{font-family:${fonte.fontDisplay};font-size:${T.headlineXl}px;line-height:1.1;color:#fff}
    .mid.photo-full-v1 .h-sans em{color:#c4b5fd}
    .mid.photo-full-v1 .hint{color:rgba(255,255,255,.86);margin-top:${SP.sm}px}
    .photo-bleed .bleed-scrim-v2{position:absolute;inset:0;background:linear-gradient(to bottom,${bleedScrimV2})}
    .mid.photo-full-v2{justify-content:flex-start;padding-top:${SP.xxs}px}
    .mid.photo-full-v2 .h-sans{font-family:${fonte.fontDisplay};font-size:${T.headlineSm}px;line-height:1.16;color:#fff}
    .mid.photo-full-v2 .h-sans em{color:#c4b5fd}
    .mid.photo-full-v2 .hint{color:rgba(255,255,255,.86);margin-top:${SP.sm}px}
    .photo-bleed .bleed-scrim-v3{position:absolute;inset:0;background:linear-gradient(to top,${bleedScrimV3})}
    .mid.photo-full-v3{justify-content:flex-end}
    /* v4: manchete estilo capa de jornal esportivo (referência real trazida
       pelo usuário) — reaproveita o scrim mais forte já existente
       (bleed-scrim, o mesmo da v0), só a tipografia muda: bem maior, mais
       compacta e em caixa alta, pra "gritar" a notícia. */
    .mid.photo-full-v4{justify-content:flex-end;padding-bottom:${SP.sm}px}
    .mid.photo-full-v4 .h-sans{font-family:${fonte.fontDisplay};font-weight:800;font-size:${T.headlineHero}px;line-height:1.03;letter-spacing:-.02em;color:#fff;text-transform:uppercase}
    .mid.photo-full-v4 .h-sans em{color:#c4b5fd}
    .mid.photo-full-v4 .hint{color:rgba(255,255,255,.86);margin-top:${SP.sm}px}
    .painel-capa{background:linear-gradient(120deg,color-mix(in srgb, ${brand.corPrimaria} 92%, black),color-mix(in srgb, ${brand.corSecundaria} 88%, black));border-radius:32px;padding:${SP.lg}px ${SP.xl}px;box-shadow:0 24px 64px rgba(12,10,45,.35)}
    .painel-capa .h-sans{font-family:${fonte.fontDisplay};font-size:${T.headline}px;line-height:1.16;color:#fff;margin:0}
    .painel-capa .h-sans em{color:#c4b5fd}
    .painel-capa .hint{color:rgba(255,255,255,.86);margin-top:${SP.sm}px}
    /* Variantes dos layouts INTERNOS (não-capa) — mesmo princípio: sorteada
       uma por layout por post, variante 0 sempre a composição original. */
    .mid.photo-over-v1{flex-direction:column;justify-content:center;gap:${SP.md}px}
    .mid.photo-over-v2{flex-direction:column-reverse}
    .photo-frame-v1{height:520px}
    .photo-caption-v1 .h-sans{font-size:${T.subhead}px;line-height:1.18;margin:0}
    .photo-caption-v1 .hint{margin-top:${SP.xs}px}
    .mid.photo-over-v3{flex-direction:column;justify-content:center;gap:0}
    .photo-frame-v3{border-radius:16px 16px 0 0;height:500px}
    .photo-tag-v3{background:linear-gradient(120deg,${brand.corPrimaria},${brand.corSecundaria});border-radius:0 0 24px 24px;padding:${SP.md}px ${SP.lg}px}
    .photo-tag-v3 .h-sans{font-size:${T.subhead}px;line-height:1.2;color:#fff;margin:0}
    .photo-tag-v3 .hint{color:rgba(255,255,255,.86);margin-top:${SP.xs}px}
    .mid.word-v1{text-align:center;align-items:center}
    .mid.word-v2 .h-word em{background:var(--acc);color:#fff;padding:0 .1em;border-radius:.1em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
    /* Ancorado à direita, mas centralizado verticalmente — não embaixo
       (achado real: a legenda pequena grudava perto do paginador, no
       rodapé, ficando visualmente amontoada). */
    .mid.word-v3{justify-content:center;align-items:flex-end;text-align:right}
    .list-num-v1{width:44px;height:44px;border-radius:50%;background:color-mix(in srgb, var(--acc) 20%, transparent);color:var(--acc);font-family:${fonte.fontDisplay};font-weight:800;font-size:${T.circleNum}px;display:flex;align-items:center;justify-content:center;flex:none;margin-top:2px}
    .list-item-v2{background:color-mix(in srgb, var(--acc) 6%, transparent);border-radius:20px;padding:${SP.sm}px}
    .list-check-v3{width:34px;height:34px;border-radius:10px;background:var(--acc);flex:none;margin-top:2px}
    .mid.bottom-v1{justify-content:center;padding-bottom:0}
    .mid.bottom-v2{justify-content:flex-start;padding-top:${SP.xxs}px;padding-bottom:0}
    .accent-bar-v3{width:120px;height:10px;border-radius:6px;background:linear-gradient(120deg,${brand.corPrimaria},${brand.corSecundaria});margin-bottom:${SP.sm}px}
    .mid.cta-v1{justify-content:center;padding-bottom:0}
    .mid.cta-v3{justify-content:flex-start;padding-top:${SP.xxs}px;padding-bottom:0}
    .url-pill-v2{display:inline-block;font-family:${fonte.fontMono};font-size:${T.caption}px;color:#fff;background:linear-gradient(120deg,${brand.corPrimaria},${brand.corSecundaria});padding:${SP.xs}px ${SP.md}px;border-radius:999px;margin-top:${SP.md}px;letter-spacing:.02em}
    .head{display:flex;flex-direction:column;align-items:flex-start;gap:${SP.sm}px}
    .logo-top{height:88px;width:auto;align-self:flex-start;display:block}
    .logo-sm{height:44px;width:auto;display:block}
    .mid{flex:1;display:flex;flex-direction:column;justify-content:center}
    .mid.lower{justify-content:flex-end}
    .mid.botspace{padding-bottom:${H > 1400 ? 170 : 76}px}
    .mid.logocover{align-items:center;justify-content:center;text-align:center}
    .cover-logo{width:760px;max-width:88%;height:auto}
    .cover-tag{font-family:${fonte.fontMono};text-transform:uppercase;letter-spacing:.24em;font-size:${T.caption}px;color:var(--muted);margin-top:${SP.lg}px}
    .h-display{font-family:${fonte.fontDisplay};font-weight:700;font-size:${T.headline}px;line-height:1.16;letter-spacing:-.02em;margin:0;text-wrap:balance}
    .h-sans{font-family:${fonte.fontDisplay};font-weight:800;font-size:${T.headline}px;line-height:1.16;letter-spacing:-.025em;margin:0;text-wrap:balance}
    .h-word{font-family:${fonte.fontDisplay};font-weight:800;font-size:${T.display}px;line-height:1.1;letter-spacing:-.035em;margin:0;text-wrap:balance}
    .h-display em,.h-sans em,.h-word em{color:var(--acc);font-style:normal}
    /* split e item (flat, sem foto): mesma simplificação já aplicada à versão
       sobre foto — o usuário rejeitou toda tentativa de marcador numérico
       (número gigante ao lado, empilhado, badge circular, marca d'água) e
       pediu remoção completa, com mais peso pro texto. As duas layouts
       convergem pra uma única composição (título + texto), sem o campo "num"
       em tela — ver a função tituloTextoHTML. */
    .item-title{font-family:${fonte.fontDisplay};font-weight:700;font-size:${T.title}px;letter-spacing:-.02em;margin:0}
    .item-text{font-family:${fonte.fontSans};font-weight:400;font-size:${T.body}px;line-height:1.32;color:var(--muted);margin:${SP.sm}px 0 0;max-width:30ch}
    .list-mid{gap:${SP.xl}px}
    .list-title{font-family:${fonte.fontDisplay};font-weight:700;font-size:${T.subhead}px;letter-spacing:-.02em;line-height:1.16;margin:0;text-wrap:balance}
    .list{display:flex;flex-direction:column;gap:${SP.md}px}
    .list-item{display:flex;align-items:flex-start;gap:${SP.sm}px}
    .list-dot{width:26px;height:26px;border-radius:8px;margin-top:12px;flex:none;background:linear-gradient(135deg,${brand.corPrimaria},${brand.corSecundaria})}
    .list-txt{font-family:${fonte.fontSans};font-size:${T.body}px;line-height:1.3;font-weight:500}
    .hint{font-family:${fonte.fontMono};font-size:${T.caption}px;color:var(--muted);margin-top:${SP.md}px}
    /* Interativo (enquete) — tratamento mínimo e funcional, não a passada de
       design final (isso vem na rodada de "layouts aprovados"): mostra a
       pergunta, as opções como texto simples e uma nota de que o espaço é
       reservado pra empresa inserir o sticker nativo do Instagram. */
    .enquete-opcoes{display:flex;flex-direction:column;gap:${SP.sm}px;margin-top:${SP.lg}px}
    .enquete-opcao{font-family:${fonte.fontSans};font-weight:600;font-size:${T.body}px;padding:${SP.sm}px ${SP.md}px;border-radius:20px;border:2px solid color-mix(in srgb, var(--acc) 40%, transparent);background:color-mix(in srgb, var(--acc) 10%, transparent)}
    .enquete-nota{font-family:${fonte.fontMono};font-size:${T.micro}px;color:var(--muted);margin-top:${SP.md}px;text-transform:uppercase;letter-spacing:.08em}
    /* Gráfico de barras (estilo "grafico") — peça estática única, não faz
       parte do sistema de variantes dos outros layouts (1 composição só, por
       enquanto). Altura de cada barra vem calculada em TS (proporcional ao
       maior valor do conjunto), não em CSS. */
    .mid.grafico-mid{justify-content:flex-start}
    .grafico-titulo{font-size:${T.subhead}px;line-height:1.22}
    .grafico-subtitulo{font-family:${fonte.fontSans};font-weight:400;font-size:${T.small}px;line-height:1.4;color:var(--muted);margin:${SP.xs}px 0 0;max-width:36ch}
    .grafico-barras{flex:1;display:flex;align-items:flex-end;gap:${SP.sm}px;padding-top:${SP.md}px}
    .grafico-coluna{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center}
    .grafico-valor{font-family:${fonte.fontDisplay};font-weight:800;font-size:${T.small}px;line-height:1.1;margin-bottom:${SP.xs}px;text-align:center}
    .grafico-barra{width:100%;max-width:110px;border-radius:12px 12px 0 0;background:var(--acc)}
    .grafico-barra-destaque{background:linear-gradient(180deg,#22c55e,#16a34a)}
    .grafico-rotulo{font-family:${fonte.fontSans};font-weight:700;font-size:${T.label}px;line-height:1.25;margin-top:${SP.xs}px;text-align:center}
    .grafico-subrotulo{font-family:${fonte.fontMono};font-size:${T.micro}px;color:var(--muted);margin-top:4px}
    .url{font-family:${fonte.fontMono};font-size:${T.caption}px;color:var(--acc);margin-top:${SP.md}px;letter-spacing:.02em}
    .t-light .h-display em,.t-light .h-sans em,.t-light .h-word em,.t-light .url,.t-light .list-title em,
    .t-paper .h-display em,.t-paper .h-sans em,.t-paper .url,.t-paper .list-title em{
      background:${grad};-webkit-background-clip:text;background-clip:text;color:transparent}
    .t-ink .h-display em,.t-ink .h-sans em,.t-ink .h-word em,.t-ink .url,.t-ink .list-title em{color:var(--acc)}
    .list-title em{font-style:normal}
    .foot{display:flex;align-items:center;justify-content:space-between;min-height:44px}
    .lockup{display:flex;align-items:center;gap:${SP.xs}px;font-size:${T.caption}px}
    .lockup .m{color:var(--muted);position:relative;top:3px}
    .count{font-family:${fonte.fontMono};font-size:${T.label}px;color:var(--muted);letter-spacing:.1em}
  `
}

interface Assets {
  logo: string
  icon: string
}

function assetsFor(theme: string, brand: BrandKit): Assets {
  const claro = theme === 'light' || theme === 'paper'
  return {
    logo: (claro ? brand.logoColorUrl : brand.logoBrancoUrl) || '',
    icon: (claro ? brand.iconeColorUrl : brand.iconeBrancoUrl) || '',
  }
}

const lockup = (A: Assets, brand: BrandKit) =>
  `<div class="lockup"><img class="logo-sm" src="${A.logo}" alt="logo"><span class="m">${brand.lockupTag ?? ''}</span></div>`

const counter = (i: number, t: number) =>
  t <= 1 ? '' : `<span class="count">${String(i + 1).padStart(2, '0')} / ${String(t).padStart(2, '0')}</span>`

// O rótulo (kicker) foi removido a pedido do usuário — a etiqueta em caixa
// alta na cor de destaque da marca ("O QUE MUDOU", "11H37 DE UMA TERÇA") não
// agradou visualmente. `.head` agora só carrega a logo grande da capa, quando
// existe.
function headBlock(s: Slide, A: Assets): string {
  const bigLogo = s.logoTop ? `<img class="logo-top" src="${A.logo}" alt="logo">` : ''
  return `<div class="head">${bigLogo}</div>`
}

function footBlock(s: Slide, i: number, t: number, A: Assets, brand: BrandKit): string {
  const noLockup = s.logoTop || s.layout === 'logocover'
  return `<div class="foot">${noLockup ? '<span></span>' : lockup(A, brand)}${counter(i, t)}</div>`
}

// 4 composições da capa (photo, full:true) — variante 0 é a original. O
// índice vem sorteado uma vez por post (`montarSlidesPadrao`), então todo
// slide de capa do mesmo post usa a mesma composição, mas o próximo post do
// mesmo tipo tende a sortear outra.
function capaFotoHTML(s: Slide, hint: string): string {
  const variante = ((s.variante ?? 0) % 5 + 5) % 5
  const uri = s.photoDataUri ?? ''
  // v4 reaproveita o mesmo scrim forte da v0 (mais confiável pra legibilidade
  // de um texto grande e pesado) — não tem `bleed-scrim-v4` próprio.
  const scrimClasse = variante === 0 || variante === 4 ? 'bleed-scrim' : `bleed-scrim-v${variante}`
  const bg = uri
    ? `<div class="photo-bleed"><img src="${uri}" alt=""><div class="bleed-tint"></div><div class="${scrimClasse}"></div></div>`
    : `<div class="photo-bleed-fallback"></div>`
  const conteudo = `<h1 class="h-sans">${s.headline}</h1>${hint}`

  if (variante === 3) {
    return `${bg}<div class="mid photo-full-v3"><div class="painel-capa">${conteudo}</div></div>`
  }
  const classeMid = variante === 0 ? 'photo-full' : `photo-full-v${variante}`
  return `${bg}<div class="mid ${classeMid}">${conteudo}</div>`
}

function variante4(s: Slide): number {
  return ((s.variante ?? 0) % 4 + 4) % 4
}

// Card interno de foto (photo, sem full — o "photo-over" de sempre). 4
// composições: v0 legenda dentro do frame (original); v1 legenda separada
// abaixo; v2 mesma ideia, ordem invertida (legenda acima, foto abaixo); v3
// moldura quadrada emendada numa faixa colorida com a legenda.
function photoInternaHTML(s: Slide, uri: string, img: string, hint: string): string {
  const variante = variante4(s)
  if (variante === 1 || variante === 2) {
    const classeMid = variante === 1 ? 'photo-over-v1' : 'photo-over-v1 photo-over-v2'
    return `<div class="mid ${classeMid}"><div class="photo-frame photo-frame-v1">${img}</div><div class="photo-caption-v1"><h1 class="h-sans">${s.headline}</h1>${hint}</div></div>`
  }
  if (variante === 3) {
    return `<div class="mid photo-over-v3"><div class="photo-frame photo-frame-v3">${img}</div><div class="photo-tag-v3"><h1 class="h-sans">${s.headline}</h1>${hint}</div></div>`
  }
  const h = s.hint ? `<div class="photo-hint">${s.hint}</div>` : ''
  return `<div class="mid photo-over"><div class="photo-frame">${img}<div class="photo-tint"></div><div class="photo-scrim"></div><div class="photo-cap"><h1 class="h-sans">${s.headline}</h1>${h}</div></div></div>`
}

// split/item (flat, sem foto): composição única (título + texto), sem `num`
// em tela — mesma simplificação já aplicada à versão sobre foto (o usuário
// rejeitou toda tentativa de marcador numérico, incluindo as variantes só
// desta versão flat que ainda mostravam resíduo do item removido — número ao
// lado, empilhado, badge circular, marca d'água). As duas layouts convergem
// pra esta mesma função; continuam sendo `Layout`s distintos no schema (papel
// narrativo próprio em cada receita), só o tratamento visual é idêntico agora.
function tituloTextoHTML(s: Slide): string {
  return `<div class="mid"><div class="item-title">${s.title}</div><div class="item-text">${s.text}</div></div>`
}

// list: v0 bolinha (original); v1 número em círculo; v2 cada item num card
// com fundo sutil; v3 checkmark em vez de bolinha.
function listHTML(s: Slide): string {
  const variante = variante4(s)
  const hd = s.headline ? `<h2 class="list-title">${s.headline}</h2>` : ''
  const itens = s.items ?? []
  let linhas: string
  if (variante === 1) {
    linhas = itens.map((it, i) => `<div class="list-item"><span class="list-num-v1">${i + 1}</span><span class="list-txt">${it}</span></div>`).join('')
  } else if (variante === 2) {
    linhas = itens.map((it) => `<div class="list-item list-item-v2"><span class="list-dot"></span><span class="list-txt">${it}</span></div>`).join('')
  } else if (variante === 3) {
    const check =
      '<svg class="list-check-v3" viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    linhas = itens.map((it) => `<div class="list-item">${check}<span class="list-txt">${it}</span></div>`).join('')
  } else {
    linhas = itens.map((it) => `<div class="list-item"><span class="list-dot"></span><span class="list-txt">${it}</span></div>`).join('')
  }
  return `<div class="mid list-mid">${hd}<div class="list">${linhas}</div></div>`
}

// Gráfico de barras (estilo "grafico") — 1 composição só, sem sistema de
// variantes (diferente dos demais layouts). Altura de cada barra é
// proporcional ao maior `valor` do conjunto — calculada aqui porque CSS
// puro não sabe fazer essa conta a partir de um número arbitrário.
const ALTURA_MAX_BARRA = 480

function graficoHTML(s: Slide): string {
  const barras = s.barras ?? []
  const maiorValor = Math.max(1, ...barras.map((b) => b.valor))
  const colunas = barras
    .map((b) => {
      const altura = Math.max(20, Math.round((b.valor / maiorValor) * ALTURA_MAX_BARRA))
      const classe = b.destaque ? 'grafico-barra grafico-barra-destaque' : 'grafico-barra'
      const sub = b.subrotulo ? `<span class="grafico-subrotulo">${b.subrotulo}</span>` : ''
      return `<div class="grafico-coluna"><span class="grafico-valor">${b.valorExibido}</span><div class="${classe}" style="height:${altura}px"></div><span class="grafico-rotulo">${b.rotulo}</span>${sub}</div>`
    })
    .join('')
  const subtitulo = s.text ? `<p class="grafico-subtitulo">${s.text}</p>` : ''
  const fonte = s.hint ? `<p class="hint">${s.hint}</p>` : ''
  return `<div class="mid grafico-mid"><div><h1 class="h-display grafico-titulo">${s.headline ?? ''}</h1>${subtitulo}</div><div class="grafico-barras">${colunas}</div>${fonte}</div>`
}

// Reaproveita o mesmo fundo de foto full-bleed da capa (photo, full:true)
// pra qualquer layout tipográfico que tenha ganho uma foto de fundo (achado
// real do usuário: fundo de foto + texto flutuante lê muito mais sofisticado
// que cartão em fundo liso — que devia virar exceção, não regra). Sem foto,
// cai no mesmo gradiente de marca já usado como fallback da capa.
function fundoDeFoto(s: Slide): string {
  const uri = s.photoDataUri ?? ''
  return uri
    ? `<div class="photo-bleed"><img src="${uri}" alt=""><div class="bleed-tint"></div><div class="bleed-scrim"></div></div>`
    : `<div class="photo-bleed-fallback"></div>`
}

// Composição tipográfica sobre foto de fundo — reaproveita exatamente o
// mesmo tratamento visual já validado na capa (`.mid.photo-full`: texto
// ancorado embaixo, branco, hint a 86% de opacidade) pros demais layouts.
// Ignora de propósito o sistema de variantes de cada layout (variante só
// existe pro fallback sem foto, o "cartão liso" que agora é a exceção) —
// sempre usa o arranjo original (v0) do layout, só trocando o fundo liso
// por foto + texto flutuante.
function conteudoTipograficoSobreFoto(s: Slide, L: Layout, hint: string, url: string): string {
  const fundo = fundoDeFoto(s)
  if (L === 'cover' || L === 'cta') {
    return `${fundo}<div class="mid photo-full"><h1 class="h-sans">${s.headline}</h1>${L === 'cta' ? url : hint}</div>`
  }
  if (L === 'word') {
    return `${fundo}<div class="mid photo-full"><h1 class="h-word">${s.headline}</h1>${hint}</div>`
  }
  if (L === 'bottom') {
    return `${fundo}<div class="mid photo-full"><h1 class="h-display">${s.headline}</h1></div>`
  }
  if (L === 'split' || L === 'item') {
    // O marcador numérico (v0 gigante, depois badge pequeno, depois número
    // empilhado) passou por 2 tentativas de correção nesta mesma sessão e o
    // usuário rejeitou as duas — pediu remoção completa, com mais ênfase no
    // texto. Composição única (sem `num` em tela), título no mesmo peso
    // visual de um headline de capa sobre foto.
    return `${fundo}<div class="mid photo-full"><div class="split-item-title">${s.title}</div><div class="split-item-text">${s.text}</div></div>`
  }
  if (L === 'list') {
    const hd = s.headline ? `<h2 class="list-title">${s.headline}</h2>` : ''
    const itens = (s.items ?? []).map((it) => `<div class="list-item"><span class="list-dot"></span><span class="list-txt">${it}</span></div>`).join('')
    return `${fundo}<div class="mid photo-full list-mid">${hd}<div class="list">${itens}</div></div>`
  }
  if (L === 'enquete') {
    const opcoes = (s.items ?? []).map((it) => `<div class="enquete-opcao">${it}</div>`).join('')
    return `${fundo}<div class="mid photo-full"><h1 class="h-display">${s.headline ?? ''}</h1><div class="enquete-opcoes">${opcoes}</div><div class="enquete-nota">Espaço reservado para a enquete nativa do Instagram</div>${hint}</div>`
  }
  return `${fundo}<div class="mid photo-full"><h1 class="h-display">${s.headline ?? ''}</h1></div>`
}

function midBlock(s: Slide, A: Assets): string {
  const L = s.layout || 'statement'
  const hint = s.hint ? `<div class="hint">${s.hint}</div>` : ''
  const url = s.url ? `<div class="url">${s.url}</div>` : ''
  const variante = variante4(s)

  // Layouts tipográficos ganham foto de fundo igual a capa já tinha — exclui
  // `photo` (já cuida da própria foto abaixo, com seu próprio sistema de
  // variantes), `logocover`/`tweet`/`grafico` (composições fixas, sem noção
  // de "foto de fundo" fazer sentido).
  const podeReceberFoto = L !== 'photo' && L !== 'logocover' && L !== 'tweet' && L !== 'grafico'
  if (podeReceberFoto && s.photoDataUri) {
    return conteudoTipograficoSobreFoto(s, L, hint, url)
  }

  if (L === 'logocover') {
    return `<div class="mid logocover"><img class="cover-logo" src="${A.logo}" alt="logo"><div class="cover-tag">${s.tagline ?? ''}</div></div>`
  }
  if (L === 'cover') {
    return `<div class="mid lower botspace"><h1 class="h-sans">${s.headline}</h1>${hint}</div>`
  }
  if (L === 'photo') {
    const uri = s.photoDataUri ?? ''
    const img = uri ? `<img class="photo-img" src="${uri}" alt="">` : ''
    if (s.full) {
      return capaFotoHTML(s, hint)
    }
    return photoInternaHTML(s, uri, img, hint)
  }
  if (L === 'cta') {
    if (variante === 1) return `<div class="mid cta-v1"><h1 class="h-sans">${s.headline}</h1>${url}</div>`
    if (variante === 2) {
      const urlPill = s.url ? `<div class="url-pill-v2">${s.url}</div>` : ''
      return `<div class="mid lower botspace"><h1 class="h-sans">${s.headline}</h1>${urlPill}</div>`
    }
    if (variante === 3) return `<div class="mid cta-v3"><h1 class="h-sans">${s.headline}</h1>${url}</div>`
    return `<div class="mid lower botspace"><h1 class="h-sans">${s.headline}</h1>${url}</div>`
  }
  if (L === 'word') {
    if (variante === 1) return `<div class="mid word-v1"><h1 class="h-word">${s.headline}</h1>${hint}</div>`
    if (variante === 2) return `<div class="mid word-v2"><h1 class="h-word">${s.headline}</h1>${hint}</div>`
    if (variante === 3) return `<div class="mid word-v3"><h1 class="h-word">${s.headline}</h1>${hint}</div>`
    return `<div class="mid"><h1 class="h-word">${s.headline}</h1>${hint}</div>`
  }
  if (L === 'bottom') {
    if (variante === 1) return `<div class="mid bottom-v1"><h1 class="h-display">${s.headline}</h1></div>`
    if (variante === 2) return `<div class="mid bottom-v2"><h1 class="h-display">${s.headline}</h1></div>`
    if (variante === 3) return `<div class="mid lower botspace"><div class="accent-bar-v3"></div><h1 class="h-display">${s.headline}</h1></div>`
    return `<div class="mid lower botspace"><h1 class="h-display">${s.headline}</h1></div>`
  }
  if (L === 'item' || L === 'split') return tituloTextoHTML(s)
  if (L === 'list') return listHTML(s)
  if (L === 'grafico') return graficoHTML(s)
  if (L === 'enquete') {
    const opcoes = (s.items ?? []).map((it) => `<div class="enquete-opcao">${it}</div>`).join('')
    return `<div class="mid lower botspace"><h1 class="h-display">${s.headline ?? ''}</h1><div class="enquete-opcoes">${opcoes}</div><div class="enquete-nota">Espaço reservado para a enquete nativa do Instagram</div>${hint}</div>`
  }
  return `<div class="mid"><h1 class="h-display">${s.headline}</h1></div>`
}

function wmMarkup(s: Slide, A: Assets): string {
  const L = s.layout || 'statement'
  if (L === 'logocover') return ''
  // Foto real já cumpre o papel decorativo do ícone de marca — só mostra o
  // ícone quando a foto está faltando (fallback), pra não deixar o slide sem
  // nenhuma decoração de marca. Vale pra qualquer layout agora que ganhou
  // foto de fundo, não só `photo`.
  if (s.photoDataUri) return ''
  return A.icon ? `<img class="wm" src="${A.icon}" alt="">` : ''
}

// Card estilo publicação de rede social: avatar + nome + selo + @ + texto,
// sem foto. Composição própria, não reaproveita head/mid/foot do carrossel
// padrão (aquele bloco pressupõe logo/kicker/lockup, que não existem aqui).
function tweetPageHTML(slide: Slide, index: number, total: number, altura: number, padTop: number, padBottom: number, brand: BrandKit): string {
  const claro = slide.theme === 'light'
  const A = assetsFor(claro ? 'light' : 'ink', brand)
  const avatar = A.icon ? `<img class="tw-avatar" src="${A.icon}" alt="">` : `<div class="tw-avatar"></div>`
  const badge = `<svg class="tw-badge" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="${TWEET_AZUL}"/><path d="M7 12.5l3 3 7-7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  // Imagem de referência é opcional — quando o usuário anexa uma (upload,
  // Pexels ou Galeria, mesmo picker de sempre), entra entre o cabeçalho e o
  // texto. O carrossel já mostra a posição via UI nativa do Instagram — não
  // precisa de contador embutido na imagem (diferente do carrossel padrão,
  // que não tem essa UI nativa por fora).
  const foto = slide.photoDataUri ? `<div class="tw-photo"><img src="${slide.photoDataUri}" alt=""></div>` : ''
  // Foto + texto longo juntos já estouraram a altura do card na prática
  // (texto cortado no final) — encolhe os dois quando coexistem, em vez de
  // arriscar. Sem foto, o texto sozinho sempre cabe (nunca passou disso em
  // teste, mesmo no teto do `maxLength`).
  const compacto = slide.photoDataUri && (slide.text ?? '').length > 150
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css(brand, altura, padTop, padBottom)}</style></head><body><div class="slide t-tweet-${claro ? 'light' : 'dark'}"><div class="tw-content${compacto ? ' tw-compact' : ''}"><div class="tw-head">${avatar}<div class="tw-id"><div class="tw-name-row"><span class="tw-name">${brand.nome ?? ''}</span>${badge}</div><span class="tw-handle">${brand.instagramHandle ?? ''}</span></div></div>${foto}<div class="tw-body">${slide.text ?? ''}</div></div></div></body></html>`
}

export function pageHTML(
  slide: Slide,
  index: number,
  total: number,
  altura: number,
  padTop: number,
  padBottom: number,
  brand: BrandKit,
  tipo?: TipoConteudo,
): string {
  if (slide.layout === 'tweet') return tweetPageHTML(slide, index, total, altura, padTop, padBottom, brand)
  const theme = slide.theme ?? brand.temaPadrao
  const A = assetsFor(theme, brand)
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css(brand, altura, padTop, padBottom, tipo)}</style></head><body><div class="slide t-${theme}">${wmMarkup(slide, A)}${headBlock(slide, A)}${midBlock(slide, A)}${footBlock(slide, index, total, A, brand)}</div></body></html>`
}
