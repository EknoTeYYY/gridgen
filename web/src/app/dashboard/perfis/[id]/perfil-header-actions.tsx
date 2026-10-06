'use client'

import { Eye, Pencil } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'

// Slot do botão "Salvar alterações" na edição: o botão é do PerfilForm (precisa
// do estado de envio do formulário) e entra aqui via portal.
export const ID_SLOT_SALVAR = 'perfil-header-salvar'

export function PerfilHeaderActions({ perfilId }: { perfilId: string }) {
  const pathname = usePathname()
  const emEdicao = pathname === `/dashboard/perfis/${perfilId}/editar`

  if (emEdicao) {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/perfis/${perfilId}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <Eye />
          Ver perfil
        </Link>
        <div id={ID_SLOT_SALVAR} className="contents" />
      </div>
    )
  }

  return (
    <Link href={`/dashboard/perfis/${perfilId}/editar`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
      <Pencil />
      Editar
    </Link>
  )
}
