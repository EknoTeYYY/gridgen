'use client'

import { BellRing, Users2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function SidebarNav({ pendentesCount = 0 }: { pendentesCount?: number }) {
  const pathname = usePathname()

  const itens = [
    { href: '/dashboard/perfis', label: 'Perfis', icon: Users2 },
    { href: '/dashboard/aprovacoes', label: 'Aprovações', icon: BellRing, badge: pendentesCount },
  ]

  return (
    <nav className="flex shrink-0 flex-col gap-1 text-sm">
      {itens.map((item) => {
        const ativo = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 font-medium transition-colors',
              ativo
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {Boolean(item.badge) && (
              <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 tabular-nums">{item.badge}</Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
