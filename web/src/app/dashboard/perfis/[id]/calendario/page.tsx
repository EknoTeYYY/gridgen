import { serverFetch } from '@/lib/session'
import type { DataPersonalizada, Perfil, Post, PropostaCalendario } from '@/lib/types'
import { InfoTooltip } from '@/components/form/info-tooltip'
import { CalendarioMensal } from './calendario-mensal'
import { PropostaMensal } from './proposta-mensal'

function proximoMesAno(): { ano: number; mes: number } {
  const hoje = new Date()
  const mes = hoje.getMonth() + 2
  return mes > 12 ? { ano: hoje.getFullYear() + 1, mes: mes - 12 } : { ano: hoje.getFullYear(), mes }
}

export default async function CalendarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: perfilId } = await params
  const { ano, mes } = proximoMesAno()
  const [perfil, personalizadas, posts, propostaMensal] = await Promise.all([
    serverFetch<Perfil>(`/perfis/${perfilId}`),
    serverFetch<DataPersonalizada[]>(`/perfis/${perfilId}/datas-personalizadas`),
    serverFetch<Post[]>(`/perfis/${perfilId}/posts`),
    serverFetch<PropostaCalendario | null>(`/perfis/${perfilId}/calendario-mensal?ano=${ano}&mes=${mes}`),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Calendário — {perfil.nome}</h1>
        <InfoTooltip texto="Nessas datas, um rascunho é gerado automaticamente por IA com 5 dias de antecedência — você revisa e aprova antes de ir pro ar." />
      </div>

      <PropostaMensal perfilId={perfilId} propostaInicial={propostaMensal} />

      <CalendarioMensal perfilId={perfilId} personalizadasIniciais={personalizadas} posts={posts} />
    </div>
  )
}
