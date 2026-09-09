'use server'

import { revalidatePath } from 'next/cache'
import { ServerFetchError, serverFetch } from '@/lib/session'

export interface ResultadoAcao {
  erro?: string
  emailEnviado?: boolean
}

export async function criarConta(valores: { nome: string; email: string }): Promise<ResultadoAcao> {
  let emailEnviado = true
  try {
    const resultado = await serverFetch<{ emailEnviado: boolean }>('/admin/contas', {
      method: 'POST',
      body: JSON.stringify(valores),
    })
    emailEnviado = resultado.emailEnviado
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao criar a conta' }
  }
  revalidatePath('/admin')
  return { emailEnviado }
}

export async function reenviarConvite(contaId: string, email?: string): Promise<ResultadoAcao> {
  let emailEnviado = true
  try {
    const resultado = await serverFetch<{ emailEnviado: boolean }>(`/admin/contas/${contaId}/convite/reenviar`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    emailEnviado = resultado.emailEnviado
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao reenviar o convite' }
  }
  revalidatePath('/admin')
  return { emailEnviado }
}

export async function alterarStatusConta(contaId: string, status: 'ativa' | 'inativa'): Promise<ResultadoAcao> {
  try {
    await serverFetch(`/admin/contas/${contaId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao alterar o status da conta' }
  }
  revalidatePath('/admin')
  return {}
}

export async function excluirConta(contaId: string): Promise<ResultadoAcao> {
  try {
    await serverFetch(`/admin/contas/${contaId}`, { method: 'DELETE' })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao excluir a conta' }
  }
  revalidatePath('/admin')
  return {}
}
