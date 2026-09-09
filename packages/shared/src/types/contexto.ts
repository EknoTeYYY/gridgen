export interface SecaoContexto {
  titulo: string
  // Por que essa pergunta importa — usado tanto pra guiar o tom da IA na
  // entrevista quanto pra explicar pro usuário, na tela, o motivo de cada
  // seção existir (a pessoa preencher só "produtos e serviços" e deixar o
  // resto em aberto era o problema real: sem saber pra que serve, ninguém
  // prioriza responder).
  porque: string
}

// As 5 seções que o contexto de marca precisa cobrir pra gerar conteúdo com
// personalidade de verdade — ordem pensada pra ir do concreto (o que a
// empresa vende) pro mais abstrato (como ela fala), não a ordem alfabética
// nem a ordem que aparece no markdown final.
export const SECOES_CONTEXTO: SecaoContexto[] = [
  {
    titulo: 'Produtos e serviços',
    porque: 'entra na abertura e na oferta dos posts — pra falar do que a marca realmente vende, sem genérico.',
  },
  {
    titulo: 'Público-alvo',
    porque: 'define a linguagem certa pra quem vai ler — o mesmo produto se explica diferente pra públicos diferentes.',
  },
  {
    titulo: 'Diferenciais',
    porque: 'aparece nos posts de prova e comparação, pra mostrar o que a marca faz de diferente da concorrência.',
  },
  {
    titulo: 'Tom de voz',
    porque: 'decide se os textos saem formais, descontraídos, técnicos — sem isso a IA chuta um tom genérico.',
  },
  {
    titulo: 'Voz da marca',
    porque: 'é a personalidade que aparece em todo texto gerado, do jeito que só essa marca fala.',
  },
]

// Heurística simples: acha o heading da seção (# / ## / ###) e mede o corpo
// de texto até o próximo heading. Corpo curto demais (ou heading ausente) ==
// seção ainda não coberta de verdade. Limiar arbitrário, mas suficiente pra
// guiar a IA sobre o que perguntar em seguida — não é validação rígida.
const LIMIAR_PREENCHIDO = 20

// A IA às vezes escreve um placeholder tipo "(ainda não informado)" no corpo
// de uma seção vazia — isso sozinho já passa do LIMIAR_PREENCHIDO em
// caracteres, fazendo a seção parecer preenchida quando não está. Descartado
// antes de medir o tamanho do corpo (o prompt também instrui a IA a usar só
// "—" nesse caso, mas isso aqui cobre qualquer variação de frase).
const REGEX_PLACEHOLDER_VAZIO = /^[-—\s]*$|n[ãa]o\s+informad|ainda\s+n[ãa]o|sem\s+informa[çc][ãa]o|a\s+definir/i

function escapeRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function secaoPreenchida(markdown: string, titulo: string): boolean {
  const regexHeading = new RegExp(`^#{1,3}\\s*${escapeRegex(titulo)}\\s*$`, 'im')
  const match = regexHeading.exec(markdown)
  if (!match) return false

  const restoAposHeading = markdown.slice(match.index + match[0].length)
  const proximoHeading = restoAposHeading.search(/^#{1,3}\s/m)
  const corpo = (proximoHeading === -1 ? restoAposHeading : restoAposHeading.slice(0, proximoHeading)).trim()
  if (REGEX_PLACEHOLDER_VAZIO.test(corpo)) return false
  return corpo.length >= LIMIAR_PREENCHIDO
}

export function secoesPendentes(markdown: string): string[] {
  return SECOES_CONTEXTO.filter((secao) => !secaoPreenchida(markdown, secao.titulo)).map((secao) => secao.titulo)
}
