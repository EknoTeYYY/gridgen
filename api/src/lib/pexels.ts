import { env } from '../env.js'

const PEXELS_API = 'https://api.pexels.com/v1'

// Só o domínio de imagens do Pexels pode ser buscado aqui — sem isso, o
// endpoint de download viraria um proxy aberto pra baixar qualquer URL.
const HOST_PERMITIDO = /(^|\.)pexels\.com$/i

function exigirChave(): string {
  if (!env.PEXELS_API_KEY) {
    throw new Error('PEXELS_API_KEY não configurada — defina no .env pra buscar imagens de referência.')
  }
  return env.PEXELS_API_KEY
}

export interface FotoReferencia {
  id: number
  miniaturaUrl: string
  imagemUrl: string
  fotografo: string
  fotografoUrl: string
}

interface RespostaBuscaPexels {
  photos: Array<{
    id: number
    photographer: string
    photographer_url: string
    src: { medium: string; large2x?: string; large: string; original: string }
  }>
}

export async function buscarFotos(consulta: string): Promise<FotoReferencia[]> {
  const chave = exigirChave()
  const url = new URL(`${PEXELS_API}/search`)
  url.searchParams.set('query', consulta)
  url.searchParams.set('per_page', '24')

  const res = await fetch(url, { headers: { Authorization: chave } })
  if (!res.ok) throw new Error(`Pexels retornou ${res.status} ao buscar "${consulta}"`)

  const dados = (await res.json()) as RespostaBuscaPexels
  return dados.photos.map((foto) => ({
    id: foto.id,
    miniaturaUrl: foto.src.medium,
    imagemUrl: foto.src.large2x ?? foto.src.large ?? foto.src.original,
    fotografo: foto.photographer,
    fotografoUrl: foto.photographer_url,
  }))
}

export async function baixarComoDataUri(imagemUrl: string): Promise<string> {
  const url = new URL(imagemUrl)
  if (!HOST_PERMITIDO.test(url.hostname)) {
    throw new Error('URL de imagem fora do domínio permitido (pexels.com)')
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error(`falha ao baixar imagem do Pexels (${res.status})`)

  const buffer = Buffer.from(await res.arrayBuffer())
  const tipo = res.headers.get('content-type') ?? 'image/jpeg'
  return `data:${tipo};base64,${buffer.toString('base64')}`
}
