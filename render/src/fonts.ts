// Fontes embutidas em base64, direto no CSS gerado — garante que a peça sai
// idêntica em qualquer máquina, sem depender do que está instalado no host nem
// de rede. Hoje é um único conjunto curado (Poppins + Inter + JetBrains Mono);
// mais conjuntos entram aqui quando o BrandKit passar a oferecer escolha real
// de fonte.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const FONTS_DIR = path.join(HERE, '..', 'assets', 'fonts')

function fontURI(nome: string): string {
  try {
    return 'data:font/woff2;base64,' + readFileSync(path.join(FONTS_DIR, nome)).toString('base64')
  } catch {
    return ''
  }
}

export type ConjuntoFonte = 'poppins-inter'

export interface PacoteFonte {
  fontDisplay: string
  fontSans: string
  fontMono: string
  faces: string
}

const CACHE = new Map<ConjuntoFonte, PacoteFonte>()

export function pacoteFonte(conjunto: ConjuntoFonte): PacoteFonte {
  const cache = CACHE.get(conjunto)
  if (cache) return cache

  const inter = fontURI('Inter-var.woff2')
  const mono = fontURI('JetBrainsMono-var.woff2')
  const p600 = fontURI('Poppins-600.woff2')
  const p700 = fontURI('Poppins-700.woff2')
  const p800 = fontURI('Poppins-800.woff2')

  const pacote: PacoteFonte = {
    fontDisplay: "'Poppins', 'Inter', system-ui, sans-serif",
    fontSans: "'Inter', system-ui, -apple-system, sans-serif",
    fontMono: "'JetBrains Mono', ui-monospace, 'Consolas', monospace",
    faces: `
      @font-face{font-family:'Inter';src:url(${inter}) format('woff2');font-weight:100 900;font-display:block}
      @font-face{font-family:'JetBrains Mono';src:url(${mono}) format('woff2');font-weight:100 800;font-display:block}
      @font-face{font-family:'Poppins';src:url(${p600}) format('woff2');font-weight:600;font-display:block}
      @font-face{font-family:'Poppins';src:url(${p700}) format('woff2');font-weight:700;font-display:block}
      @font-face{font-family:'Poppins';src:url(${p800}) format('woff2');font-weight:800;font-display:block}
    `,
  }
  CACHE.set(conjunto, pacote)
  return pacote
}
