import { NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { Post } from '@/lib/types'

// Ponte pro client-side poller: um Client Component não consegue ler o
// cookie httpOnly nem montar o header Authorization sozinho — essa rota faz
// isso no servidor e devolve JSON puro pro fetch() do navegador.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const post = await serverFetch<Post>(`/posts/${id}`)
    return NextResponse.json(post)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const post = await serverFetch<Post>(`/posts/${id}`, { method: 'PATCH', body: await request.text() })
    return NextResponse.json(post)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
