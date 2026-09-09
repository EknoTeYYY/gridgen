import { notFound } from 'next/navigation'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { Perfil } from '@/lib/types'
import { PerfilAvatarPicker } from '@/components/dashboard/perfil-avatar-picker'
import { PerfilHeaderActions } from './perfil-header-actions'
import { PerfilTabsNav } from './perfil-tabs-nav'

// Shell compartilhado de todo o "espaço" de um Perfil (visão geral, edição,
// contexto, posts) — cabeçalho + abas uma vez só, em vez de cada tela montar
// o próprio topo do zero (era assim que a tela ficava com botões soltos).
export default async function PerfilShellLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let perfil: Perfil
  try {
    perfil = await serverFetch<Perfil>(`/perfis/${id}`)
  } catch (err) {
    if (err instanceof ServerFetchError && err.status === 404) notFound()
    throw err
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <PerfilAvatarPicker perfil={perfil} className="size-10" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{perfil.nome}</h1>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                {perfil.tipo}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">/{perfil.slug}</p>
          </div>
        </div>
        <PerfilHeaderActions perfilId={id} />
      </div>

      <PerfilTabsNav perfilId={id} />

      {children}
    </div>
  )
}
