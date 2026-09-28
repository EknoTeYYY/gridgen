'use server'

import { ServerFetchError, serverFetch } from '@/lib/session'

export interface ResultadoAcao {
  erro?: string
}

export async function solicitarUpgrade(valores: {
  tipo: 'plano' | 'pacote' | 'perfil_extra' | 'sob_medida'
  planoId?: 'essencial' | 'profissional' | 'agencia' | 'sob_medida'
  mensagem?: string
}): Promise<ResultadoAcao> {
  try {
    await serverFetch('/conta/solicitar-upgrade', { method: 'POST', body: JSON.stringify(valores) })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao enviar o pedido' }
  }
  return {}
}
