'use client'

import { Building2, Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const ITENS = [
  { href: '/admin', label: 'Contas', icon: Building2 },
  { href: '/admin/leads', label: 'Leads', icon: Mail },
]

export function AdminSidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex shrink-0 flex-col gap-1 text-sm">
      {ITENS.map((item) => {
        const ativo = pathname === item.href
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
          </Link>
        )
      })}
    </nav>
  )
}
