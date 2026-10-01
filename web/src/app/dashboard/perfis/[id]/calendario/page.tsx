import Link from 'next/link'
import { PLANOS, planoDeEntradaComRecurso } from '@gridgen/shared'
import { serverFetch } from '@/lib/session'
import type { DataPersonalizada, Perfil, Post, UsoConta } from '@/lib/types'
import { InfoTooltip } from '@/components/form/info-tooltip'
import { CalendarioMensal } from './calendario-mensal'

export default async function CalendarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: perfilId } = await params
  const [perfil, personalizadas, posts, uso] = await Promise.all([
    serverFetch<Perfil>(`/perfis/${perfilId}`),
    serverFetch<DataPersonalizada[]>(`/perfis/${perfilId}/datas-personalizadas`),
    serverFetch<Post[]>(`/perfis/${perfilId}/posts`),
    serverFetch<UsoConta>('/conta/uso').catch(() => null),
  ])
  // Geração automática nas datas é do Essencial pra cima (mesma regra da api).
  // Sem o uso (falha de leitura), mantém o texto padrão.
  const geraSozinho = uso ? PLANOS[uso.plano].calendarioMensal : true
  // Plano de entrada do recurso (hoje Essencial) — nunca chumbar o nome.
  const planoCalendario = planoDeEntradaComRecurso('calendarioMensal')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Calendário — {perfil.nome}</h1>
        <InfoTooltip
          texto={
            geraSozinho
              ? 'Nessas datas, um rascunho é gerado automaticamente por IA com 5 dias de antecedência — você revisa e aprova antes de ir pro ar.'
              : `As datas ficam registradas no calendário. A geração automática de posts nessas datas está disponível a partir do plano ${planoCalendario.nome}.`
          }
        />
      </div>
      {!geraSozinho && (
        <p className="text-sm text-muted-foreground">
          No seu plano, as datas ficam só como lembrete: os posts não são gerados sozinhos.{' '}
          <Link href="/dashboard/plano" className="font-medium text-foreground underline underline-offset-2">
            Ver o plano {planoCalendario.nome}
          </Link>
        </p>
      )}

      <CalendarioMensal perfilId={perfilId} personalizadasIniciais={personalizadas} posts={posts} />
    </div>
  )
}
