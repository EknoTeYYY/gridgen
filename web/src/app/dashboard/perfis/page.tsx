import { Plus } from 'lucide-react'
import Link from 'next/link'
import { serverFetch } from '@/lib/session'
import type { Perfil } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import { PerfisGrid } from './perfis-grid'

export default async function PerfisPage() {
  const perfis = await serverFetch<Perfil[]>('/perfis')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Perfis</h1>
          <p className="text-sm text-muted-foreground">Marcas e clientes para quem esta conta gera conteúdo.</p>
        </div>
        <Link href="/dashboard/perfis/novo" className={buttonVariants()}>
          <Plus />
          Novo perfil
        </Link>
      </div>

      <PerfisGrid perfis={perfis} />
    </div>
  )
}
