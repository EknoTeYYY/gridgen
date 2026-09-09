import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE } from '@/lib/session'

// "/" entra aqui também: quem já está logado não deveria ver a landing page,
// só quem visita anônimo (é a raiz do route group de marketing agora).
const ROTAS_REDIRECIONAM_SE_LOGADO = ['/', '/login']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (token && ROTAS_REDIRECIONAM_SE_LOGADO.includes(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
