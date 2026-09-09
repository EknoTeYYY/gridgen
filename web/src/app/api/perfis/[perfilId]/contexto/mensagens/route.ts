import { NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { RespostaContexto } from '@/lib/types'

export async function POST(request: Request, { params }: { params: Promise<{ perfilId: string }> }) {
  const { perfilId } = await params
  const body = await request.json()

  try {
    const resultado = await serverFetch<RespostaContexto>(`/perfis/${perfilId}/contexto/mensagens`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(resultado)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
