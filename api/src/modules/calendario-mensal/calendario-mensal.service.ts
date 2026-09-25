import type { FastifyInstance } from 'fastify'
import type Anthropic from '@anthropic-ai/sdk'
import { CALENDARIO_SAZONAL, diaSeOcorreNoMes, type Formato, type TipoConteudo } from '@gridgen/shared'
import { getClaude } from '../../lib/claude.js'
import { env } from '../../env.js'
import { removerTravessoes } from '../geracao/geracao.service.js'

const TIPOS_VALIDOS = ['educativo', 'conexao', 'prova_social', 'produtos_servicos', 'interativo'] as const
const FORMATOS_VALIDOS = ['feed', 'square', 'story'] as const

interface PautaGerada {
  assunto: string
  abordagem: string
  publico: string
  objetivo: string
  motivoEscolha: string
  tipo: TipoConteudo
  formato: Formato
  dia: number
  horario: string
  direcaoVisual: string
  acaoDesejada: string
  origemInformacao: string
  dependencias?: string
  alternativa?: string
  ocasiao?: string
}

interface PropostaGerada {
  frequenciaJustificativa: string
  pautas: PautaGerada[]
}

// Doc editorial §6: a IA propõe o MÊS INTEIRO numa chamada só (não uma pauta
// de cada vez) — é o que permite ela conferir repetição de argumento/gancho/
// CTA entre as pautas, coisa que N chamadas isoladas não conseguem enxergar.
function montarFerramentaCalendarioMensal(): Anthropic.Tool {
  return {
    name: 'propor_calendario_mensal',
    description: 'Propõe o calendário de conteúdo do mês inteiro: frequência recomendada com justificativa, mais uma pauta por publicação planejada.',
    input_schema: {
      type: 'object',
      properties: {
        frequenciaJustificativa: {
          type: 'string',
          description:
            'Frequência recomendada (ex.: "3x por semana") com o motivo. Sem dado real de desempenho, deixe explícito que é uma hipótese inicial ("hipótese inicial, sem dado de desempenho ainda") — nunca apresente como "melhor horário comprovado".',
        },
        pautas: {
          type: 'array',
          description: 'Uma pauta por publicação planejada no mês. Não gere pautas demais só pra preencher um número redondo — cada uma precisa acrescentar algo real. Não é obrigatório usar os 5 tipos nem segui-los em ordem fixa.',
          items: {
            type: 'object',
            properties: {
              assunto: { type: 'string', description: 'Assunto específico dessa pauta — nunca repita o mesmo assunto de outra pauta do mês.' },
              abordagem: { type: 'string', description: 'Como esse assunto vai ser tratado (ângulo, gancho geral) — varie o gancho entre as pautas do mês, não repita o mesmo tipo de abertura.' },
              publico: { type: 'string', description: 'Recorte de público que essa pauta fala diretamente.' },
              objetivo: { type: 'string', description: 'O que essa publicação busca de verdade (ex.: gerar reconhecimento, tirar uma dúvida recorrente, gerar pedido).' },
              motivoEscolha: { type: 'string', description: 'Por que esse assunto/tipo faz sentido AGORA pra essa empresa especificamente, não em geral.' },
              tipo: { type: 'string', enum: [...TIPOS_VALIDOS], description: 'Tipo de conteúdo desta pauta.' },
              formato: { type: 'string', enum: [...FORMATOS_VALIDOS], description: 'Formato — o tipo "interativo" só pode usar "story".' },
              dia: { type: 'number', description: 'Dia do mês (1 a 31, respeitando o tamanho real do mês informado no pedido).' },
              horario: { type: 'string', description: 'Horário sugerido, formato HH:MM em 24h.' },
              direcaoVisual: { type: 'string', description: 'Direção visual em 1 frase (ex.: "foto real do produto em uso, ambiente claro") — é uma intenção pro time de arte, não o layout final.' },
              acaoDesejada: { type: 'string', description: 'Ação esperada de quem vê (ex.: comentar, chamar no WhatsApp, salvar o post).' },
              origemInformacao: {
                type: 'string',
                description:
                  'De onde essa pauta vem de verdade: cite a data comemorativa curada pelo nome, o trecho do contexto de marca que a embasa, ou diga explicitamente "hipótese editorial — sem pesquisa de tendência em tempo real disponível". NUNCA descreva uma pesquisa que não foi feita.',
              },
              dependencias: { type: 'string', description: 'Opcional. O que precisa existir antes de produzir (ex.: "depende de foto do produto X na Galeria").' },
              alternativa: { type: 'string', description: 'Opcional. Um plano B se a dependência não se resolver a tempo.' },
              ocasiao: { type: 'string', description: 'Opcional — preencha só se esta pauta pertence a uma campanha/ocasião sazonal (ex.: "Black Friday"); várias pautas podem compartilhar a mesma ocasião.' },
            },
            required: ['assunto', 'abordagem', 'publico', 'objetivo', 'motivoEscolha', 'tipo', 'formato', 'dia', 'horario', 'direcaoVisual', 'acaoDesejada', 'origemInformacao'],
          },
        },
      },
      required: ['frequenciaJustificativa', 'pautas'],
    },
  }
}

