import { NextResponse } from 'next/server'
import { API_URL } from '@/lib/session'

// Repasse público (sem sessão): quem esqueceu a senha não está logado.
export async function POST(request: Request) {
  const body = await request.json()
  const res = await fetch(`${API_URL}/auth/senha/esqueci`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
