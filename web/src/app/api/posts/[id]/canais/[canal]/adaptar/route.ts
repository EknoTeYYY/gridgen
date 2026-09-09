import { NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { SaidaEntrega } from '@/lib/types'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string; canal: string }> }) {
  const { id, canal } = await params
  try {
    const saida = await serverFetch<SaidaEntrega>(`/posts/${id}/canais/${canal}/adaptar`, { method: 'POST' })
    return NextResponse.json(saida)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
