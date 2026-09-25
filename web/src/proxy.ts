import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE } from '@/lib/session'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  // Rota protegida sem NENHUM token → login (barato, evita render à toa).
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // NÃO redirecionamos "/" e "/login" pro dashboard por PRESENÇA do cookie: o
  // cookie access_token vive 8h, mas o JWT dentro dele pode já estar vencido/
  // inválido. Um token presente-mas-inválido entrava em loop com a validação
  // real do servidor (requireSession/getSession): /login → /dashboard → (401)
  // → /login → ... O redirect "já logado → dashboard" agora vive nas próprias
  // páginas / e /login, via getSession (que VALIDA o token no /me).
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
