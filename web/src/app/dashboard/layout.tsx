import { Sparkles } from 'lucide-react'
import { requireSession, serverFetch } from '@/lib/session'
import type { Perfil, Post } from '@/lib/types'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { SidebarPerfisList } from '@/components/dashboard/sidebar-perfis-list'
import { UserMenu } from '@/components/dashboard/user-menu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  const [perfis, pendentes] = await Promise.all([
    serverFetch<Perfil[]>('/perfis').catch(() => []),
    serverFetch<Post[]>('/posts/pendentes').catch(() => []),
  ])

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
        <div className="mb-2 flex items-center gap-2 px-2 py-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">{session.conta.nome}</span>
            <span className="font-heading text-xs text-muted-foreground">Gridgen</span>
          </div>
        </div>

        <SidebarNav pendentesCount={pendentes.length} />
        <SidebarPerfisList perfis={perfis} />

        <div className="mt-auto pt-2">
          <UserMenu nome={session.nome} email={session.email} isSuperAdmin={session.isSuperAdmin} />
        </div>
      </aside>
      <main className="flex-1 bg-background p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
