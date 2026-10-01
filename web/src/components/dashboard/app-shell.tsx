'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

// Casca do app logado (dashboard e admin). No desktop (>= lg) é exatamente a
// sidebar fixa de sempre ao lado do conteúdo; abaixo disso a sidebar some e
// vira um drawer aberto por um botão de menu numa barra fixa no topo — com a
// sidebar de 224px sempre visível, sobravam ~160px pro conteúdo num celular.
// O mesmo `sidebar` é renderizado nos dois lugares (o drawer só monta quando
// está aberto).
export function AppShell({
  sidebar,
  marca,
  asideClassName,
  children,
}: {
  sidebar: React.ReactNode
  // Logo/nome mostrado na barra do topo no mobile, ao lado do botão de menu.
  marca: React.ReactNode
  // Classes da sidebar no desktop (cada layout tem as suas).
  asideClassName: string
  children: React.ReactNode
}) {
  const [aberto, setAberto] = useState(false)

  // Qualquer link clicado dentro do drawer (navegação, Perfil, "Painel
  // admin" no menu do usuário — que é portal, mas o evento sobe pela árvore
  // React) fecha o drawer, sem precisar observar a troca de rota.
  function fecharAoNavegar(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('a')) setAberto(false)
  }

  return (
    <div className="flex min-h-screen">
      <aside className={cn('hidden lg:flex', asideClassName)}>{sidebar}</aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border bg-sidebar/95 px-3 text-sidebar-foreground backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="flex size-9 items-center justify-center rounded-md hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Menu className="size-5" />
            <span className="sr-only">Abrir menu</span>
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">{marca}</div>
        </header>

        {children}
      </div>

      <DialogPrimitive.Root open={aberto} onOpenChange={setAberto}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:hidden" />
          <DialogPrimitive.Content
            onClickCapture={fecharAoNavegar}
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left lg:hidden"
          >
            <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Navegação do Gridgen</DialogPrimitive.Description>
            <DialogPrimitive.Close className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
              <X className="size-4" />
              <span className="sr-only">Fechar menu</span>
            </DialogPrimitive.Close>
            {sidebar}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}
