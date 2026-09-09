import { serverFetch } from '@/lib/session'
import type { DataPersonalizada, Perfil, Post } from '@/lib/types'
import { InfoTooltip } from '@/components/form/info-tooltip'
import { CalendarioMensal } from './calendario-mensal'

export default async function CalendarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: perfilId } = await params
  const [perfil, personalizadas, posts] = await Promise.all([
    serverFetch<Perfil>(`/perfis/${perfilId}`),
    serverFetch<DataPersonalizada[]>(`/perfis/${perfilId}/datas-personalizadas`),
    serverFetch<Post[]>(`/perfis/${perfilId}/posts`),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Calendário — {perfil.nome}</h1>
        <InfoTooltip texto="Nessas datas, um rascunho é gerado automaticamente por IA com 5 dias de antecedência — você revisa e aprova antes de ir pro ar." />
      </div>

      <CalendarioMensal perfilId={perfilId} personalizadasIniciais={personalizadas} posts={posts} />
    </div>
  )
}
