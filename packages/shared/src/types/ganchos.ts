// Banco de 50 ganchos adaptados à voz de empresa — repertório da entrega
// editorial (Ellen, GRIDGEN-ENTREGA-PARA-ERICK.md §15). Repertório de
// INSPIRAÇÃO pro prompt de geração: a IA seleciona conforme o contexto da
// marca, sem sorteio cego, sem obrigação de uso, sem repetição automática.
// Reticências indicam continuação, não suspense obrigatório. Histórias,
// erros, experimentos e resultados citados precisam ter base real no
// contexto de marca/briefing — nunca virar fato inventado só pra caber no
// molde de um gancho.
export interface CategoriaGanchos {
  nome: string
  frases: string[]
  // Nota de uso/cautela do doc — inclui os ajustes que a Ellen já fez em
  // modelos originalmente arriscados (generalização sem base, acusação,
  // diagnóstico de caso desconhecido etc.).
  uso: string
}

export const BANCO_GANCHOS: CategoriaGanchos[] = [
  {
    nome: 'Para despertar curiosidade',
    frases: [
      'Conta pra gente se estamos enganados...',
      'Nós não esperávamos isso...',
      'Tem um detalhe aqui que quase ninguém percebe...',
      'Nós achávamos que era exagero, até...',
      'Olha o que aconteceu quando nós...',
      'Isso parece uma boa ideia até você...',
      'Demoramos para entender por que...',
      'A parte mais estranha disso é...',
      'Fomos testar só para tirar a dúvida...',
      'Você também reparou que...?',
    ],
    uso: 'Abrir uma observação, descoberta ou pergunta concreta, completando o assunto já na abertura pra fazer sentido sozinho. "Quase ninguém" exige fundamento real; sem ele, adaptar para "um detalhe que vale observar". Testes e surpresas da empresa precisam corresponder a acontecimentos confirmados, nunca inventados.',
  },
  {
    nome: 'Para questionar uma certeza',
    frases: [
      'Te enganaram sobre...',
      'Nós estávamos errados sobre...',
      'Todo mundo recomenda isso. Nós paramos.',
      'Dá para fazer tudo certo e mesmo assim...',
      'Quanto mais tentávamos..., pior ficava.',
      'Isso que você chama de... pode ser...',
      'Sabemos que você gosta de..., mas...',
      'Essa dica só funciona se...',
      'O problema começa quando você...',
      'Antes de concordar com isso, olha...',
    ],
    uso: 'Esclarecer uma crença ou condição com explicação sustentada, nunca acusação, generalização ou certeza sobre o leitor. Sem evidência de engano, preferir "Vale esclarecer uma coisa sobre...". Evitar "todo mundo" sem base (alternativa: "Essa recomendação aparece com frequência. Nós escolhemos outro caminho", só com as duas partes sustentadas). Quando a preferência do público não estiver confirmada, usar "Se você gosta de..., vale considerar...". Distinguir erro verificável de gosto/escolha legítima — sem diminuir o leitor ou concorrentes.',
  },
  {
    nome: 'Para gerar identificação',
    frases: [
      'Se você já passou por isso, vai entender...',
      'Só quem já tentou... sabe...',
      'Você começa com entusiasmo e, de repente...',
      'Tem uma coisa em... que dá uma preguiça...',
      'Nós também tínhamos vergonha de...',
      'Você faz tudo e ainda sente que...',
      'Sabe quando você... e ninguém percebe?',
      'Achávamos que isso só acontecia com a gente...',
      'A pior parte de... nem é...',
      'Se você está começando agora, vale saber disso...',
    ],
    uso: 'Situações reconhecíveis do público, adaptando gênero e vocabulário ao contexto real. Histórias de vergonha/vulnerabilidade dependem de vivência real, nunca fabricada. Evitar presumir sentimentos universais do leitor.',
  },
  {
    nome: 'Para mostrar um caminho',
    frases: [
      'Troque isso por isso...',
      'Se começássemos hoje, faríamos isso primeiro...',
      'Antes de gastar com..., tente...',
      'Dá para resolver isso sem...',
      'A primeira coisa que mudaríamos no seu... é...',
      'Pegue esse exemplo e adapte para o seu...',
      'Quando acontecer..., faça isso aqui.',
      'Em vez de começar por..., comece por...',
      'Três coisas para conferir antes de...',
      'Vamos te mostrar com um exemplo...',
    ],
    uso: 'Orientação prática com explicação, aplicação e limites claros. Uma hipótese condicional ("se começássemos") precisa ficar explicitamente condicional, nunca virar uma história inventada. Não presumir diagnóstico de um caso desconhecido (alternativa: "A primeira coisa que vale observar no seu..."). Números citados numa lista precisam bater com o conteúdo de verdade — "três coisas" não determina três telas nem a extensão do carrossel.',
  },
  {
    nome: 'Para contar o que aconteceu',
    frases: [
      'O nosso maior erro foi...',
      'Gostaríamos de ter sabido disso antes...',
      'Nós quase desistimos quando...',
      'Fizemos isso por [período real] e...',
      'O conselho que ignoramos por tempo demais...',
      'Achávamos que ia dar errado. Aí...',
      'Isso nos poupou [tempo comprovado] de...',
      'Foi só quando paramos de... que...',
      'A primeira vez que tentamos foi assim...',
      'Nos arrependemos de ter demorado tanto para...',
    ],
    uso: 'Só pra histórias CONFIRMADAS da empresa — nunca inferir erro, arrependimento ou resultado a partir do setor/nicho em geral. "Maior" precisa fazer sentido no relato real (senão, usar "Um aprendizado que tivemos..."). Períodos/tempos entre colchetes são placeholders de documentação, nunca números fictícios — só preencher com dado real confirmado.',
  },
]

// Padrões de abertura banidos (doc §9: "evitar '5 dicas para', 'Como fazer'
// e 'Tudo que você precisa saber' como resposta automática") — recorte
// específico do assunto sempre vale mais que a fórmula genérica de lista.
export const GANCHOS_PROIBIDOS = ['5 dicas para', 'como fazer', 'tudo que você precisa saber']
