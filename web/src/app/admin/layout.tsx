import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { requireSession } from '@/lib/session'
import { AppShell } from '@/components/dashboard/app-shell'
import { UserMenu } from '@/components/dashboard/user-menu'
import { AdminSidebarNav } from './admin-sidebar-nav'

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  if (!session.isSuperAdmin) redirect('/dashboard')

  return (
    <AppShell
      asideClassName="w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground"
      marca={
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <Wordmark />
          <span className="text-xs text-muted-foreground">Admin</span>
        </Link>
      }
      sidebar={
        <>
          <Link href="/dashboard" className="mb-2 flex flex-col items-start gap-1 px-2 py-2">
            <Wordmark />
            <span className="text-xs text-muted-foreground">Admin</span>
          </Link>

          <AdminSidebarNav />

          <div className="mt-auto pt-2">
            <UserMenu nome={session.nome} email={session.email} isSuperAdmin={session.isSuperAdmin} />
          </div>
        </>
      }
    >
      <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </AppShell>
  )
}
