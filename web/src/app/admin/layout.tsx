import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { requireSession } from '@/lib/session'
import { UserMenu } from '@/components/dashboard/user-menu'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  if (!session.isSuperAdmin) redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="font-heading text-sm font-semibold">Gridgen — Admin</span>
        </Link>
        <div className="w-56">
          <UserMenu nome={session.nome} email={session.email} isSuperAdmin={session.isSuperAdmin} />
        </div>
      </header>
      <main className="flex-1 bg-background p-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <nav className="flex items-center gap-1 border-b">
            <Link
              href="/admin"
              className="border-b-2 border-transparent px-3 pb-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Contas
            </Link>
            <Link
              href="/admin/leads"
              className="border-b-2 border-transparent px-3 pb-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Leads
            </Link>
          </nav>
          {children}
        </div>
      </main>
    </div>
  )
}
