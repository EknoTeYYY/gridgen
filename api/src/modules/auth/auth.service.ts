import bcrypt from 'bcryptjs'
import type { PrismaClient } from '@prisma/client'
import { assinarAccessToken } from '../../plugins/auth.js'
import { env } from '../../env.js'
import { gerarTokenOpaco, hashToken } from '../../lib/token.js'

const SALT_ROUNDS = 12

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS)
}

export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}

export interface SessaoTokens {
  accessToken: string
  refreshToken: string
}

export async function emitirSessao(
  prisma: PrismaClient,
  userId: string,
  contaId: string,
  isSuperAdmin: boolean,
): Promise<SessaoTokens> {
  const accessToken = assinarAccessToken({ sub: userId, contaId, isSuperAdmin })
  const refreshToken = gerarTokenOpaco()
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(refreshToken), expiresAt },
  })

  return { accessToken, refreshToken }
}

export async function rotacionarSessao(prisma: PrismaClient, refreshToken: string): Promise<SessaoTokens> {
  const tokenHash = hashToken(refreshToken)
  const registro = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { conta: true } } },
  })

  if (!registro || registro.revokedAt || registro.expiresAt < new Date()) {
    throw new Error('refresh token inválido, expirado ou revogado')
  }
  if (registro.user.conta.status === 'inativa') {
    throw new Error('conta inativa')
  }

  // Rotação: o token usado é revogado e um novo par é emitido — reuso do
  // mesmo refresh token (ex. roubado e reaproveitado) fica detectável depois,
  // porque o token antigo já não valida mais.
  await prisma.refreshToken.update({ where: { id: registro.id }, data: { revokedAt: new Date() } })

  return emitirSessao(prisma, registro.userId, registro.user.contaId, registro.user.isSuperAdmin)
}

export async function revogarSessao(prisma: PrismaClient, refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken)
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
