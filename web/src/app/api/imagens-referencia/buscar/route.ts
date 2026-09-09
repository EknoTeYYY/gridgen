import { NextRequest, NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  try {
    const dados = await serverFetch(`/imagens-referencia/buscar?q=${encodeURIComponent(q)}`)
    return NextResponse.json(dados)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
