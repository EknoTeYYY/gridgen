import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { API_URL, clearSessionCookies, REFRESH_TOKEN_COOKIE } from '@/lib/session'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {
      // best-effort: mesmo se a api não revogar, os cookies locais somem
    })
  }

  const response = NextResponse.json({ ok: true })
  clearSessionCookies(response)
  return response
}
