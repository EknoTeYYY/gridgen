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
import type { BrandKit, Formato, Slide } from '@studio/shared'
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

function css(brand: BrandKit, H: number, padTop: number, padBottom: number): string {
  const fonte = pacoteFonte(brand.fonte)
  const grad = `linear-gradient(120deg,${brand.corPrimaria},${brand.corSecundaria})`
  const brandBg = `color-mix(in srgb, ${brand.corPrimaria} 55%, black)`

  return `
${fonte.faces}
    html,body{margin:0;width:${CANVAS_WIDTH}px;height:${H}px;overflow:hidden}
    *{box-sizing:border-box}
    .slide{width:${CANVAS_WIDTH}px;height:${H}px;padding:${padTop}px 96px ${padBottom}px;display:flex;
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
    .photo-frame .photo-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(.26) brightness(.94) contrast(1.03)}
    .photo-frame .photo-tint{position:absolute;inset:0;background:linear-gradient(150deg,rgba(46,40,140,.26),rgba(29,78,216,.15))}
    .photo-frame .photo-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,6,28,.85),rgba(8,6,28,0) 55%)}
    .photo-cap{position:absolute;left:0;right:0;bottom:0;padding:46px}
    .photo-cap .h-sans{font-size:60px;line-height:1.16;color:#fff;margin:0}
    .photo-cap .h-sans em{color:#C7D2FE}
    .photo-hint{font-family:${fonte.fontMono};font-size:24px;color:rgba(255,255,255,.82);margin-top:14px}
    .photo-title{font-size:72px;line-height:1.16;margin:0}
    .photo-bleed{position:absolute;inset:0;z-index:0;overflow:hidden}
    .photo-bleed img{width:100%;height:100%;object-fit:cover;filter:grayscale(.14) brightness(.8) contrast(1.06)}
    .photo-bleed .bleed-tint{position:absolute;inset:0;background:linear-gradient(150deg,color-mix(in srgb, ${brand.corPrimaria} 30%, transparent),color-mix(in srgb, ${brand.corSecundaria} 20%, transparent))}
    .photo-bleed .bleed-scrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(6,5,20,.94) 6%,rgba(6,5,20,.34) 46%,rgba(6,5,20,.66) 100%)}
    .photo-bleed-fallback{position:absolute;inset:0;z-index:-1;background:linear-gradient(to top,rgba(6,5,20,.72) 6%,rgba(6,5,20,.15) 46%,rgba(6,5,20,.4) 100%),linear-gradient(140deg,${brand.corPrimaria},${brand.corSecundaria})}
    .mid.photo-full{justify-content:flex-end;padding-bottom:26px}
    .mid.photo-full .h-sans{font-family:${fonte.fontDisplay};font-size:90px;line-height:1.14;color:#fff}
    .mid.photo-full .h-sans em{color:#c4b5fd}
    .mid.photo-full .hint{color:rgba(255,255,255,.86);margin-top:26px}
    /* 4 composições alternativas da capa (photo, full:true) — sorteada uma
       por post em montarSlidesPadrao (Slide.variante). Variante 0 é a
       original (acima, intocada). As 3 abaixo reaproveitam .photo-bleed/
       .photo-bleed-fallback como fundo, só mudando o scrim (pra photo real)
       e onde o texto fica. */
    .photo-bleed .bleed-scrim-v1{position:absolute;inset:0;background:radial-gradient(120% 85% at 50% 48%, rgba(6,5,20,.3) 0%, rgba(6,5,20,.74) 100%)}
    .mid.photo-full-v1{justify-content:center;align-items:center;text-align:center}
    .mid.photo-full-v1 .h-sans{font-family:${fonte.fontDisplay};font-size:100px;line-height:1.1;color:#fff}
    .mid.photo-full-v1 .h-sans em{color:#c4b5fd}
    .mid.photo-full-v1 .hint{color:rgba(255,255,255,.86);margin-top:26px}
    .photo-bleed .bleed-scrim-v2{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(6,5,20,.92) 0%,rgba(6,5,20,.48) 34%,rgba(6,5,20,0) 58%)}
    .mid.photo-full-v2{justify-content:flex-start;padding-top:8px}
    .mid.photo-full-v2 .h-sans{font-family:${fonte.fontDisplay};font-size:84px;line-height:1.16;color:#fff}
    .mid.photo-full-v2 .h-sans em{color:#c4b5fd}
    .mid.photo-full-v2 .hint{color:rgba(255,255,255,.86);margin-top:22px}
    .photo-bleed .bleed-scrim-v3{position:absolute;inset:0;background:linear-gradient(to top,rgba(6,5,20,.24) 0%,rgba(6,5,20,0) 36%)}
    .mid.photo-full-v3{justify-content:flex-end}
    .painel-capa{background:linear-gradient(120deg,color-mix(in srgb, ${brand.corPrimaria} 92%, black),color-mix(in srgb, ${brand.corSecundaria} 88%, black));border-radius:32px;padding:44px 48px;box-shadow:0 24px 64px rgba(12,10,45,.35)}
    .painel-capa .h-sans{font-family:${fonte.fontDisplay};font-size:72px;line-height:1.16;color:#fff;margin:0}
    .painel-capa .h-sans em{color:#c4b5fd}
    .painel-capa .hint{color:rgba(255,255,255,.86);margin-top:20px}
    /* Variantes dos layouts INTERNOS (não-capa) — mesmo princípio: sorteada
       uma por layout por post, variante 0 sempre a composição original. */
    .mid.photo-over-v1{flex-direction:column;justify-content:center;gap:36px}
    .mid.photo-over-v2{flex-direction:column-reverse}
    .photo-frame-v1{height:520px}
    .photo-caption-v1 .h-sans{font-size:60px;line-height:1.18;margin:0}
    .photo-caption-v1 .hint{margin-top:18px}
    .mid.photo-over-v3{flex-direction:column;justify-content:center;gap:0}
    .photo-frame-v3{border-radius:16px 16px 0 0;height:500px}
    .photo-tag-v3{background:linear-gradient(120deg,${brand.corPrimaria},${brand.corSecundaria});border-radius:0 0 24px 24px;padding:36px 40px}
    .photo-tag-v3 .h-sans{font-size:52px;line-height:1.2;color:#fff;margin:0}
    .photo-tag-v3 .hint{color:rgba(255,255,255,.86);margin-top:14px}
    .split-v1{flex-direction:column;align-items:flex-start;gap:24px}
    .split-v1 .split-num{width:auto;font-size:150px;line-height:1}
    .split-v1 .split-body{padding-top:0}
    .split-v2{position:relative}
    .split-v2 .split-num{position:absolute;left:-8px;top:-54px;font-size:320px;line-height:1;opacity:.16;z-index:-1;width:auto;color:var(--acc)}
    .split-v2 .split-body{padding-top:16px}
    .split-v3{border-left:8px solid var(--acc);padding-left:40px;gap:32px}
    .split-v3 .split-num{font-size:120px;width:auto}
    .mid.word-v1{text-align:center;align-items:center}
    .mid.word-v2 .h-word em{background:var(--acc);color:#fff;padding:0 .1em;border-radius:.1em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
    .mid.word-v3{justify-content:flex-end;align-items:flex-end;text-align:right}
    .mid.item-v1{flex-direction:row;align-items:center;gap:40px}
    .item-badge-v1{width:150px;height:150px;flex:none;border-radius:50%;background:color-mix(in srgb, var(--acc) 16%, transparent);display:flex;align-items:center;justify-content:center}
    .item-badge-v1 .num{font-size:72px;line-height:1}
    .mid.item-v1 .item-body{display:flex;flex-direction:column}
    .mid.item-v1 .item-text{margin-top:14px}
    .mid.item-v2{position:relative}
    .item-num-bg-v2{position:absolute;top:-30px;left:-6px;font-family:${fonte.fontDisplay};font-weight:800;font-size:280px;line-height:1;color:var(--acc);opacity:.14;z-index:-1}
    .mid.item-v3{background:color-mix(in srgb, var(--acc) 7%, transparent);border-radius:28px;padding:52px}
    .list-num-v1{width:44px;height:44px;border-radius:50%;background:color-mix(in srgb, var(--acc) 20%, transparent);color:var(--acc);font-family:${fonte.fontDisplay};font-weight:800;font-size:26px;display:flex;align-items:center;justify-content:center;flex:none;margin-top:2px}
    .list-item-v2{background:color-mix(in srgb, var(--acc) 6%, transparent);border-radius:20px;padding:22px 26px}
    .list-check-v3{width:34px;height:34px;border-radius:10px;background:var(--acc);flex:none;margin-top:2px}
    .mid.bottom-v1{justify-content:center;padding-bottom:0}
    .mid.bottom-v2{justify-content:flex-start;padding-top:8px;padding-bottom:0}
    .accent-bar-v3{width:120px;height:10px;border-radius:6px;background:linear-gradient(120deg,${brand.corPrimaria},${brand.corSecundaria});margin-bottom:28px}
    .mid.cta-v1{justify-content:center;padding-bottom:0}
    .mid.cta-v3{justify-content:flex-start;padding-top:8px;padding-bottom:0}
    .url-pill-v2{display:inline-block;font-family:${fonte.fontMono};font-size:28px;color:#fff;background:linear-gradient(120deg,${brand.corPrimaria},${brand.corSecundaria});padding:16px 32px;border-radius:999px;margin-top:34px;letter-spacing:.02em}
    .head{display:flex;flex-direction:column;align-items:flex-start;gap:24px}
    .logo-top{height:88px;width:auto;align-self:flex-start;display:block}
    .logo-sm{height:44px;width:auto;display:block}
    .kicker{font-family:${fonte.fontMono};text-transform:uppercase;letter-spacing:.16em;font-size:24px;color:var(--acc);font-weight:600}
    .mid{flex:1;display:flex;flex-direction:column;justify-content:center}
    .mid.lower{justify-content:flex-end}
    .mid.botspace{padding-bottom:${H > 1400 ? 170 : 76}px}
    .mid.logocover{align-items:center;justify-content:center;text-align:center}
    .cover-logo{width:760px;max-width:88%;height:auto}
    .cover-tag{font-family:${fonte.fontMono};text-transform:uppercase;letter-spacing:.24em;font-size:30px;color:var(--muted);margin-top:40px}
    .h-display{font-family:${fonte.fontDisplay};font-weight:700;font-size:78px;line-height:1.16;letter-spacing:-.02em;margin:0;text-wrap:balance}
    .h-sans{font-family:${fonte.fontDisplay};font-weight:800;font-size:78px;line-height:1.16;letter-spacing:-.025em;margin:0;text-wrap:balance}
    .h-word{font-family:${fonte.fontDisplay};font-weight:800;font-size:148px;line-height:1.1;letter-spacing:-.035em;margin:0;text-wrap:balance}
    .h-display em,.h-sans em,.h-word em{color:var(--acc);font-style:normal}
    .num,.split-num{color:var(--acc)}
    .num{font-family:${fonte.fontDisplay};font-weight:800;font-size:128px;line-height:1;letter-spacing:-.04em}
    .item-title{font-family:${fonte.fontDisplay};font-weight:700;font-size:64px;letter-spacing:-.02em;margin:4px 0 0}
    .item-text{font-family:${fonte.fontSans};font-weight:400;font-size:45px;line-height:1.32;color:var(--muted);margin:20px 0 0;max-width:30ch}
    .split{display:flex;align-items:flex-start;gap:48px}
    .split-num{font-family:${fonte.fontDisplay};font-weight:800;font-size:208px;line-height:.76;letter-spacing:-.05em;flex:none;width:172px}
    .split.wide .split-num{width:300px;font-size:168px;letter-spacing:-.045em}
    .split.wide .item-title{font-size:56px}
    .split-body{flex:1;padding-top:6px}
    .split-body .item-title{font-family:${fonte.fontDisplay};font-weight:700;font-size:63px;line-height:1.14;letter-spacing:-.025em;margin:0}
    .split-text{font-family:${fonte.fontSans};font-weight:400;font-size:45px;line-height:1.32;color:var(--muted);margin:22px 0 0;max-width:20ch}
    .list-mid{gap:52px}
    .list-title{font-family:${fonte.fontDisplay};font-weight:700;font-size:58px;letter-spacing:-.02em;line-height:1.16;margin:0;text-wrap:balance}
    .list{display:flex;flex-direction:column;gap:34px}
    .list-item{display:flex;align-items:flex-start;gap:24px}
    .list-dot{width:26px;height:26px;border-radius:8px;margin-top:12px;flex:none;background:linear-gradient(135deg,${brand.corPrimaria},${brand.corSecundaria})}
    .list-txt{font-family:${fonte.fontSans};font-size:42px;line-height:1.3;font-weight:500}
    .hint{font-family:${fonte.fontMono};font-size:26px;color:var(--muted);margin-top:32px}
    .url{font-family:${fonte.fontMono};font-size:30px;color:var(--acc);margin-top:34px;letter-spacing:.02em}
    .t-light .h-display em,.t-light .h-sans em,.t-light .h-word em,.t-light .num,.t-light .split-num,.t-light .url,.t-light .list-title em,
    .t-paper .h-display em,.t-paper .h-sans em,.t-paper .num,.t-paper .split-num,.t-paper .url,.t-paper .list-title em{
      background:${grad};-webkit-background-clip:text;background-clip:text;color:transparent}
    .t-ink .h-display em,.t-ink .h-sans em,.t-ink .h-word em,.t-ink .num,.t-ink .split-num,.t-ink .url,.t-ink .list-title em{color:var(--acc)}
    .list-title em{font-style:normal}
    .foot{display:flex;align-items:center;justify-content:space-between;min-height:44px}
    .lockup{display:flex;align-items:center;gap:16px;font-size:26px}
    .lockup .m{color:var(--muted);position:relative;top:3px}
    .count{font-family:${fonte.fontMono};font-size:24px;color:var(--muted);letter-spacing:.1em}
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

function headBlock(s: Slide, A: Assets): string {
  const bigLogo = s.logoTop ? `<img class="logo-top" src="${A.logo}" alt="logo">` : ''
  const kicker = s.kicker ? `<div class="kicker">${s.kicker}</div>` : ''
  return `<div class="head">${bigLogo}${kicker}</div>`
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
  const variante = ((s.variante ?? 0) % 4 + 4) % 4
  const uri = s.photoDataUri ?? ''
  const scrimClasse = variante === 0 ? 'bleed-scrim' : `bleed-scrim-v${variante}`
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

// split: v0 número ao lado (original); v1 número empilhado acima do texto;
// v2 número gigante e apagado atrás do texto (marca d'água); v3 barra de
// destaque na lateral, número menor.
function splitHTML(s: Slide): string {
  const variante = variante4(s)
  const largo = String(s.num ?? '').length > 1 ? 'wide' : ''
  const classeSplit = variante === 0 ? `split ${largo}` : `split split-v${variante} ${largo}`.trim()
  return `<div class="mid"><div class="${classeSplit}"><div class="split-num">${s.num}</div><div class="split-body"><div class="item-title">${s.title}</div><div class="split-text">${s.text}</div></div></div></div>`
}

// item: v0 empilhado (original); v1 número em badge circular, lado a lado
// com o texto; v2 número gigante e apagado atrás do título; v3 card com
// fundo levemente destacado.
function itemHTML(s: Slide): string {
  const variante = variante4(s)
  if (variante === 1) {
    return `<div class="mid item-v1"><div class="item-badge-v1"><div class="num">${s.num}</div></div><div class="item-body"><div class="item-title">${s.title}</div><div class="item-text">${s.text}</div></div></div>`
  }
  if (variante === 2) {
    return `<div class="mid item-v2"><div class="item-num-bg-v2">${s.num}</div><div class="item-title">${s.title}</div><div class="item-text">${s.text}</div></div>`
  }
  if (variante === 3) {
    return `<div class="mid item-v3"><div class="num">${s.num}</div><div class="item-title">${s.title}</div><div class="item-text">${s.text}</div></div>`
  }
  return `<div class="mid"><div class="num">${s.num}</div><div class="item-title">${s.title}</div><div class="item-text">${s.text}</div></div>`
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

function midBlock(s: Slide, A: Assets): string {
  const L = s.layout || 'statement'
  const hint = s.hint ? `<div class="hint">${s.hint}</div>` : ''
  const url = s.url ? `<div class="url">${s.url}</div>` : ''
  const variante = variante4(s)

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
  if (L === 'item') return itemHTML(s)
  if (L === 'split') return splitHTML(s)
  if (L === 'list') return listHTML(s)
  return `<div class="mid"><h1 class="h-display">${s.headline}</h1></div>`
}

function wmMarkup(s: Slide, A: Assets): string {
  const L = s.layout || 'statement'
  if (L === 'logocover') return ''
  // Foto real já cumpre o papel decorativo do ícone de marca — só mostra o
  // ícone quando a foto está faltando (fallback), pra não deixar o slide sem
  // nenhuma decoração de marca.
  if (L === 'photo' && s.photoDataUri) return ''
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
): string {
  if (slide.layout === 'tweet') return tweetPageHTML(slide, index, total, altura, padTop, padBottom, brand)
  const theme = slide.theme ?? brand.temaPadrao
  const A = assetsFor(theme, brand)
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css(brand, altura, padTop, padBottom)}</style></head><body><div class="slide t-${theme}">${wmMarkup(slide, A)}${headBlock(slide, A)}${midBlock(slide, A)}${footBlock(slide, index, total, A, brand)}</div></body></html>`
}
