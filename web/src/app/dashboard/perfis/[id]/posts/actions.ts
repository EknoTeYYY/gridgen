'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Formato, TipoConteudo } from '@studio/shared'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { Post } from '@/lib/types'

export interface ResultadoAcao {
  erro?: string
}

export async function gerarPostComIA(
  perfilId: string,
  valores: {
    tipo: TipoConteudo
    formato: Formato
    nome?: string
    briefing?: string
    redes?: ('linkedin' | 'tiktok')[]
    estilo?: 'padrao' | 'tweet'
    fundoClaro?: boolean
  },
): Promise<ResultadoAcao> {
  let post: Post
  try {
    post = await serverFetch<Post>(`/perfis/${perfilId}/posts/gerar-ia`, {
      method: 'POST',
      body: JSON.stringify(valores),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao gerar o post com IA' }
  }
  // Post recém-criado nasce em rascunho — vai direto pra página cheia de
  // edição (formulário por slide), que continua sendo o lugar certo pra
  // revisar antes de gerar. Só um post PRONTO precisa ir pra modal — isso
  // acontece em `post-status.tsx`, quando a geração termina.
  redirect(`/dashboard/perfis/${perfilId}/posts/${post.id}`)
}

export async function excluirPost(perfilId: string, postId: string): Promise<ResultadoAcao> {
  try {
    await serverFetch(`/posts/${postId}`, { method: 'DELETE' })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao excluir o post' }
  }
  revalidatePath(`/dashboard/perfis/${perfilId}/posts`)
  return {}
}
