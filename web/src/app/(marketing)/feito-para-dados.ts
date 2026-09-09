import { Building2, Sprout, Zap, type LucideIcon } from 'lucide-react'

export interface PublicoDetalhado {
  slug: string
  icon: LucideIcon
  titulo: string
  resumo: string
  detalhe: string
  pontos: string[]
}

export const FEITO_PARA: PublicoDetalhado[] = [
  {
    slug: 'agencias',
    icon: Building2,
    titulo: 'Agências',
    resumo: 'Cada cliente com seu próprio Perfil, numa conta só.',
    detalhe:
      'Gerencie o conteúdo de quantos clientes precisar, cada um com seu próprio BrandKit, calendário e histórico de aprovação, sem misturar a marca de um cliente com a de outro. A mesma equipe produz pra todos, sem abrir uma conta nova a cada contrato.',
    pontos: [
      'Um Perfil por cliente, sem limite de quantos numa conta',
      'Aprovações centralizadas cruzando todos os clientes numa tela só',
      'Cada cliente com sua própria identidade visual aplicada automaticamente',
    ],
  },
  {
    slug: 'social-midias',
    icon: Zap,
    titulo: 'Social mídias e freelancers',
    resumo: 'Produza mais rápido pros clientes que já tem.',
    detalhe:
      'Quem já cuida de redes sociais sabe que o gargalo raramente é ideia, é tempo de produção. A IA escreve o rascunho a partir do contexto de cada marca, o motor de render aplica a identidade visual sozinho, e o calendário sazonal avisa de data comercial antes de você precisar correr atrás.',
    pontos: [
      'Rascunho gerado por IA, você só revisa antes de aprovar',
      'Identidade visual de cada cliente aplicada automaticamente',
      'Calendário sazonal avisa antes da data comercial passar batida',
    ],
  },
  {
    slug: 'comecando',
    icon: Sprout,
    titulo: 'Quem tá começando',
    resumo: 'Identidade visual profissional, mesmo sem Instagram ainda.',
    detalhe:
      'Não precisa de designer nem de experiência com redes sociais pra postar com uma cara profissional desde o primeiro post. Configure cor, fonte e logo uma vez, e o motor aplica isso automaticamente em cada peça gerada dali pra frente.',
    pontos: [
      'Sem precisar contratar um designer pra manter o padrão',
      'Configuração de marca feita uma vez só, aplicada sempre',
      'Comece direto pelo carrossel, story ou tweet, sem curva de aprendizado',
    ],
  },
]
