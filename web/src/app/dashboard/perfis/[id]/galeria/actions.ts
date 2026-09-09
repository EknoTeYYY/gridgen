'use server'

import { revalidatePath } from 'next/cache'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { GaleriaItem, GaleriaPasta } from '@/lib/types'

export interface ResultadoAcao {
  erro?: string
}

export async function criarPastaGaleria(perfilId: string, nome: string): Promise<ResultadoAcao> {
  try {
    await serverFetch<GaleriaPasta>(`/perfis/${perfilId}/galeria/pastas`, {
      method: 'POST',
      body: JSON.stringify({ nome }),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao criar a pasta' }
  }
  revalidatePath(`/dashboard/perfis/${perfilId}/galeria`)
  return {}
}

export async function criarItemGaleria(
  perfilId: string,
  valores: { pasta: string; nome?: string; url: string },
): Promise<ResultadoAcao> {
  try {
    await serverFetch<GaleriaItem>(`/perfis/${perfilId}/galeria`, {
      method: 'POST',
      body: JSON.stringify(valores),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao adicionar a imagem' }
  }
  revalidatePath(`/dashboard/perfis/${perfilId}/galeria`)
  return {}
}

export async function renomearItemGaleria(perfilId: string, id: string, nome: string): Promise<ResultadoAcao> {
  try {
    await serverFetch<GaleriaItem>(`/galeria/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ nome }),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao renomear a imagem' }
  }
  revalidatePath(`/dashboard/perfis/${perfilId}/galeria`)
  return {}
}

export async function excluirItemGaleria(perfilId: string, id: string): Promise<ResultadoAcao> {
  try {
    await serverFetch(`/galeria/${id}`, { method: 'DELETE' })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao excluir a imagem' }
  }
  revalidatePath(`/dashboard/perfis/${perfilId}/galeria`)
  return {}
}
