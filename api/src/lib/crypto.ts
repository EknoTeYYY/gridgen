// Cifra em repouso o refresh token do Google (e qualquer outro segredo de
// terceiro que precisarmos guardar no futuro) — AES-256-GCM com chave própria,
// não a mesma coisa que hash de senha (aqui precisamos decifrar de volta).
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { env } from '../env.js'

function chave(): Buffer {
  if (!env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY não configurada — defina no .env pra cifrar tokens de integração em repouso.')
  }
  const buf = Buffer.from(env.ENCRYPTION_KEY, 'hex')
  if (buf.length !== 32) {
    throw new Error('ENCRYPTION_KEY precisa ter 32 bytes em hex (gere com: openssl rand -hex 32)')
  }
  return buf
}

const IV_LENGTH = 12 // padrão recomendado pro GCM

export function cifrar(texto: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', chave(), iv)
  const cifrado = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, cifrado]).toString('base64')
}

export function decifrar(valor: string): string {
  const dados = Buffer.from(valor, 'base64')
  const iv = dados.subarray(0, IV_LENGTH)
  const tag = dados.subarray(IV_LENGTH, IV_LENGTH + 16)
  const cifrado = dados.subarray(IV_LENGTH + 16)
  const decipher = createDecipheriv('aes-256-gcm', chave(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString('utf8')
}
