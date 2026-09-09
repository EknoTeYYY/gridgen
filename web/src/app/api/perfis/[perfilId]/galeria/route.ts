import { NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { GaleriaItem } from '@/lib/types'

// Ponte pro client-side: o dialog de escolher imagem da Galeria (aberto a
// partir do formulário de post) roda no navegador e precisa buscar os itens
// sem conseguir ler o cookie httpOnly nem montar o header Authorization.
export async function GET(_request: Request, { params }: { params: Promise<{ perfilId: string }> }) {
  const { perfilId } = await params
  try {
    const itens = await serverFetch<GaleriaItem[]>(`/perfis/${perfilId}/galeria`)
    return NextResponse.json(itens)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
