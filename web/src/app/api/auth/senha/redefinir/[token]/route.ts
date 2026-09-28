import { NextResponse } from 'next/server'
import { API_URL } from '@/lib/session'

// Não abre sessão depois de redefinir: a api encerra todas as sessões do
// usuário, e a pessoa entra de novo pelo /login com a senha nova.
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await request.json()
  const res = await fetch(`${API_URL}/auth/senha/redefinir/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
