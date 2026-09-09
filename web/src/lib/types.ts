// Shape retornado pela api (modelo Perfil do Prisma, serializado em JSON).
export interface Perfil {
  id: string
  contaId: string
  nome: string
  tipo: 'empresa' | 'pessoal'
  slug: string
  status: string
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  corTexto: string
  fonte: string
  logoColorUrl: string | null
  logoBrancoUrl: string | null
  iconeColorUrl: string | null
  iconeBrancoUrl: string | null
  lockupTag: string | null
  url: string | null
  temaPadrao: 'ink' | 'brand' | 'light' | 'paper'
  telefoneContato: string | null
  emailContato: string | null
  documento: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  tiktokUrl: string | null
  createdAt: string
  updatedAt: string
}

export type PostStatus = 'rascunho' | 'gerando' | 'pronto' | 'erro'

export interface RenderJob {
  id: string
  status: 'pendente' | 'processando' | 'concluido' | 'erro'
  erroMsg: string | null
  createdAt: string
  finishedAt: string | null
}

export interface SaidaEntrega {
  id: string
  canal: 'instagram' | 'linkedin' | 'tiktok'
  status: 'pendente' | 'enviado' | 'erro' | 'indisponivel'
  refExterna: string | null
  agendadoPara: string | null
  publicadoEm: string | null
  caption: string | null
  hashtags: string | null
  slides: import('@studio/shared').Slide[] | null
  imagemStatus: 'pendente' | 'processando' | 'concluido' | 'erro'
  arquivos: string[]
  createdAt: string
}

export interface Post {
  id: string
  perfilId: string
  tipo: 'ancora' | 'dor' | 'prova' | 'didatico' | 'dado' | 'oferta'
  formato: 'feed' | 'square' | 'story'
  slug: string
  caption: string
  hashtags: string
  slides: import('@studio/shared').Slide[]
  estiloVisual: 'padrao' | 'tweet'
  status: PostStatus
  origem: 'adhoc' | 'agenda'
  campanhaSlug: string | null
  campanhaNome: string | null
  campanhaData: string | null
  agendadoPara: string | null
  avisoAgendamentoEnviadoEm: string | null
  createdAt: string
  updatedAt: string
  renderJobs?: RenderJob[]
  saidas?: SaidaEntrega[]
  arquivos?: string[]
  perfil?: { id: string; nome: string }
}

export interface DataPersonalizada {
  id: string
  perfilId: string
  nome: string
  mes: number
  dia: number
  tipoSugerido: Post['tipo']
  ativa: boolean
  createdAt: string
}

export interface GaleriaItem {
  id: string
  perfilId: string
  pasta: string
  nome: string | null
  url: string
  createdAt: string
}

export interface GaleriaPasta {
  id: string
  perfilId: string
  nome: string
  createdAt: string
}

export interface MensagemContexto {
  id: string
  role: 'user' | 'assistant'
  conteudo: string
  createdAt: string
}

export interface ContextoPerfil {
  conteudoMarkdown: string
  mensagens: MensagemContexto[]
}

export interface RespostaContexto {
  resposta: string
  markdown: string
}

export type StatusConvite = 'pendente' | 'aceito' | 'expirado' | 'revogado'

export interface ContaComStatus {
  id: string
  nome: string
  slug: string
  plano: string
  status: 'ativa' | 'inativa'
  createdAt: string
  totalUsuarios: number
  totalPerfis: number
  statusConvite: StatusConvite | null
  conviteEmail: string | null
}

export interface ConviteInfo {
  email: string
  contaNome: string
}

export interface LeadContato {
  id: string
  nome: string
  email: string
  empresa: string | null
  telefone: string | null
  mensagem: string | null
  createdAt: string
}

export interface PerfilFormValues {
  nome: string
  tipo: 'empresa' | 'pessoal'
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  corTexto: string
  temaPadrao: 'ink' | 'brand' | 'light' | 'paper'
  lockupTag: string
  url: string
  telefoneContato: string
  emailContato: string
  documento: string
  instagramUrl: string
  linkedinUrl: string
  tiktokUrl: string
}
