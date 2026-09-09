import { NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const resultado = await serverFetch(`/posts/${id}/gerar`, { method: 'POST' })
    return NextResponse.json(resultado)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
