import { NextResponse } from 'next/server'
import { API_URL, setSessionCookies } from '@/lib/session'

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await request.json()

  const res = await fetch(`${API_URL}/auth/convite/${token}/aceitar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()

  if (!res.ok) return NextResponse.json(data, { status: res.status })

  const response = NextResponse.json({ user: data.user })
  setSessionCookies(response, { accessToken: data.accessToken, refreshToken: data.refreshToken })
  return response
}
