import type { PostContent } from './post.js'
import type { BrandKit } from './brand.js'
import type { RedeSocial } from './redes.js'

export interface RenderJobPayload {
  postId: string
  brand: BrandKit
  post: PostContent
  // Ausente = render do post principal, escrito em OUTPUT_DIR/{postId}/.
  // Presente = render específico dessa rede, escrito em
  // OUTPUT_DIR/{postId}/{canal}/ — mesma fila e worker, só o destino muda.
  canal?: RedeSocial
}

export interface RenderJobResult {
  postId: string
  status: 'concluido' | 'erro'
  /** diretório relativo a OUTPUT_DIR onde os arquivos foram escritos */
  outputDir?: string
  arquivos?: string[]
  erro?: string
}

export const RENDER_QUEUE_NAME = 'render'
