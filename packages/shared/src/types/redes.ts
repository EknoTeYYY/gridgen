export type RedeSocial = 'instagram' | 'linkedin' | 'tiktok'

export interface LimiteHashtag {
  min: number
  max: number
}

// Cada rede converte melhor com uma quantidade diferente de hashtag — passar
// disso tende a parecer spam (Instagram) ou pesar contra o post no algoritmo
// (LinkedIn). Usado tanto no prompt de geração quanto pra mostrar a faixa
// esperada na tela.
export const LIMITES_HASHTAG_POR_REDE: Record<RedeSocial, LimiteHashtag> = {
  instagram: { min: 4, max: 5 },
  linkedin: { min: 3, max: 5 },
  tiktok: { min: 3, max: 5 },
}

export const REDE_NOME: Record<RedeSocial, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
}

// Cada rede tem um formato de legenda que de fato funciona nela — sem essa
// instrução explícita, a IA tende a repetir o mesmo formato curto de
// Instagram em qualquer rede (confirmado na prática: o LinkedIn saía
// indistinguível do Instagram). Instagram é o formato de referência do
// produto: curto, direto, focado em venda. TikTok segue a mesma linha. O
// LinkedIn é o único que precisa de um tratamento realmente diferente.
export const ESTILO_LEGENDA_POR_REDE: Record<RedeSocial, string> = {
  instagram:
    'Curta e direta, com gancho forte na primeira linha e foco em venda/ação. Poucas frases, sem parágrafos longos — é o formato de referência do produto.',
  linkedin:
    'Texto longo e explicativo, tom profissional e consultivo — nada de gancho de venda direta nem linguagem de Instagram. Desenvolva o raciocínio em vários parágrafos curtos (uma ideia por parágrafo, com linha em branco entre eles), como um post de LinkedIn de verdade. Termine com uma reflexão ou pergunta pro leitor, não uma chamada de venda.',
  tiktok:
    'Curta e direta, no mesmo espírito do Instagram — gancho forte na primeira linha, linguagem informal, foco em prender atenção rápido.',
}
