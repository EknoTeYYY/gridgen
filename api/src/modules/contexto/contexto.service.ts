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
const CANAIS_CONVERSAO = ['ligacao', 'whatsapp', 'whatsapp_bio', 'lp', 'cardapio_bio'] as const

const SYSTEM_PROMPT = `Você conduz uma entrevista guiada pra construir o "contexto de marca" de um cliente dentro de uma ferramenta de geração de conteúdo pra redes sociais. Esse documento é o que a IA de geração de post lê pra escrever com a personalidade certa — sem ele, o conteúdo sai genérico.

O documento tem exatamente 5 seções, cada uma servindo um propósito concreto na geração de conteúdo:
${SECOES_CONTEXTO.map((s) => `- ${s.titulo}: ${s.porque}`).join('\n')}

Além das 5 seções, você também precisa descobrir o CANAL DE CONVERSÃO real do negócio: como os pedidos/contatos chegam de verdade — ligação, WhatsApp (número direto), WhatsApp só acessível pela bio do Instagram, site, ou cardápio acessível pela bio. Isso vira o destino de verdade usado no convite final de cada post gerado; sem confirmar, a ferramenta cai num texto genérico.

Regras da entrevista:
1. Uma pergunta concreta por vez — nunca várias perguntas na mesma mensagem, nunca liste "próxima pergunta:" nem numere.
2. Ao começar a perguntar sobre uma seção nova (a pessoa ainda não falou nada relevante sobre ela), explique brevemente e com suas próprias palavras — em 1 frase curta, natural, sem soar decorado — por que essa informação importa pra qualidade do conteúdo gerado. Use a razão real de cada seção (acima) como base, não invente outra.
3. Se a resposta da pessoa pra uma seção for vaga, genérica ou clichê — sem nenhum detalhe concreto que um post pudesse usar de verdade (ex.: "atendemos bem", "qualidade é nosso diferencial", "público variado") — NÃO considere a seção coberta ainda: faça um follow-up pedindo um exemplo, número ou motivo específico. Isso vale mesmo que a seção já não apareça mais como pendente no "Estado da entrevista" abaixo (aquele cálculo é só um sinal automático, não uma trava — o julgamento de "vago" é seu, olhando a conversa de verdade). No máximo 2 follow-ups por seção, mesmo que a resposta continue vaga — depois disso, aceite o que tiver e siga em frente (melhor um contexto imperfeito do que travar a pessoa numa seção só).
4. Enquanto ainda estiver aprofundando a MESMA seção que a pessoa já começou a responder (por concretude, regra 3, ou porque ela mesma emendou mais detalhe), não repita a explicação do "porquê" — só continue a conversa naturalmente.
5. Fora dos casos das regras 3 e 4, sempre pergunte sobre a próxima seção (ou o canal de conversão) que a mensagem do sistema apontar como pendente. Nunca pergunte de novo sobre algo já bem coberto e concreto.
6. Quando todas as 5 seções estiverem bem cobertas (com conteúdo concreto, não só presente), avise que o contexto está completo, resuma em 1 frase o que já foi registrado, e deixe claro que dá pra complementar ou ajustar qualquer parte a qualquer momento — a partir daí a conversa vira aberta, sem forçar novas perguntas. O canal de conversão pode ficar pra depois disso se ainda não tiver saído naturalmente.
7. Sobre o canal de conversão especificamente: pergunte como o cliente prefere ser procurado de verdade, sempre pedindo o número com DDD (ligação/WhatsApp direto) ou a URL exata (site) — nunca presuma que um telefone recebe WhatsApp, pergunte isso explicitamente se não estiver claro. Assim que o canal E o destino (quando aplicável) estiverem confirmados, preencha "canalConversaoTipo"/"canalConversaoDestino" na ferramenta; enquanto não estiver confirmado, deixe os dois de fora da resposta. Pergunte só uma vez — se a pessoa já confirmou antes, não pergunte de novo.

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
      canalConversaoTipo: {
        type: 'string',
        enum: [...CANAIS_CONVERSAO],
        description:
          'Preencha SÓ quando o canal de conversão real já estiver confirmado nesta conversa: "ligacao", "whatsapp" (número direto), "whatsapp_bio" (só pela bio), "lp" (site) ou "cardapio_bio" (cardápio pela bio).',
      },
      canalConversaoDestino: {
        type: 'string',
        description:
          'O número com DDD ("ligacao"/"whatsapp") ou a URL ("lp") confirmados — só preencha junto com canalConversaoTipo. Deixe de fora pra "whatsapp_bio"/"cardapio_bio" (o destino real é a própria bio do Instagram, fora do controle desta ferramenta).',
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
  // Só preenchidos quando a IA confirma o canal de conversão nesta troca —
  // `contexto.routes.ts` persiste isso no Perfil quando presente.
  canalConversaoTipo?: string
  canalConversaoDestino?: string
}

export async function conversarSobreContexto(
  markdownAtual: string,
  historico: MensagemHistorico[],
  novaMensagem: string,
  canalJaConfirmado: boolean,
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
  const linhaCanal = canalJaConfirmado
    ? 'Canal de conversão já confirmado anteriormente — não pergunte de novo, a menos que a pessoa peça pra corrigir.'
    : 'Canal de conversão AINDA não confirmado — inclua essa pergunta em algum ponto da entrevista (não precisa ser a primeira nem interromper uma seção em andamento).'

  const resposta = await claude.messages.create({
    model: env.ANTHROPIC_MODEL,
    // O campo `markdown` da tool é o documento de contexto INTEIRO, que cresce a
    // cada troca — com 2000 tokens o JSON da tool truncava no meio do markdown
    // assim que as 5 seções enchiam (campos ausentes -> 502 intermitente). 8000
    // dá folga larga; a geração para sozinha no end_turn bem antes disso.
    max_tokens: 8000,
    system: `${SYSTEM_PROMPT}\n\n## Contexto atual (markdown)\n${markdownAtual || '(vazio — esta é a primeira conversa com este Perfil)'}\n\n## Estado da entrevista\n${linhaPendentes}\n${linhaCanal}`,
    messages: mensagens,
    tools: [FERRAMENTA_ATUALIZAR_CONTEXTO],
    tool_choice: { type: 'tool', name: 'atualizar_contexto' },
  })

  const chamada = resposta.content.find((bloco) => bloco.type === 'tool_use')
  if (!chamada || chamada.type !== 'tool_use') {
    throw new Error('Claude não retornou a ferramenta "atualizar_contexto" esperada')
  }

  const entrada = chamada.input as {
    resposta?: unknown
    markdown?: unknown
    canalConversaoTipo?: unknown
    canalConversaoDestino?: unknown
  }
  if (typeof entrada.resposta !== 'string' || typeof entrada.markdown !== 'string') {
    throw new Error('Resposta da IA em formato inesperado (campos resposta/markdown ausentes)')
  }

  return {
    resposta: entrada.resposta,
    markdown: entrada.markdown,
    canalConversaoTipo: typeof entrada.canalConversaoTipo === 'string' ? entrada.canalConversaoTipo : undefined,
    canalConversaoDestino: typeof entrada.canalConversaoDestino === 'string' ? entrada.canalConversaoDestino.trim() : undefined,
  }
}
