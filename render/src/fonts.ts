// Fontes embutidas em base64, direto no CSS gerado — garante que a peça sai
// idêntica em qualquer máquina, sem depender do que está instalado no host nem
// de rede. Cada Perfil escolhe um conjunto curado (`FONTES_CURADAS`, no
// shared): uma fonte de título (`fontDisplay`) e uma de texto (`fontSans`).
// A mono dos rótulos/contador é a mesma em todos os conjuntos.
//
// Os arquivos são o subset "latin" do Google Fonts (cobre ã, ç, é…), nas
// faixas de peso que o motor usa: 600–800 no título, 400–700 no texto.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fonteCurada, type ConjuntoFonte } from '@gridgen/shared'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FONTS_DIR = path.join(HERE, '..', 'assets', 'fonts')

function fontURI(nome: string): string {
  try {
    return 'data:font/woff2;base64,' + readFileSync(path.join(FONTS_DIR, nome)).toString('base64')
  } catch {
    return ''
  }
}

export interface PacoteFonte {
  fontDisplay: string
  fontSans: string
  fontMono: string
  faces: string
}

interface Familia {
  // Arquivo(s) e faixa de peso de cada um — variável = 1 arquivo com faixa.
  arquivos: Array<{ arquivo: string; peso: string }>
  fallback: string
}

const SANS = 'system-ui, -apple-system, sans-serif'
const SERIF = "Georgia, 'Times New Roman', serif"

const FAMILIAS: Record<string, Familia> = {
  Poppins: {
    arquivos: [
      { arquivo: 'Poppins-600.woff2', peso: '600' },
      { arquivo: 'Poppins-700.woff2', peso: '700' },
      { arquivo: 'Poppins-800.woff2', peso: '800' },
    ],
    fallback: SANS,
  },
  Inter: { arquivos: [{ arquivo: 'Inter-var.woff2', peso: '100 900' }], fallback: SANS },
  Montserrat: { arquivos: [{ arquivo: 'Montserrat-var.woff2', peso: '600 800' }], fallback: SANS },
  'Open Sans': { arquivos: [{ arquivo: 'OpenSans-var.woff2', peso: '400 700' }], fallback: SANS },
  'Playfair Display': { arquivos: [{ arquivo: 'PlayfairDisplay-var.woff2', peso: '600 800' }], fallback: SERIF },
  'Source Sans 3': { arquivos: [{ arquivo: 'SourceSans3-var.woff2', peso: '400 700' }], fallback: SANS },
  Fraunces: { arquivos: [{ arquivo: 'Fraunces-var.woff2', peso: '600 800' }], fallback: SERIF },
  Manrope: { arquivos: [{ arquivo: 'Manrope-var.woff2', peso: '400 700' }], fallback: SANS },
  Sora: { arquivos: [{ arquivo: 'Sora-var.woff2', peso: '600 800' }], fallback: SANS },
  'DM Sans': { arquivos: [{ arquivo: 'DMSans-var.woff2', peso: '400 700' }], fallback: SANS },
  // Nunito faz título e texto no mesmo conjunto — 1 arquivo cobre 400–800.
  Nunito: { arquivos: [{ arquivo: 'Nunito-var.woff2', peso: '400 800' }], fallback: SANS },
  Merriweather: { arquivos: [{ arquivo: 'Merriweather-var.woff2', peso: '600 800' }], fallback: SERIF },
  'Merriweather Sans': { arquivos: [{ arquivo: 'MerriweatherSans-var.woff2', peso: '400 700' }], fallback: SANS },
}

function facesDa(nome: string): string {
  return FAMILIAS[nome].arquivos
    .map(
      ({ arquivo, peso }) =>
        `@font-face{font-family:'${nome}';src:url(${fontURI(arquivo)}) format('woff2');font-weight:${peso};font-display:block}`,
    )
    .join('\n')
}

const CACHE = new Map<ConjuntoFonte, PacoteFonte>()

export function pacoteFonte(conjunto: ConjuntoFonte | string | null | undefined): PacoteFonte {
  // Valor desconhecido (Perfil antigo, typo no banco) cai no conjunto padrão
  // em vez de quebrar o render.
  const { id, titulo, texto } = fonteCurada(conjunto)
  const cache = CACHE.get(id)
  if (cache) return cache

  const familias = [...new Set([titulo, texto])]
  const pacote: PacoteFonte = {
    fontDisplay: `'${titulo}', ${FAMILIAS[titulo].fallback}`,
    fontSans: `'${texto}', ${FAMILIAS[texto].fallback}`,
    fontMono: "'JetBrains Mono', ui-monospace, 'Consolas', monospace",
    faces: `
      ${familias.map(facesDa).join('\n')}
      @font-face{font-family:'JetBrains Mono';src:url(${fontURI('JetBrainsMono-var.woff2')}) format('woff2');font-weight:100 800;font-display:block}
    `,
  }
  CACHE.set(id, pacote)
  return pacote
}
