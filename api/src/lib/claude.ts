import Anthropic from '@anthropic-ai/sdk'
import { env } from '../env.js'

let cliente: Anthropic | null = null

// Lazy: só exige a env var quando alguma feature de IA é de fato chamada —
// o resto da api (auth, perfis, posts/render) funciona sem ANTHROPIC_API_KEY.
export function getClaude(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada — defina no .env pra usar chat de contexto/geração via IA.')
  }
  if (!cliente) cliente = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  return cliente
}
