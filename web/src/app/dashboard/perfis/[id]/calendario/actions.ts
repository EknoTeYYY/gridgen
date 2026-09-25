'use server'

import { revalidatePath } from 'next/cache'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { DataPersonalizada, PautaCalendario, Post, PropostaCalendario } from '@/lib/types'

export interface ResultadoAcao {
  erro?: string
}

export interface ResultadoPropostaMensal extends ResultadoAcao {
  proposta?: PropostaCalendario
}

export async function gerarPropostaMensal(perfilId: string, ano: number, mes: number): Promise<ResultadoPropostaMensal> {
  try {
    const proposta = await serverFetch<PropostaCalendario>(`/perfis/${perfilId}/calendario-mensal/gerar`, {
      method: 'POST',
      body: JSON.stringify({ ano, mes }),
    })
    revalidatePath(`/dashboard/perfis/${perfilId}/calendario`)
    return { proposta }
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao gerar a proposta do mês' }
  }
}

export async function buscarPropostaMensal(perfilId: string, ano: number, mes: number): Promise<PropostaCalendario | null> {
  try {
    return await serverFetch<PropostaCalendario | null>(`/perfis/${perfilId}/calendario-mensal?ano=${ano}&mes=${mes}`)
  } catch {
    return null
  }
}

export async function aprovarPropostaMensal(perfilId: string, propostaId: string): Promise<ResultadoPropostaMensal> {
  try {
    const proposta = await serverFetch<PropostaCalendario>(`/calendario-mensal/${propostaId}/aprovar`, { method: 'POST' })
    revalidatePath(`/dashboard/perfis/${perfilId}/calendario`)
    return { proposta }
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao aprovar a proposta' }
  }
}

export async function editarPautaMensal(
  perfilId: string,
  pautaId: string,
  valores: Partial<
    Pick<
      PautaCalendario,
      'assunto' | 'abordagem' | 'publico' | 'objetivo' | 'motivoEscolha' | 'tipo' | 'formato' | 'dataHorario' | 'direcaoVisual' | 'acaoDesejada' | 'dependencias' | 'alternativa'
    >
  > & { motivoTroca?: string },
): Promise<ResultadoAcao> {
  try {
    await serverFetch<PautaCalendario>(`/calendario-mensal/pautas/${pautaId}`, {
      method: 'PATCH',
      body: JSON.stringify(valores),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao editar a pauta' }
  }
  revalidatePath(`/dashboard/perfis/${perfilId}/calendario`)
  return {}
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
