import { Instagram, Linkedin } from 'lucide-react'
import { SiTiktok } from 'react-icons/si'
import { REDE_NOME, type RedeSocial } from '@studio/shared'
import type { SaidaEntrega } from '@/lib/types'
import { cn } from '@/lib/utils'

export type { RedeSocial }

// Lucide não tem um ícone de marca pro TikTok (só Instagram/LinkedIn) — o
// logo de verdade vem do Simple Icons via react-icons, não um ícone genérico.
export const REDE_ICON: Record<RedeSocial, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: SiTiktok,
}

export const REDE_LABEL = REDE_NOME

function ehRedeSocial(canal: string): canal is RedeSocial {
  return canal === 'instagram' || canal === 'linkedin' || canal === 'tiktok'
}

// Ordem fixa, nunca por ordem de criação/clique — sem isso, marcar/desmarcar
// rede reordenava a lista toda hora (achado real do usuário testando os
// toggles: "a opção das abas mudam de acordo com a ordem que eu clico").
const ORDEM_REDES: RedeSocial[] = ['instagram', 'linkedin', 'tiktok']

export function redesDoPost(saidas: SaidaEntrega[] | undefined): RedeSocial[] {
  if (!saidas) return []
  const presentes = new Set(saidas.map((s) => s.canal).filter(ehRedeSocial))
  return ORDEM_REDES.filter((r) => presentes.has(r))
}

// Instagram é sempre uma aba disponível (nunca depende de `SaidaEntrega`,
// que ele nunca tem — ver bloqueio em `POST/DELETE .../canais/instagram`).
export function redesParaAbas(saidas: SaidaEntrega[] | undefined): RedeSocial[] {
  return ['instagram', ...redesDoPost(saidas).filter((r) => r !== 'instagram')]
}

// Resolve qual aba está de fato ativa: a escolhida, se ainda existir na
// lista, senão cai pro Instagram (sempre presente). Usado tanto por
// `RedesPublicacao` quanto pela tela que a envolve — a tela precisa saber
// qual rede está ativa pra decidir o que mostrar ao lado (ex.: o formulário
// de edição do Instagram só faz sentido quando a aba Instagram é a ativa).
export function redeAtivaResolvida(saidas: SaidaEntrega[] | undefined, redeAtiva: RedeSocial | null): RedeSocial {
  const abas = redesParaAbas(saidas)
  return redeAtiva && abas.includes(redeAtiva) ? redeAtiva : 'instagram'
}

// Ícone pequeno por rede — usado em qualquer lugar que mostre "pra onde esse
// post vai" (grid de posts, calendário, tela do post) sem repetir o mapa de
// ícone/label em cada tela.
export function RedesSociaisIcons({
  saidas,
  className,
  tamanho = 'size-3',
}: {
  saidas: SaidaEntrega[] | undefined
  className?: string
  tamanho?: string
}) {
  const redes = redesDoPost(saidas)
  if (redes.length === 0) return null

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {redes.map((rede) => {
        const Icon = REDE_ICON[rede]
        return <Icon key={rede} className={cn(tamanho, 'shrink-0 text-muted-foreground')} aria-label={REDE_LABEL[rede]} />
      })}
    </div>
  )
}
