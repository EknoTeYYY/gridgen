import {
  BellRing,
  CalendarDays,
  FolderOpen,
  ImageIcon,
  Layers,
  MessageSquareText,
  Palette,
  Shuffle,
  Wand2,
  type LucideIcon,
} from 'lucide-react'

export interface RecursoDetalhado {
  slug: string
  icon: LucideIcon
  titulo: string
  resumo: string
  detalhe: string
  pontos: string[]
}

export const RECURSOS: RecursoDetalhado[] = [
  {
    slug: 'perfis',
    icon: Layers,
    titulo: 'Um Perfil por marca',
    resumo: 'Uma conta gerencia quantos Perfis (marcas ou clientes) forem necessários, cada um isolado dos outros.',
    detalhe:
      'Cada Perfil guarda seu próprio BrandKit, contexto de marca, posts e calendário. Uma agência com 12 clientes ativos é 12 Perfis dentro da mesma conta, sem misturar conteúdo, identidade visual ou histórico de um cliente com o de outro.',
    pontos: [
      'BrandKit próprio por Perfil: cores, fonte e logo',
      'Posts, calendário e aprovações isolados por Perfil',
      'Sem limite artificial de quantos Perfis uma conta pode ter',
    ],
  },
  {
    slug: 'marca',
    icon: Palette,
    titulo: 'Sempre na marca certa',
    resumo: 'O motor de render aplica cores, fonte e logo de cada Perfil automaticamente.',
    detalhe:
      'O motor lê o BrandKit do Perfil e aplica a identidade visual em cada slide gerado, sem depender de um designer revisando manualmente. O mesmo conteúdo, gerado pra dois Perfis diferentes, sai com a cara de cada marca sozinho.',
    pontos: [
      'Tema visual (claro, escuro, marca ou papel) por post',
      'Logo colorida ou branca aplicada conforme o tema',
      'Sem arquivo de template pra manter atualizado manualmente',
    ],
  },
  {
    slug: 'contexto',
    icon: MessageSquareText,
    titulo: 'Contexto por conversa',
    resumo: 'Conte sobre a marca numa conversa. A IA constrói e mantém o contexto sozinha.',
    detalhe:
      'Em vez de preencher um formulário técnico, você conversa sobre a marca: o que ela vende, pra quem, como fala. Essa conversa vira um contexto persistente que orienta toda geração de conteúdo depois, sem precisar reexplicar do zero a cada post.',
    pontos: [
      'Chat de contexto por Perfil, não por post',
      'Contexto guardado em markdown, revisável a qualquer momento',
      'Atualiza aos poucos, sem apagar o que já foi definido antes',
    ],
  },
  {
    slug: 'ia',
    icon: Wand2,
    titulo: 'Geração assistida por IA',
    resumo: 'Escolha o tipo de conteúdo e deixe a IA escrever. Você revisa antes de gerar as imagens.',
    detalhe:
      'Cada tipo de conteúdo (dor, prova, didático, dado, oferta, âncora) tem sua própria receita de estrutura, seguida pela IA ao escrever a partir do contexto da marca. O rascunho sempre passa por revisão antes das imagens finais serem geradas.',
    pontos: [
      'Seis tipos de conteúdo, cada um com sua própria receita',
      'Revisão e edição do texto antes de gerar as imagens',
      'Upload de foto própria ou busca de imagem de referência, no slide',
    ],
  },
  {
    slug: 'imagens',
    icon: ImageIcon,
    titulo: 'A IA escolhe a foto certa sozinha',
    resumo: 'Pra cada slide que precisa de imagem, a própria IA decide o que buscar, sem você precisar fazer nada.',
    detalhe:
      'Enquanto escreve o texto, a IA já decide que tipo de imagem combina com cada slide e busca sozinha: primeiro na sua Galeria (se tiver algo com nome parecido), senão num banco de imagens profissional. Na prática, a maioria dos slides já chega com uma foto relevante, sem nenhum clique extra. Quando quiser trocar, buscar outra ou subir uma foto própria continua sendo um clique de distância.',
    pontos: [
      'Busca automática por slide, decidida pela própria IA',
      'Prioriza sua Galeria antes de cair no banco de imagens',
      'Trocar, buscar de novo ou subir uma foto própria continua manual quando quiser',
    ],
  },
  {
    slug: 'galeria',
    icon: FolderOpen,
    titulo: 'Sua própria biblioteca de imagens',
    resumo: 'Organize fotos de produto, referências e a marca em pastas, dentro do próprio Perfil.',
    detalhe:
      'Cada Perfil tem uma Galeria própria, organizada em pastas livres (Produtos, Referências, Eventos, ou qualquer nome que fizer sentido). Arraste uma imagem pra dentro de uma pasta e ela já fica disponível como fonte de foto na hora de gerar um post — antes do banco de imagens externo, e sem precisar subir o mesmo arquivo de novo a cada post. A logo e o ícone da marca também vivem lá, como mais uma pasta.',
    pontos: [
      'Pastas livres, criadas conforme a necessidade',
      'Arrastar e soltar pra enviar, direto do computador',
      'Primeira fonte de imagem consultada na geração automática por IA',
    ],
  },
  {
    slug: 'variacao-visual',
    icon: Shuffle,
    titulo: 'Nunca a mesma cara duas vezes',
    resumo: 'Cada post sai com uma composição visual diferente, sem perder a identidade da marca.',
    detalhe:
      'O motor de render guarda várias composições visuais possíveis pra cada elemento do carrossel (capa, listas, números, blocos de texto) e sorteia uma a cada post gerado. A marca continua sempre a mesma (cor, fonte, logo), mas o layout varia sozinho de um post pro outro — sem parecer que saiu do mesmo template toda vez.',
    pontos: [
      'Várias composições por elemento, sorteadas a cada geração',
      'Identidade visual da marca nunca muda, só a disposição em tela',
      'Sem esforço extra: acontece sozinho em toda geração',
    ],
  },
  {
    slug: 'calendario',
    icon: CalendarDays,
    titulo: 'Calendário sazonal automático',
    resumo: 'Datas comerciais comuns e datas próprias da marca geram rascunho sozinhas, com antecedência.',
    detalhe:
      'Um calendário curado com datas comerciais comuns roda junto com datas próprias de cada Perfil, como aniversário da empresa. Alguns dias antes de cada ocorrência, um rascunho é gerado automaticamente. Você só revisa e aprova.',
    pontos: [
      'Datas comerciais curadas mais datas próprias por Perfil',
      'Rascunho gerado com antecedência, sem precisar lembrar',
      'Falha na geração vira alerta em Aprovações, não passa batido',
    ],
  },
  {
    slug: 'aprovacoes',
    icon: BellRing,
    titulo: 'Aprovações centralizadas',
    resumo: 'Tudo que está pronto pra revisar, gerado na hora ou pelo calendário, aparece num único lugar.',
    detalhe:
      'Post pronto pra revisar, não importa de qual Perfil veio, aparece numa única tela. Um contador na barra lateral avisa quando tem algo esperando, pra nada passar batido no meio da correria do dia a dia.',
    pontos: [
      'Uma tela só, cruzando todos os Perfis da conta',
      'Contador de pendências sempre visível',
      'Post com falha de geração aparece marcado, não some sozinho',
    ],
  },
]
