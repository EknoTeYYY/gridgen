import type Anthropic from '@anthropic-ai/sdk'
import { SECOES_CONTEXTO, secoesPendentes } from '@gridgen/shared'
import { getClaude } from '../../lib/claude.js'
import { env } from '../../env.js'

// Antes disso, a entrevista era 100% aberta ("conte sobre a marca") — na
// prática as pessoas travam na primeira vez e só respondem o que vem à
// cabeça (o próprio dono do produto, na primeira tentativa, só preencheu
// "produtos e serviços" e deixou o resto em branco). Virou uma entrevista
// guiada: uma pergunta focada de cada vez, sempre sobre a próxima seção
// ainda vazia, sempre explicando o motivo real da pergunta — não decoração,
// é a mesma razão que orienta `SECOES_CONTEXTO.porque`.
const SYSTEM_PROMPT = `Você conduz uma entrevista guiada pra construir o "contexto de marca" de um cliente dentro de uma ferramenta de geração de conteúdo pra redes sociais. Esse documento é o que a IA de geração de post lê pra escrever com a personalidade certa — sem ele, o conteúdo sai genérico.

O documento tem exatamente 5 seções, cada uma servindo um propósito concreto na geração de conteúdo:
${SECOES_CONTEXTO.map((s) => `- ${s.titulo}: ${s.porque}`).join('\n')}

Regras da entrevista:
1. Uma pergunta concreta por vez — nunca várias perguntas na mesma mensagem, nunca liste "próxima pergunta:" nem numere.
2. Ao começar a perguntar sobre uma seção nova (a pessoa ainda não falou nada relevante sobre ela), explique brevemente e com suas próprias palavras — em 1 frase curta, natural, sem soar decorado — por que essa informação importa pra qualidade do conteúdo gerado. Use a razão real de cada seção (acima) como base, não invente outra.
3. Se a resposta da pessoa pra uma seção for vaga, genérica ou clichê — sem nenhum detalhe concreto que um post pudesse usar de verdade (ex.: "atendemos bem", "qualidade é nosso diferencial", "público variado") — NÃO considere a seção coberta ainda: faça um follow-up pedindo um exemplo, número ou motivo específico. Isso vale mesmo que a seção já não apareça mais como pendente no "Estado da entrevista" abaixo (aquele cálculo é só um sinal automático, não uma trava — o julgamento de "vago" é seu, olhando a conversa de verdade). No máximo 2 follow-ups por seção, mesmo que a resposta continue vaga — depois disso, aceite o que tiver e siga em frente (melhor um contexto imperfeito do que travar a pessoa numa seção só).
4. Enquanto ainda estiver aprofundando a MESMA seção que a pessoa já começou a responder (por concretude, regra 3, ou porque ela mesma emendou mais detalhe), não repita a explicação do "porquê" — só continue a conversa naturalmente.
5. Fora dos casos das regras 3 e 4, sempre pergunte sobre a próxima seção que a mensagem do sistema apontar como pendente. Nunca pergunte de novo sobre uma seção já bem coberta e concreta.
6. Quando todas as 5 seções estiverem bem cobertas (com conteúdo concreto, não só presente), avise que o contexto está completo, resuma em 1 frase o que já foi registrado, e deixe claro que dá pra complementar ou ajustar qualquer parte a qualquer momento — a partir daí a conversa vira aberta, sem forçar novas perguntas.

A cada mensagem da pessoa, você:
1. Responde de forma breve e natural, seguindo as regras acima.
2. Atualiza o documento em markdown com tudo que já foi entendido até agora, organizado exatamente nas 5 seções acima (nessa ordem). Só preenche o que já foi dito de verdade — não invente informação. Seção sem nenhuma informação ainda vai com "—" como corpo (nada de frases tipo "ainda não informado").

Você DEVE chamar a ferramenta "atualizar_contexto" em toda resposta.`

const FERRAMENTA_ATUALIZAR_CONTEXTO: Anthropic.Tool = {
  name: 'atualizar_contexto',
  description: 'Registra a resposta da conversa e o documento de contexto de marca atualizado.',
  input_schema: {
    type: 'object',
    properties: {
      resposta: {
        type: 'string',
        description: 'Resposta breve e natural pro usuário, continuando a entrevista.',
      },
      markdown: {
        type: 'string',
        description: 'Documento de contexto completo e atualizado, em markdown, com as seções conhecidas até agora.',
      },
    },
    required: ['resposta', 'markdown'],
  },
}

export interface MensagemHistorico {
  role: 'user' | 'assistant'
  content: string
}

export interface ResultadoContexto {
  resposta: string
  markdown: string
}

export async function conversarSobreContexto(
  markdownAtual: string,
  historico: MensagemHistorico[],
  novaMensagem: string,
): Promise<ResultadoContexto> {
  const claude = getClaude()

  const mensagens: Anthropic.MessageParam[] = [
    ...historico.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: novaMensagem },
  ]

  const pendentes = secoesPendentes(markdownAtual)
  const linhaPendentes =
    pendentes.length > 0
      ? `Seções ainda pendentes, nesta ordem de prioridade: ${pendentes.join(', ')}. Pergunte sobre "${pendentes[0]}" agora, a menos que a última mensagem da pessoa já esteja no meio de responder outra seção pendente — nesse caso, continue aprofundando essa.`
      : 'Todas as 5 seções já estão bem cobertas — modo aberto, sem forçar novas perguntas (a menos que a pessoa peça pra revisar algo).'

  const resposta = await claude.messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 2000,
    system: `${SYSTEM_PROMPT}\n\n## Contexto atual (markdown)\n${markdownAtual || '(vazio — esta é a primeira conversa com este Perfil)'}\n\n## Estado da entrevista\n${linhaPendentes}`,
    messages: mensagens,
    tools: [FERRAMENTA_ATUALIZAR_CONTEXTO],
    tool_choice: { type: 'tool', name: 'atualizar_contexto' },
  })

  const chamada = resposta.content.find((bloco) => bloco.type === 'tool_use')
  if (!chamada || chamada.type !== 'tool_use') {
    throw new Error('Claude não retornou a ferramenta "atualizar_contexto" esperada')
  }

  const entrada = chamada.input as { resposta?: unknown; markdown?: unknown }
  if (typeof entrada.resposta !== 'string' || typeof entrada.markdown !== 'string') {
    throw new Error('Resposta da IA em formato inesperado (campos resposta/markdown ausentes)')
  }

  return { resposta: entrada.resposta, markdown: entrada.markdown }
}
