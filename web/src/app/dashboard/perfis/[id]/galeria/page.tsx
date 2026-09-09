import { serverFetch } from '@/lib/session'
import type { GaleriaItem, GaleriaPasta, Perfil } from '@/lib/types'
import { GaleriaClient } from './galeria-client'

export default async function GaleriaPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: perfilId } = await params
  const [itens, pastasCustom, perfil] = await Promise.all([
    serverFetch<GaleriaItem[]>(`/perfis/${perfilId}/galeria`),
    serverFetch<GaleriaPasta[]>(`/perfis/${perfilId}/galeria/pastas`),
    serverFetch<Perfil>(`/perfis/${perfilId}`),
  ])

  return <GaleriaClient perfilId={perfilId} itens={itens} pastasCustom={pastasCustom} perfil={perfil} />
}
