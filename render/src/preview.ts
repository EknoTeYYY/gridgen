// Script manual de verificação visual — não faz parte do worker, só serve pra
// conferir visualmente o motor migrado (fontes, cores derivadas do BrandKit,
// o bug do gradiente corrigido). Uso: npx tsx src/preview.ts
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { BrandKit, Slide } from '@gridgen/shared'
import { closeBrowser, getBrowser } from './browser.js'
import { CANVAS_SCALE, dimensoesPara, pageHTML } from './engine.js'

const BRAND_TESTE: BrandKit = {
  corPrimaria: '#8b5cf6',
  corSecundaria: '#3b82f6',
  corFundo: '#0b0a14',
  corTexto: '#f1effa',
  fonte: 'poppins-inter',
  logoColorUrl: null,
  logoBrancoUrl: null,
  iconeColorUrl: null,
  iconeBrancoUrl: null,
  lockupTag: 'marketing imobiliário',
  url: 'exemplo.com.br',
  temaPadrao: 'ink',
  nome: 'Imobiliária Exemplo',
  instagramHandle: '@imobiliariaexemplo',
}

// 1x1 px cinza — só pra exercitar o layout "photo" sem depender de asset real.
const FOTO_TESTE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

// Foto de teste com alguma estrutura visual (céu + "prédio" + "sol") — uma
// cor chapada não deixa dar pra avaliar como cada scrim de variante se
// comporta de verdade.
const FOTO_CENA_TESTE =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
      <rect width="1080" height="1350" fill="#87ceeb"/>
      <circle cx="820" cy="260" r="140" fill="#fde68a"/>
      <rect x="0" y="700" width="1080" height="650" fill="#334155"/>
      <rect x="120" y="780" width="220" height="570" fill="#1e293b"/>
      <rect x="420" y="600" width="260" height="750" fill="#475569"/>
      <rect x="760" y="850" width="200" height="500" fill="#1e293b"/>
    </svg>`,
  ).toString('base64')

const SLIDES: Slide[] = [
  { layout: 'word', theme: 'ink', kicker: 'o problema de sempre', headline: 'Isso aqui era só uma <em>ideia</em>.' },
  { layout: 'split', theme: 'ink', num: '1', title: 'Passo um', text: 'Explicação curta do primeiro passo da sequência.' },
  {
    layout: 'list',
    theme: 'ink',
    kicker: 'um só parceiro',
    headline: 'Tudo na mesma <em>casa</em>:',
    items: ['Item um da lista', 'Item dois da lista', 'Item três da lista'],
  },
  { layout: 'photo', theme: 'ink', full: true, logoTop: true, photoDataUri: FOTO_TESTE, headline: 'Título sobre <em>foto</em>.' },
  { layout: 'photo', theme: 'ink', full: true, logoTop: true, headline: 'Capa sem foto — <em>fallback</em>.' },
  // 4 variantes da capa (item 3 do refinamento) — foto de teste com alguma
  // estrutura visual (não uma cor chapada), pra dar pra avaliar o scrim de
  // cada variante de verdade.
  {
    layout: 'photo',
    theme: 'ink',
    full: true,
    logoTop: true,
    variante: 0,
    photoDataUri: FOTO_CENA_TESTE,
    kicker: 'variante 0',
    headline: 'Capa padrão — <em>texto embaixo</em>.',
    hint: 'a composição original, intocada',
  },
  {
    layout: 'photo',
    theme: 'ink',
    full: true,
    logoTop: true,
    variante: 1,
    photoDataUri: FOTO_CENA_TESTE,
    kicker: 'variante 1',
    headline: 'Centro dramático, texto <em>no meio</em>.',
    hint: 'vinheta ao redor, tudo centralizado',
  },
  {
    layout: 'photo',
    theme: 'ink',
    full: true,
    logoTop: true,
    variante: 2,
    photoDataUri: FOTO_CENA_TESTE,
    kicker: 'variante 2',
    headline: 'Banner no <em>topo</em>.',
    hint: 'a foto respira livre embaixo',
  },
  {
    layout: 'photo',
    theme: 'ink',
    full: true,
    logoTop: true,
    variante: 3,
    photoDataUri: FOTO_CENA_TESTE,
    kicker: 'variante 3',
    headline: 'Painel sólido embaixo.',
    hint: 'card separado da foto, não um degradê',
  },
  // Variante 4 — manchete estilo capa de jornal esportivo (referência real:
  // CazéTV/Instagram). Texto bem maior, em caixa alta, sobre o mesmo scrim
  // forte da v0.
  {
    layout: 'photo',
    theme: 'ink',
    full: true,
    logoTop: true,
    variante: 4,
    photoDataUri: FOTO_CENA_TESTE,
    kicker: 'variante 4',
    headline: 'Contrato fechado, <em>oficial</em>.',
    hint: 'manchete grande, caixa alta',
  },
  // Variante 3 sem foto — confirma que o fallback de gradiente ainda funciona
  // (o painel sólido não depende de foto por trás pra ficar legível).
  {
    layout: 'photo',
    theme: 'ink',
    full: true,
    logoTop: true,
    variante: 3,
    headline: 'Painel sólido, sem foto.',
    hint: 'fallback de gradiente por trás',
  },
  { layout: 'word', theme: 'light', kicker: 'tema claro', headline: 'Acento em <em>gradiente</em> — bug corrigido.' },
  { layout: 'tweet', theme: 'light', text: 'Contrato parado esperando aprovação há dias? Isso custa tempo e dinheiro. Veja como resolvemos isso.' },
  { layout: 'tweet', theme: 'ink', text: 'Fundo escuro do mesmo card, pra comparar os dois.' },
  { layout: 'tweet', theme: 'light', text: 'Silêncio.' },
  {
    layout: 'tweet',
    theme: 'light',
    photoDataUri:
      'data:image/svg+xml;base64,' +
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#ef4444"/></svg>').toString(
        'base64',
      ),
    text: 'Com imagem de referência anexada — entra entre o cabeçalho e o texto.',
  },
  // Reproduz o bug reportado pelo usuário: foto + texto real (214 caracteres,
  // tamanho visto em geração de verdade) — checa se estoura a altura do card.
  {
    layout: 'tweet',
    theme: 'light',
    photoDataUri:
      'data:image/svg+xml;base64,' +
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#0ea5e9"/></svg>').toString(
        'base64',
      ),
    text: 'Esse cenário se repetia todos os dias na operação de um cliente: o time comercial era ágil, mas o processo de formalização atrás dele não acompanhava o ritmo. Cada contrato parado era uma venda em risco.',
  },
  // Pior caso de verdade: texto no teto do maxLength (260) + foto — pra saber
  // se o card aguenta o pior cenário possível, não só um exemplo médio.
  {
    layout: 'tweet',
    theme: 'light',
    photoDataUri:
      'data:image/svg+xml;base64,' +
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="720"><rect width="1080" height="720" fill="#0ea5e9"/></svg>').toString(
        'base64',
      ),
    text: 'Esse cenário se repetia todos os dias na operação de um cliente Gedfy de verdade: o time comercial era ágil e fechava proposta rápido, mas o processo de formalização atrás dele não acompanhava o ritmo. Cada contrato parado era uma venda em risco real, não só um número numa planilha qualquer.',
  },
  // Mesmo texto que coube (203 chars), só que com foto em retrato (900x1400,
  // mais alta que larga) — checa se a proporção da foto real (não a minha
  // caixa de teste em paisagem) é o que quebra o limite de altura.
  {
    layout: 'tweet',
    theme: 'light',
    photoDataUri:
      'data:image/svg+xml;base64,' +
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1400"><rect width="900" height="1400" fill="#16a34a"/></svg>').toString(
        'base64',
      ),
    text: 'Esse cenário se repetia todos os dias na operação de um cliente: o time comercial era ágil, mas o processo de formalização atrás dele não acompanhava o ritmo. Cada contrato parado era uma venda em risco.',
  },
  // Variantes dos layouts INTERNOS (item 3, parte 2) — 4 por layout.
  { layout: 'split', theme: 'ink', variante: 0, num: '1', title: 'Variante 0', text: 'Número ao lado, como sempre foi.' },
  { layout: 'split', theme: 'ink', variante: 1, num: '2', title: 'Variante 1', text: 'Número empilhado acima do texto.' },
  { layout: 'split', theme: 'ink', variante: 2, num: '3', title: 'Variante 2', text: 'Número gigante e apagado atrás do texto.' },
  { layout: 'split', theme: 'ink', variante: 3, num: '4', title: 'Variante 3', text: 'Barra de destaque na lateral.' },
  { layout: 'word', theme: 'ink', variante: 0, kicker: 'variante 0', headline: 'Texto <em>grande</em> de sempre.' },
  { layout: 'word', theme: 'ink', variante: 1, kicker: 'variante 1', headline: 'Tudo <em>centralizado</em>.' },
  { layout: 'word', theme: 'ink', variante: 2, kicker: 'variante 2', headline: 'Destaque <em>marcado</em>.' },
  { layout: 'word', theme: 'ink', variante: 3, kicker: 'variante 3', headline: 'Ancorado à <em>direita</em>.' },
  { layout: 'item', theme: 'ink', variante: 0, kicker: 'variante 0', num: '1', title: 'Empilhado', text: 'A composição original, número acima do título.' },
  { layout: 'item', theme: 'ink', variante: 1, kicker: 'variante 1', num: '2', title: 'Badge circular', text: 'Número num círculo, ao lado do texto.' },
  { layout: 'item', theme: 'ink', variante: 2, kicker: 'variante 2', num: '3', title: 'Marca dágua', text: 'Número gigante e apagado atrás do título.' },
  { layout: 'item', theme: 'ink', variante: 3, kicker: 'variante 3', num: '4', title: 'Card destacado', text: 'Fundo levemente colorido ao redor do bloco.' },
  {
    layout: 'list',
    theme: 'ink',
    variante: 0,
    kicker: 'variante 0',
    headline: 'Lista <em>padrão</em>',
    items: ['Primeiro item da lista', 'Segundo item da lista', 'Terceiro item'],
  },
  {
    layout: 'list',
    theme: 'ink',
    variante: 1,
    kicker: 'variante 1',
    headline: 'Itens <em>numerados</em>',
    items: ['Primeiro item', 'Segundo item', 'Terceiro item'],
  },
  {
    layout: 'list',
    theme: 'ink',
    variante: 2,
    kicker: 'variante 2',
    headline: 'Itens em <em>cards</em>',
    items: ['Primeiro item', 'Segundo item', 'Terceiro item'],
  },
  {
    layout: 'list',
    theme: 'ink',
    variante: 3,
    kicker: 'variante 3',
    headline: 'Com <em>checkmark</em>',
    items: ['Primeiro item', 'Segundo item', 'Terceiro item'],
  },
  { layout: 'bottom', theme: 'ink', variante: 0, kicker: 'variante 0', headline: 'Ancorado embaixo, como sempre.' },
  { layout: 'bottom', theme: 'ink', variante: 1, kicker: 'variante 1', headline: 'Centralizado na tela.' },
  { layout: 'bottom', theme: 'ink', variante: 2, kicker: 'variante 2', headline: 'Ancorado no topo.' },
  { layout: 'bottom', theme: 'ink', variante: 3, kicker: 'variante 3', headline: 'Com barra de destaque acima.' },
  { layout: 'cta', theme: 'ink', variante: 0, kicker: 'variante 0', headline: 'O convite de sempre', url: 'exemplo.com.br/link' },
  { layout: 'cta', theme: 'ink', variante: 1, kicker: 'variante 1', headline: 'Convite centralizado', url: 'exemplo.com.br/link' },
  { layout: 'cta', theme: 'ink', variante: 2, kicker: 'variante 2', headline: 'URL em botão', url: 'exemplo.com.br/link' },
  { layout: 'cta', theme: 'ink', variante: 3, kicker: 'variante 3', headline: 'Convite no topo', url: 'exemplo.com.br/link' },
  { layout: 'photo', theme: 'ink', variante: 0, kicker: 'variante 0', photoDataUri: FOTO_CENA_TESTE, headline: 'Legenda dentro do <em>frame</em>' },
  {
    layout: 'photo',
    theme: 'ink',
    variante: 1,
    kicker: 'variante 1',
    photoDataUri: FOTO_CENA_TESTE,
    headline: 'Legenda <em>separada</em> abaixo',
    hint: 'foto e texto bem distintos',
  },
  {
    layout: 'photo',
    theme: 'ink',
    variante: 2,
    kicker: 'variante 2',
    photoDataUri: FOTO_CENA_TESTE,
    headline: 'Legenda <em>acima</em> da foto',
    hint: 'ordem invertida',
  },
  {
    layout: 'photo',
    theme: 'ink',
    variante: 3,
    kicker: 'variante 3',
    photoDataUri: FOTO_CENA_TESTE,
    headline: 'Faixa colorida <em>emendada</em>',
    hint: 'moldura quadrada + tag',
  },
  // Estilo "grafico" (item avaliado a partir de referência real do usuário —
  // infográfico de barras estilo Snaq/LinkedIn). Réplica próxima do exemplo
  // real: 7 barras, uma destacada, com sub-rótulo (ano) embaixo do nome.
  {
    layout: 'grafico',
    theme: 'ink',
    logoTop: true,
    headline: 'Quantas pessoas uma empresa precisa pra gerar US$ 30 bilhões?',
    text: 'Número de funcionários no ano em que cada empresa alcançou faturamento da ordem de US$ 30 bilhões anuais.',
    hint: '*Estimativa. Fonte: dados agregados de fontes públicas.',
    barras: [
      { rotulo: 'Exemplo A', valor: 5000, valorExibido: '5.000', subrotulo: '2026', destaque: true },
      { rotulo: 'Exemplo B', valor: 11300, valorExibido: '11.300', subrotulo: '2021' },
      { rotulo: 'Exemplo C', valor: 17048, valorExibido: '17.048', subrotulo: '2016' },
      { rotulo: 'Exemplo D', valor: 26196, valorExibido: '26.196', subrotulo: '2023' },
      { rotulo: 'Exemplo E', valor: 32000, valorExibido: '32.000', subrotulo: '2011' },
      { rotulo: 'Exemplo F', valor: 55000, valorExibido: '55.000', subrotulo: '2003' },
      { rotulo: 'Exemplo G', valor: 79390, valorExibido: '79.390', subrotulo: '2023' },
    ],
  },
  // Tema claro + caso mínimo (2 barras, sem sub-rótulo nem fonte).
  {
    layout: 'grafico',
    theme: 'light',
    logoTop: true,
    headline: 'Duas barras só, tema claro, sem observação.',
    barras: [
      { rotulo: 'Antes', valor: 40, valorExibido: '40%' },
      { rotulo: 'Depois', valor: 92, valorExibido: '92%', destaque: true },
    ],
  },
]

async function main() {
  const outDir = path.join(process.cwd(), '.preview')
  await mkdir(outDir, { recursive: true })

  const browser = await getBrowser()
  const page = await browser.newPage()
  const { largura, altura, padTop, padBottom } = dimensoesPara('feed')
  await page.setViewport({ width: largura, height: altura, deviceScaleFactor: CANVAS_SCALE })

  for (let i = 0; i < SLIDES.length; i++) {
    const html = pageHTML(SLIDES[i], i, SLIDES.length, altura, padTop, padBottom, BRAND_TESTE)
    await page.setContent(html, { waitUntil: 'load' })
    const arquivo = path.join(outDir, `${String(i + 1).padStart(2, '0')}-${SLIDES[i].layout}-${SLIDES[i].theme}.png`)
    await page.screenshot({ path: arquivo as `${string}.png` })
    console.log('✓', arquivo)
  }

  await page.close()
  await closeBrowser()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
