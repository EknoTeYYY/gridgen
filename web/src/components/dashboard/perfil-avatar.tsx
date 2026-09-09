import type { Perfil } from '@/lib/types'
import { cn } from '@/lib/utils'

// Círculo de identificação do Perfil, usado no header, na lista da sidebar e
// na grade de Perfis. Mostra o ícone de verdade (BrandKit) assim que o
// usuário sobe um — até lá, cai pro gradiente com as cores da marca.
export function PerfilAvatar({
  perfil,
  className,
}: {
  perfil: Pick<Perfil, 'nome' | 'corPrimaria' | 'corSecundaria' | 'iconeColorUrl' | 'iconeBrancoUrl'>
  className?: string
}) {
  const icone = perfil.iconeColorUrl || perfil.iconeBrancoUrl
  if (icone) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icone}
        alt={perfil.nome}
        className={cn('shrink-0 rounded-full bg-muted object-cover ring-1 ring-border', className)}
      />
    )
  }
  return (
    <span
      className={cn('inline-block shrink-0 rounded-full ring-1 ring-border', className)}
      style={{ background: `linear-gradient(135deg, ${perfil.corPrimaria}, ${perfil.corSecundaria})` }}
    />
  )
}