export class PropostaJaAprovadaError extends Error {}

export async function gerarPropostaMensal(app: FastifyInstance, perfilId: string, ano: number, mes: number): Promise<{ propostaId: string }> {
  const existente = await app.prisma.propostaCalendario.findUnique({
    where: { perfilId_mesReferencia: { perfilId, mesReferencia: new Date(Date.UTC(ano, mes - 1, 1)) } },
  })
  if (existente?.status === 'aprovado') {
    throw new PropostaJaAprovadaError('já existe uma proposta aprovada pra este mês — peça a troca de uma pauta específica em vez de regenerar o mês inteiro')
  }

  const contexto = await app.prisma.contextoMarkdown.findUnique({ where: { perfilId } })

  const datasSazonaisDoMes = CALENDARIO_SAZONAL.map((d) => ({ nome: d.nome, tipoSugerido: d.tipoSugerido, dia: diaSeOcorreNoMes(d.calcular, ano, mes) })).filter(
    (d): d is { nome: string; tipoSugerido: TipoConteudo; dia: number } => d.dia !== null,
  )
  const datasPersonalizadasDoMes = await app.prisma.dataPersonalizada.findMany({ where: { perfilId, mes, ativa: true } })

  const mesAnteriorRef = new Date(Date.UTC(mes === 1 ? ano - 1 : ano, mes === 1 ? 11 : mes - 2, 1))
  const propostaAnterior = await app.prisma.propostaCalendario.findFirst({
    where: { perfilId, mesReferencia: mesAnteriorRef, status: 'aprovado' },
    include: { pautas: true },
  })

  const ultimoDiaDoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, mes - 1, 1)))

  const prompt = [
    `Proponha o calendário de conteúdo de ${nomeMes} de ${ano} inteiro (o mês tem ${ultimoDiaDoMes} dias, considere isso pro campo "dia").`,
    datasSazonaisDoMes.length > 0
      ? `Datas comemorativas curadas que caem neste mês: ${datasSazonaisDoMes.map((d) => `${d.nome} (dia ${d.dia}, tipo sugerido "${d.tipoSugerido}")`).join('; ')}. Selecione normalmente até 2 pra virar campanha — uma 3ª só com justificativa excepcional no motivo da pauta. Zero ou uma também são escolhas válidas; não force todas a virarem pauta.`
      : 'Nenhuma data comemorativa curada cai neste mês.',
    datasPersonalizadasDoMes.length > 0
      ? `Datas personalizadas deste perfil neste mês: ${datasPersonalizadasDoMes.map((d) => `${d.nome} (dia ${d.dia})`).join('; ')}.`
      : null,
    propostaAnterior
      ? `O mês anterior já teve um calendário aprovado com estes assuntos: ${propostaAnterior.pautas.map((p) => p.assunto).join('; ')}. Não repita os mesmos assuntos nem os mesmos ganchos de abertura.`
      : null,
    'Fora das datas acima, use assuntos recorrentes do contexto de marca abaixo como base — não existe pesquisa de tendência em tempo real disponível nesta versão; nunca descreva uma pesquisa que não foi feita, registre a limitação no campo de origem de cada pauta quando for o caso.',
    'Regras gerais: sem ranking fixo de tipo nem obrigação de usar os 5 tipos no mês. Não gere várias pautas do mesmo assunto só pra preencher um número redondo. Confira repetição de argumento, gancho e CTA entre as pautas — cada uma precisa se ler diferente das outras, e variar tipo/formato ao longo do mês. O tipo "interativo" só pode ter formato "story".',
  ]
    .filter(Boolean)
    .join('\n')

  const system = `Você monta o planejamento editorial mensal de conteúdo de uma empresa que usa o Gridgen, considerando o contexto de marca abaixo.\n\n## Contexto da marca\n${contexto?.conteudoMarkdown || '(nenhum contexto registrado ainda pra este Perfil — proponha de forma genérica, mas profissional, e deixe isso explícito na origem de cada pauta)'}`

  const claude = getClaude()
  const ferramenta = montarFerramentaCalendarioMensal()
  const resposta = await claude.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 8000,
    system,
    messages: [{ role: 'user', content: prompt }],
    tools: [ferramenta],
    tool_choice: { type: 'tool', name: ferramenta.name },
  })

  const chamada = resposta.content.find((bloco) => bloco.type === 'tool_use')
  if (!chamada || chamada.type !== 'tool_use') {
    throw new Error(`Claude não retornou a ferramenta "${ferramenta.name}" esperada`)
  }
  const dados = chamada.input as PropostaGerada
  if (!Array.isArray(dados.pautas) || dados.pautas.length === 0) {
    throw new Error('A IA não devolveu nenhuma pauta pro mês')
  }

  if (existente) await app.prisma.propostaCalendario.delete({ where: { id: existente.id } }) // cascade apaga as pautas antigas

  const pautasValidas = dados.pautas.map((p) => {
    const dia = Math.min(Math.max(1, Math.round(p.dia) || 1), ultimoDiaDoMes)
    const [horaStr, minStr] = String(p.horario ?? '09:00').split(':')
    const hora = Math.min(23, Math.max(0, parseInt(horaStr, 10) || 9))
    const minuto = Math.min(59, Math.max(0, parseInt(minStr, 10) || 0))
    const tipo = TIPOS_VALIDOS.includes(p.tipo) ? p.tipo : 'produtos_servicos'
    const formato = tipo === 'interativo' ? ('story' as const) : FORMATOS_VALIDOS.includes(p.formato) ? p.formato : 'feed'
    return {
      assunto: removerTravessoes(p.assunto),
      abordagem: removerTravessoes(p.abordagem),
      publico: removerTravessoes(p.publico),
      objetivo: removerTravessoes(p.objetivo),
      motivoEscolha: removerTravessoes(p.motivoEscolha),
      tipo,
      formato,
      dataHorario: new Date(Date.UTC(ano, mes - 1, dia, hora, minuto)),
      direcaoVisual: removerTravessoes(p.direcaoVisual),
      acaoDesejada: removerTravessoes(p.acaoDesejada),
      origemInformacao: removerTravessoes(p.origemInformacao),
      dependencias: p.dependencias ? removerTravessoes(p.dependencias) : null,
      alternativa: p.alternativa ? removerTravessoes(p.alternativa) : null,
      ocasiao: p.ocasiao ? removerTravessoes(p.ocasiao) : null,
    }
  })

  const proposta = await app.prisma.propostaCalendario.create({
    data: {
      perfilId,
      mesReferencia: new Date(Date.UTC(ano, mes - 1, 1)),
      status: 'rascunho',
      frequenciaJustificativa: removerTravessoes(dados.frequenciaJustificativa),
      totalPautas: pautasValidas.length,
      pautas: { create: pautasValidas },
    },
  })

  return { propostaId: proposta.id }
}

export async function aprovarPropostaMensal(app: FastifyInstance, propostaId: string): Promise<void> {
  await app.prisma.propostaCalendario.update({
    where: { id: propostaId },
    data: { status: 'aprovado', aprovadoEm: new Date() },
  })
}
