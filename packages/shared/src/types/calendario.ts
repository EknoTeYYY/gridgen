import type { TipoConteudo } from './post.js'

// Quantos dias antes da data o rascunho é gerado automaticamente — usado
// tanto pelo agendador (api) quanto pela tela de calendário (web, pra avisar
// o usuário quando ainda não chegou a hora de um evento ter post).
export const ANTECEDENCIA_DIAS = 5

export interface DataComemorativa {
  slug: string
  nome: string
  tipoSugerido: TipoConteudo
  calcular: (ano: number) => { mes: number; dia: number }
}

function fixa(mes: number, dia: number) {
  return () => ({ mes, dia })
}

// diaSemana: 0=domingo...6=sábado. ordinal: 1=primeiro, 2=segundo...
function nesimoDiaDaSemana(ano: number, mes: number, diaSemana: number, ordinal: number): number {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1))
  const offset = (diaSemana - primeiro.getUTCDay() + 7) % 7
  return 1 + offset + (ordinal - 1) * 7
}

function ultimoDiaDaSemana(ano: number, mes: number, diaSemana: number): number {
  const ultimoDiaDoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  const ultimo = new Date(Date.UTC(ano, mes - 1, ultimoDiaDoMes))
  const offset = (ultimo.getUTCDay() - diaSemana + 7) % 7
  return ultimoDiaDoMes - offset
}

// Datas comerciais comuns no Brasil, curadas pelo produto — compartilhadas
// entre todos os Perfis. Datas móveis (2º domingo, última sexta) calculadas
// por ano; Páscoa (base lunar) fica de fora do v1 por complexidade.
export const CALENDARIO_SAZONAL: DataComemorativa[] = [
  { slug: 'ano-novo', nome: 'Ano Novo', tipoSugerido: 'ancora', calcular: fixa(1, 1) },
  { slug: 'dia-da-mulher', nome: 'Dia Internacional da Mulher', tipoSugerido: 'oferta', calcular: fixa(3, 8) },
  {
    slug: 'dia-das-maes',
    nome: 'Dia das Mães',
    tipoSugerido: 'oferta',
    calcular: (ano) => ({ mes: 5, dia: nesimoDiaDaSemana(ano, 5, 0, 2) }),
  },
  { slug: 'dia-dos-namorados', nome: 'Dia dos Namorados', tipoSugerido: 'oferta', calcular: fixa(6, 12) },
  {
    slug: 'dia-dos-pais',
    nome: 'Dia dos Pais',
    tipoSugerido: 'oferta',
    calcular: (ano) => ({ mes: 8, dia: nesimoDiaDaSemana(ano, 8, 0, 2) }),
  },
  { slug: 'dia-do-cliente', nome: 'Dia do Cliente', tipoSugerido: 'prova', calcular: fixa(9, 15) },
  { slug: 'dia-das-criancas', nome: 'Dia das Crianças', tipoSugerido: 'oferta', calcular: fixa(10, 12) },
  { slug: 'dia-do-professor', nome: 'Dia do Professor', tipoSugerido: 'prova', calcular: fixa(10, 15) },
  {
    slug: 'black-friday',
    nome: 'Black Friday',
    tipoSugerido: 'oferta',
    calcular: (ano) => ({ mes: 11, dia: ultimoDiaDaSemana(ano, 11, 5) }),
  },
  { slug: 'natal', nome: 'Natal', tipoSugerido: 'oferta', calcular: fixa(12, 25) },
]

function inicioDoDiaUTC(data: Date): Date {
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()))
}

// Acha a próxima ocorrência (este ano se ainda não passou, senão o ano que
// vem) de uma data recorrente anual a partir de hoje.
export function proximaOcorrencia(calcular: (ano: number) => { mes: number; dia: number }, hoje: Date): Date {
  const hojeUTC = inicioDoDiaUTC(hoje)
  const anoAtual = hojeUTC.getUTCFullYear()
  const desteAno = calcular(anoAtual)
  const dataDesteAno = new Date(Date.UTC(anoAtual, desteAno.mes - 1, desteAno.dia))
  if (dataDesteAno >= hojeUTC) return dataDesteAno

  const proximoAno = calcular(anoAtual + 1)
  return new Date(Date.UTC(anoAtual + 1, proximoAno.mes - 1, proximoAno.dia))
}

export function diferencaEmDias(hoje: Date, data: Date): number {
  const MS_POR_DIA = 24 * 60 * 60 * 1000
  return Math.round((inicioDoDiaUTC(data).getTime() - inicioDoDiaUTC(hoje).getTime()) / MS_POR_DIA)
}
