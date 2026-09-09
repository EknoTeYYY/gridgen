import { Building2 } from 'lucide-react'
import { serverFetch } from '@/lib/session'
import type { ContaComStatus, StatusConvite } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ExcluirContaButton } from './excluir-conta-button'
import { NovaContaDialog } from './nova-conta-dialog'
import { ReenviarConviteButton } from './reenviar-convite-button'
import { StatusContaButton } from './status-conta-button'

const STATUS_LABEL: Record<StatusConvite, string> = {
  pendente: 'Convite pendente',
  aceito: 'Ativa',
  expirado: 'Convite expirado',
  revogado: 'Convite revogado',
}

function StatusBadge({ status }: { status: StatusConvite | null }) {
  if (!status) return <Badge variant="secondary">Sem convite</Badge>
  if (status === 'aceito') {
    return (
      <Badge className="border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
        {STATUS_LABEL[status]}
      </Badge>
    )
  }
  if (status === 'expirado' || status === 'revogado') {
    return <Badge variant="destructive">{STATUS_LABEL[status]}</Badge>
  }
  return <Badge variant="outline">{STATUS_LABEL[status]}</Badge>
}

export default async function AdminPage() {
  const contas = await serverFetch<ContaComStatus[]>('/admin/contas')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas</h1>
          <p className="text-sm text-muted-foreground">Agências com acesso ao Gridgen, provisionadas pela Eknotech.</p>
        </div>
        <NovaContaDialog />
      </div>

      {contas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Building2 className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Nenhuma conta criada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {contas.map((conta) => (
            <Card key={conta.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{conta.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{conta.slug} · {conta.totalPerfis} {conta.totalPerfis === 1 ? 'perfil' : 'perfis'} ·{' '}
                    {conta.totalUsuarios} {conta.totalUsuarios === 1 ? 'usuário' : 'usuários'}
                    {conta.conviteEmail && !conta.totalUsuarios ? ` · convite: ${conta.conviteEmail}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {conta.status === 'inativa' && <Badge variant="destructive">Inativa</Badge>}
                  <StatusBadge status={conta.statusConvite} />
                  {conta.statusConvite && conta.statusConvite !== 'aceito' && (
                    <ReenviarConviteButton contaId={conta.id} />
                  )}
                  <StatusContaButton contaId={conta.id} status={conta.status} />
                  <ExcluirContaButton contaId={conta.id} nome={conta.nome} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
