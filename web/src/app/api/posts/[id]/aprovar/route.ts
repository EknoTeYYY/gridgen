import { NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { Post } from '@/lib/types'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const post = await serverFetch<Post>(`/posts/${id}/aprovar`, { method: 'POST' })
    return NextResponse.json(post)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
