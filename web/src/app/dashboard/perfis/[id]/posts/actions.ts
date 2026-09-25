'use server'

import { revalidatePath } from 'next/cache'
import type { EstiloVisual, Formato, MetodoConversao, TipoConteudo } from '@gridgen/shared'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { Post } from '@/lib/types'

export interface ResultadoAcao {
  erro?: string
}

export interface ResultadoGerarPost extends ResultadoAcao {
  postId?: string
  status?: Post['status']
}

export async function gerarPostComIA(
  perfilId: string,
  valores: {
    tipo: TipoConteudo
    formato: Formato
    nome?: string
    briefing?: string
    redes?: ('linkedin' | 'tiktok')[]
    estilo?: EstiloVisual
    fundoClaro?: boolean
    metodoConversao?: MetodoConversao
    pastaReferencia?: string
  },
): Promise<ResultadoGerarPost> {
  let post: Post
  try {
    post = await serverFetch<Post>(`/perfis/${perfilId}/posts/gerar-ia`, {
      method: 'POST',
      body: JSON.stringify(valores),
    })
  } catch (err) {
    return { erro: err instanceof ServerFetchError ? err.message : 'erro inesperado ao gerar o post com IA' }
  }
  // Dispara o render na hora, antes de devolver o controle pro cliente — se
  // passar (camposFaltando ok), o post já nasce "gerando". Se falhar (raro:
  // campo vazio), fica em rascunho — o cliente (GerarComIaForm) decide o que
  // fazer com cada status, sem essa action navegar sozinha: ficar com o
  // usuário na própria tela "Novo post" durante a geração (sem flash de
  // página intermediária) é responsabilidade do componente, não da action.
  try {
    await serverFetch(`/posts/${post.id}/gerar`, { method: 'POST' })
    return { postId: post.id, status: 'gerando' }
  } catch {
    return { postId: post.id, status: 'rascunho' }
  }
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
