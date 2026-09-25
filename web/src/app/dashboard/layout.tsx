import Image from 'next/image'
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
        <div className="mb-2 flex flex-col items-start gap-1 px-2 py-2">
          <Image src="/gridgen-wordmark-roxo.png" alt="Gridgen" width={87} height={20} className="h-5 w-auto dark:hidden" />
          <Image
            src="/gridgen-wordmark-branco.png"
            alt="Gridgen"
            width={87}
            height={20}
            className="hidden h-5 w-auto dark:block"
          />
          <span className="truncate text-xs text-muted-foreground">{session.conta.nome}</span>
        </div>

        <SidebarNav pendentesCount={pendentes.length} />
        <SidebarPerfisList perfis={perfis} />

        <div className="mt-auto pt-2">
          <UserMenu nome={session.nome} email={session.email} isSuperAdmin={session.isSuperAdmin} />
        </div>
      </aside>
      <main className="flex-1 bg-background p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
