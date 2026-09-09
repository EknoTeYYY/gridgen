import { createHash, randomBytes } from 'node:crypto'

// Token opaco de alta entropia (48 bytes aleatórios) — usado tanto pra
// refresh token de sessão quanto pra convite de Conta. Não precisa de hash
// lento/salgado como senha, só de não ficar em texto plano no banco: SHA-256
// dá lookup determinístico por índice único, O(1).
export function gerarTokenOpaco(): string {
  return randomBytes(48).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
