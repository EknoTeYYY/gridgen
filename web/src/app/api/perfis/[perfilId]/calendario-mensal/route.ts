import { NextResponse } from 'next/server'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { PropostaCalendario } from '@/lib/types'

// Ponte pro client-side: a navegação por mês do card "Proposta do mês" (Visão
// Geral) chamava a Server Action `buscarPropostaMensal` — mas invocar QUALQUER
// Server Action a partir de uma página força o Next a rebuscar o RSC da
// página inteira, visível como a tela toda piscando a cada clique nas setas
// (fica bem mais notável agora que o card vive na Visão Geral, cercado de
// outros cards que também re-renderizam). Uma rota-ponte comum é só um fetch
// HTTP igual qualquer outro, sem esse efeito colateral.
export async function GET(request: Request, { params }: { params: Promise<{ perfilId: string }> }) {
  const { perfilId } = await params
  const { searchParams } = new URL(request.url)
  const ano = searchParams.get('ano')
  const mes = searchParams.get('mes')
  if (!ano || !mes) return NextResponse.json({ erro: 'informe ano e mes na query' }, { status: 400 })

  try {
    const proposta = await serverFetch<PropostaCalendario | null>(`/perfis/${perfilId}/calendario-mensal?ano=${ano}&mes=${mes}`)
    return NextResponse.json(proposta)
  } catch (err) {
    if (err instanceof ServerFetchError) return NextResponse.json({ erro: err.message }, { status: err.status })
    throw err
  }
}
