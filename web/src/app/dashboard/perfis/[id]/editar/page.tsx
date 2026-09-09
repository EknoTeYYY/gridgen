import { serverFetch } from '@/lib/session'
import type { Perfil } from '@/lib/types'
import { PerfilForm } from '../../perfil-form'

export default async function EditarPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const perfil = await serverFetch<Perfil>(`/perfis/${id}`)

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">Editando as informações deste Perfil.</p>
      <PerfilForm perfilExistente={perfil} />
    </div>
  )
}
