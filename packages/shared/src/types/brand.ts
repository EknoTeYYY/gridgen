import type { Tema } from './post.js'

/**
 * Substitui o antigo `brand.mjs` hardcoded: cada Perfil carrega o seu.
 * Fontes vêm de um conjunto curado (campo `fonte`) — upload livre de fonte
 * arbitrária fica fora do v1.
 */
export interface BrandKit {
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  corTexto: string
  fonte: 'poppins-inter'
  logoColorUrl?: string | null
  logoBrancoUrl?: string | null
  iconeColorUrl?: string | null
  iconeBrancoUrl?: string | null
  lockupTag?: string | null
  url?: string | null
  temaPadrao: Tema
  // Usados só pelo layout `tweet` (nome + @ mostrados no card) — o resto do
  // motor nunca lê esses dois campos.
  nome?: string
  instagramHandle?: string | null
}

export const BRAND_KIT_PADRAO: BrandKit = {
  corPrimaria: '#8b5cf6',
  corSecundaria: '#3b82f6',
  corFundo: '#0b0a14',
  corTexto: '#f1effa',
  fonte: 'poppins-inter',
  logoColorUrl: null,
  logoBrancoUrl: null,
  iconeColorUrl: null,
  iconeBrancoUrl: null,
  lockupTag: null,
  url: null,
  temaPadrao: 'ink',
  nome: 'Marca',
  instagramHandle: '@marca',
}
