// Padrão de sessão espelhado do Athelium (homologado): cookie httpOnly lido
// no servidor, nunca exposto a JS do cliente. A diferença é só de transporte
// até a api: aqui viaja como `Authorization: Bearer` (a api do studio é uma
// API bearer-only comum), não como header Cookie repassado direto.
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextResponse } from 'next/server'

const API_URL = process.env.API_INTERNAL_URL || 'http://localhost:8080'

export const ACCESS_TOKEN_COOKIE = 'access_token'
export const REFRESH_TOKEN_COOKIE = 'refresh_token'
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 8 // 8 horas — acompanha JWT_ACCESS_TTL
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias — acompanha REFRESH_TOKEN_TTL_DAYS

export interface SessionUser {
  id: string
  nome: string
  email: string
  papel: string
  isSuperAdmin: boolean
  conta: { id: string; nome: string; slug: string }
}

export class ServerFetchError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

// Variante crua, sem parse de JSON — pra proxied de binário (imagens) onde o
// route handler só precisa repassar o corpo/headers da resposta da api.
export async function serverFetchRaw(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  const headers: Record<string, string> = { ...((init.headers as Record<string, string>) || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  return fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' })
}

export async function serverFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  const headers: Record<string, string> = {
    // Só declara JSON quando há corpo de verdade — Fastify rejeita
    // Content-Type: application/json com corpo vazio (ex.: POST /gerar, que
    // não precisa de payload).
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...((init.headers as Record<string, string>) || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: 'no-store' })

  if (!res.ok) {
    let detalhes: unknown = null
    try {
      detalhes = await res.json()
    } catch {
      // resposta sem corpo JSON — segue com detalhes nulo
    }
    const mensagem = (detalhes as { erro?: string } | null)?.erro || `Requisição falhou (${res.status})`
    throw new ServerFetchError(res.status, mensagem)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    return await serverFetch<SessionUser>('/me')
  } catch {
    return null
  }
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) redirect('/login')
  return user
}

export interface SessaoTokens {
  accessToken: string
  refreshToken: string
}

export function setSessionCookies(response: NextResponse, tokens: SessaoTokens) {
  const producao = process.env.NODE_ENV === 'production'
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: producao,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: producao,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
}

export { API_URL }
