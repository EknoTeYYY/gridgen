'use client'

import { CalendarDays, FileText, Images, LayoutGrid, MessagesSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function PerfilTabsNav({ perfilId }: { perfilId: string }) {
  const pathname = usePathname()
  const base = `/dashboard/perfis/${perfilId}`

  const abas = [
    {
      href: base,
      label: 'Visão geral',
      icon: LayoutGrid,
      ativo: pathname === base || pathname === `${base}/editar`,
    },
    {
      href: `${base}/contexto`,
      label: 'Contexto',
      icon: MessagesSquare,
      ativo: pathname.startsWith(`${base}/contexto`),
    },
    {
      href: `${base}/posts`,
      label: 'Posts',
      icon: FileText,
      ativo: pathname.startsWith(`${base}/posts`),
    },
    {
      href: `${base}/calendario`,
      label: 'Calendário',
      icon: CalendarDays,
      ativo: pathname.startsWith(`${base}/calendario`),
    },
    {
      href: `${base}/galeria`,
      label: 'Galeria',
      icon: Images,
      ativo: pathname.startsWith(`${base}/galeria`),
    },
  ]

  return (
    <div className="flex gap-1 border-b">
      {abas.map((aba) => (
        <Link
          key={aba.href}
          href={aba.href}
          className={cn(
            'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            aba.ativo
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <aba.icon className="size-4" />
          {aba.label}
        </Link>
      ))}
    </div>
  )
}
