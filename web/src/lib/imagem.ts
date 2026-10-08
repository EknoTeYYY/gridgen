// Prepara uma imagem escolhida pelo usuário para envio como data URI.
export function converterParaDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('falha ao ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

// Foto baixada em tamanho original (Pexels/Unsplash: 5–20 MB) passava dos
// limites do envio (10 MB na server action, ~3,6 MB de arquivo na API) e era
// recusada antes de chegar à API (achado real, 08/10/2026). A arte é
// renderizada a 2160px no máximo (1080 × escala 2), então reduz o lado maior
// para 2160px e recomprime em JPEG — PNG com transparência (logo) continua PNG.
const LADO_MAXIMO = 2160
const TAMANHO_SEM_AJUSTE = 1.5 * 1024 * 1024

export async function prepararImagem(file: File): Promise<string> {
  if (file.size <= TAMANHO_SEM_AJUSTE || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return converterParaDataUri(file)
  }
  const bitmap = await createImageBitmap(file)
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  const ctx = canvas.getContext('2d')
  if (!ctx) return converterParaDataUri(file)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  if (file.type === 'image/png' && temTransparencia(ctx, canvas.width, canvas.height)) {
    return canvas.toDataURL('image/png')
  }
  return canvas.toDataURL('image/jpeg', 0.88)
}

function temTransparencia(ctx: CanvasRenderingContext2D, largura: number, altura: number): boolean {
  const { data } = ctx.getImageData(0, 0, largura, altura)
  for (let i = 3; i < data.length; i += 4 * 64) if (data[i] < 255) return true
  return false
}
