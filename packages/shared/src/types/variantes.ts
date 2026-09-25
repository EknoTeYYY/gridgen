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
  photo: 5,
}

// `split`/`item` saíram daqui: o motor de render convergiu os dois pra uma
// composição única (título + texto, sem número em tela) depois que o usuário
// rejeitou toda tentativa de marcador numérico — sem número, não sobra
// diferença visual nenhuma pra sortear entre variantes.
export const VARIANTES_INTERNA: Partial<Record<Layout, number>> = {
  photo: 4,
  word: 4,
  list: 4,
  bottom: 4,
  cta: 4,
}

export function sortearVariante(mapa: Partial<Record<Layout, number>>, layout: Layout): number {
  const total = mapa[layout] ?? 1
  return Math.floor(Math.random() * total)
}
