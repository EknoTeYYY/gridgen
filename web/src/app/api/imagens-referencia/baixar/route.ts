import { NextRequest, NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url') ?? ''
  try {
    const dados = await serverFetch(`/imagens-referencia/baixar?url=${encodeURIComponent(url)}`)
    return NextResponse.json(dados)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
