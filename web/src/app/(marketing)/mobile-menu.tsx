'use client'

import Link from 'next/link'
import { LogIn, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LINKS = [
  { href: '/como-funciona', label: 'Como funciona' },
  { href: '/recursos', label: 'Recursos' },
  { href: '/feito-para', label: 'Feito para' },
  { href: '/planos', label: 'Planos' },
]

// Abaixo de `sm` os links do topo (e os dropdowns de Recursos/Feito para)
// somem por falta de espaço — sem este menu, no celular só dava pra chegar
// nessas páginas pelo rodapé. "Entrar" também vem pra cá nessa largura, pra
// sobrar espaço pro CTA principal.
export function MobileSiteMenu() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex size-9 items-center justify-center rounded-md text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:hidden">
        <Menu className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12} className="w-56">
        {LINKS.map((link) => (
          <DropdownMenuItem key={link.href} asChild className="py-2 text-[15px]">
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="py-2 text-[15px]">
          <Link href="/login">
            <LogIn />
            Entrar
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
