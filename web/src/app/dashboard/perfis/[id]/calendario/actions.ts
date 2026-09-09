'use server'

import { revalidatePath } from 'next/cache'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { DataPersonalizada, Post } from '@/lib/types'

export interface ResultadoAcao {
  erro?: string
}

export async function criarDataPersonalizada(
  perfilId: string,
  valores: { nome: string; mes: number; dia: number; tipoSugerido: Post['tipo'] },
): Promise<ResultadoAcao> {
  try {
    await serverFetch<DataPersonalizada>(`/perfis/${perfilId}/datas-personalizadas`, {
      method: 'POST',
      body: JSON.stringify(valores),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao criar a data' }
  }
  revalidatePath(`/dashboard/perfis/${perfilId}/calendario`)
  return {}
}

export async function excluirDataPersonalizada(perfilId: string, id: string): Promise<ResultadoAcao> {
  try {
    await serverFetch(`/datas-personalizadas/${id}`, { method: 'DELETE' })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao excluir a data' }
  }
  revalidatePath(`/dashboard/perfis/${perfilId}/calendario`)
  return {}
}
