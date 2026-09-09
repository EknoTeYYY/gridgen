import type { Layout } from './post.js'

// Quantas composições visuais alternativas cada combinação (layout, é capa?)
// tem hoje implementadas no motor de render (`render/src/engine.ts`) — cresce
// conforme mais variantes são construídas e validadas visualmente. Um layout
// fora daqui (ou o valor 1) tem só a variante 0, a composição original.
//
// Capa (slide 0, geralmente com `full:true`) e uso interno do mesmo layout
// são registros separados porque são sistemas visuais diferentes na prática
// (a capa é full-bleed/ocupa o slide inteiro; o uso interno convive com
// cabeçalho/rodapé) — variante 2 da capa não tem relação nenhuma com
// variante 2 do uso interno do mesmo layout.
export const VARIANTES_CAPA: Partial<Record<Layout, number>> = {
  photo: 4,
}

export const VARIANTES_INTERNA: Partial<Record<Layout, number>> = {
  photo: 4,
  split: 4,
  word: 4,
  item: 4,
  list: 4,
  bottom: 4,
  cta: 4,
}

export function sortearVariante(mapa: Partial<Record<Layout, number>>, layout: Layout): number {
  const total = mapa[layout] ?? 1
  return Math.floor(Math.random() * total)
}
