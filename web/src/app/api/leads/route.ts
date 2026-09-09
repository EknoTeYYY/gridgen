import { NextResponse } from 'next/server'
import { API_URL } from '@/lib/session'

// Rota pública de propósito — quem preenche o formulário de contato da LP
// ainda não tem sessão nem cookie (mesmo padrão do bridge de aceitar convite).
export async function POST(request: Request) {
  const body = await request.json()

  const res = await fetch(`${API_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()

  return NextResponse.json(data, { status: res.status })
}
