import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { requireSession } from '@/lib/session'
import { UserMenu } from '@/components/dashboard/user-menu'
import { AdminSidebarNav } from './admin-sidebar-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  if (!session.isSuperAdmin) redirect('/dashboard')

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground">
        <Link href="/dashboard" className="mb-2 flex flex-col items-start gap-1 px-2 py-2">
          <Image src="/gridgen-wordmark-roxo.png" alt="Gridgen" width={87} height={20} className="h-5 w-auto dark:hidden" />
          <Image
            src="/gridgen-wordmark-branco.png"
            alt="Gridgen"
            width={87}
            height={20}
            className="hidden h-5 w-auto dark:block"
          />
          <span className="text-xs text-muted-foreground">Admin</span>
        </Link>

        <AdminSidebarNav />

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
