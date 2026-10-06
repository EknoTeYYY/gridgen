// Conjuntos de fonte curados do BrandKit — um por Perfil. Cada conjunto é um
// par "fonte de título | fonte de texto" do Google Fonts, embutido no worker
// de render (render/assets/fonts) e testado nos layouts antes de entrar aqui.
// Upload de fonte própria fica fora: licença e pesos faltando (o motor usa
// 600/700/800 no título e 400–700 no texto) quebram a peça sem aviso.
export const FONTES_CURADAS = [
  { id: 'poppins-inter', titulo: 'Poppins', texto: 'Inter' },
  { id: 'montserrat-opensans', titulo: 'Montserrat', texto: 'Open Sans' },
  { id: 'playfair-sourcesans', titulo: 'Playfair Display', texto: 'Source Sans 3' },
  { id: 'fraunces-manrope', titulo: 'Fraunces', texto: 'Manrope' },
  { id: 'sora-dmsans', titulo: 'Sora', texto: 'DM Sans' },
  { id: 'nunito-nunito', titulo: 'Nunito', texto: 'Nunito' },
  { id: 'merriweather-merriweathersans', titulo: 'Merriweather', texto: 'Merriweather Sans' },
] as const

export type ConjuntoFonte = (typeof FONTES_CURADAS)[number]['id']

export const CONJUNTOS_FONTE = FONTES_CURADAS.map((f) => f.id) as [ConjuntoFonte, ...ConjuntoFonte[]]

export const FONTE_PADRAO: ConjuntoFonte = 'poppins-inter'

export function fonteCurada(id: string | null | undefined): (typeof FONTES_CURADAS)[number] {
  return FONTES_CURADAS.find((f) => f.id === id) ?? FONTES_CURADAS[0]
}
