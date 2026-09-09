import jwt from 'jsonwebtoken'
import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../env.js'

export interface JwtPayload {
  sub: string
  contaId: string
  isSuperAdmin: boolean
}

declare module 'fastify' {
  interface FastifyRequest {
    usuarioAtual?: JwtPayload
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export function assinarAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'] })
}

export function verificarAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

// Segundo preHandler, usado só pelo módulo admin — roda depois de
// `authenticate` (que já populou `request.usuarioAtual`). Não é um decorator
// registrado em `app`, porque só tem um consumidor hoje; promover pra
// decorator é trivial se um segundo módulo precisar disso no futuro.
export async function requireSuperAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.usuarioAtual?.isSuperAdmin) {
    return reply.code(403).send({ erro: 'acesso restrito a administradores' })
  }
}

export default fp(async (app: FastifyInstance) => {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return reply.code(401).send({ erro: 'token ausente' })
    }
    try {
      request.usuarioAtual = verificarAccessToken(header.slice('Bearer '.length))
    } catch {
      return reply.code(401).send({ erro: 'token inválido ou expirado' })
    }
  })
})
