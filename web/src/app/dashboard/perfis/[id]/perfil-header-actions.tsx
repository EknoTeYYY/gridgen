'use client'

import { Eye, Pencil } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'

export function PerfilHeaderActions({ perfilId }: { perfilId: string }) {
  const pathname = usePathname()
  const emEdicao = pathname === `/dashboard/perfis/${perfilId}/editar`

  if (emEdicao) {
    return (
      <Link href={`/dashboard/perfis/${perfilId}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        <Eye />
        Ver perfil
      </Link>
    )
  }

  return (
    <Link href={`/dashboard/perfis/${perfilId}/editar`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
      <Pencil />
      Editar
    </Link>
  )
}
