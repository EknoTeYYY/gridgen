import Image from 'next/image'
import { requireSession, serverFetch } from '@/lib/session'
import type { Perfil, UsoConta } from '@/lib/types'
import { AppShell } from '@/components/dashboard/app-shell'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { SidebarPerfisList } from '@/components/dashboard/sidebar-perfis-list'
import { UserMenu } from '@/components/dashboard/user-menu'
import { AvisoUsoBanner, UsoPlanoSidebar } from '@/components/dashboard/uso-plano'

function Wordmark() {
  return (
    <>
      <Image src="/gridgen-wordmark-roxo.png" alt="Gridgen" width={87} height={20} className="h-5 w-auto dark:hidden" />
      <Image
        src="/gridgen-wordmark-branco.png"
        alt="Gridgen"
        width={87}
        height={20}
        className="hidden h-5 w-auto dark:block"
      />
    </>
  )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  const [perfis, uso] = await Promise.all([
    serverFetch<Perfil[]>('/perfis').catch(() => []),
    // Falha ao ler o uso não pode derrubar o dashboard — só esconde o resumo.
    serverFetch<UsoConta>('/conta/uso').catch(() => null),
  ])

  return (
    <AppShell
      // `sticky` + `h-screen` prende a sidebar na altura da viewport — sem
      // isso ela esticava junto com o `<main>` (efeito padrão de flexbox
      // num container `min-h-screen`), e numa página longa (grade de
      // Posts) o menu de usuário no rodapé (`mt-auto`) acabava empurrado
      // bem abaixo do que cabe na tela, embora nunca tivesse sumido de
      // verdade. `overflow-y-auto` deixa o conteúdo da própria sidebar
      // rolar por conta, sem depender da altura do `<main>`.
      asideClassName="sticky top-0 h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground"
      marca={
        <>
          <Wordmark />
          <span className="truncate text-xs text-muted-foreground">{session.conta.nome}</span>
        </>
      }
      sidebar={
        <>
          <div className="mb-2 flex flex-col items-start gap-1 px-2 py-2">
            <Wordmark />
            <span className="max-w-full truncate text-xs text-muted-foreground">{session.conta.nome}</span>
          </div>

          <SidebarNav />
          <SidebarPerfisList perfis={perfis} />
          {uso && <UsoPlanoSidebar uso={uso} />}

          <div className="mt-auto pt-2">
            <UserMenu nome={session.nome} email={session.email} isSuperAdmin={session.isSuperAdmin} />
          </div>
        </>
      }
    >
      <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {uso && <AvisoUsoBanner uso={uso} />}
          {children}
        </div>
      </main>
    </AppShell>
  )
}
