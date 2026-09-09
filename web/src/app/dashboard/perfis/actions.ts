'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { Perfil, PerfilFormValues } from '@/lib/types'

export interface ResultadoAcao {
  erro?: string
}

// Campos opcionais vazios ("") não podem virar string vazia no banco — a api
// valida url/hex quando o campo É enviado, então campo vazio vira "ausente".
function limparValores(valores: PerfilFormValues) {
  return {
    ...valores,
    lockupTag: valores.lockupTag || undefined,
    url: valores.url || undefined,
    telefoneContato: valores.telefoneContato || undefined,
    emailContato: valores.emailContato || undefined,
    documento: valores.documento || undefined,
    instagramUrl: valores.instagramUrl || undefined,
    linkedinUrl: valores.linkedinUrl || undefined,
    tiktokUrl: valores.tiktokUrl || undefined,
  }
}

export async function criarPerfil(valores: PerfilFormValues): Promise<ResultadoAcao> {
  let perfil: Perfil
  try {
    perfil = await serverFetch<Perfil>('/perfis', {
      method: 'POST',
      body: JSON.stringify(limparValores(valores)),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao criar o perfil' }
  }
  revalidatePath('/dashboard/perfis')
  redirect(`/dashboard/perfis/${perfil.id}`)
}

export async function atualizarPerfil(id: string, valores: PerfilFormValues): Promise<ResultadoAcao> {
  try {
    await serverFetch<Perfil>(`/perfis/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(limparValores(valores)),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao salvar o perfil' }
  }
  revalidatePath('/dashboard/perfis')
  revalidatePath(`/dashboard/perfis/${id}`)
  return {}
}

export type CampoAssetMarca = 'logoColorUrl' | 'logoBrancoUrl' | 'iconeColorUrl' | 'iconeBrancoUrl'

// Logo/ícone não têm mais campo próprio no formulário do Perfil — vêm só da
// pasta "Logo" da Galeria (avatar do header, ou o painel de papéis de
// marca dentro da própria pasta). PATCH parcial, sem passar pelos outros
// campos do formulário nem pelo `limparValores` (que converteria "" pra
// "ausente" — aqui "" é a forma de LIMPAR o campo de propósito).
export async function atualizarAssetMarca(perfilId: string, campo: CampoAssetMarca, url: string): Promise<ResultadoAcao> {
  try {
    await serverFetch<Perfil>(`/perfis/${perfilId}`, {
      method: 'PATCH',
      body: JSON.stringify({ [campo]: url }),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao atualizar o asset' }
  }
  revalidatePath('/dashboard/perfis')
  revalidatePath(`/dashboard/perfis/${perfilId}`)
  revalidatePath(`/dashboard/perfis/${perfilId}/galeria`)
  return {}
}
