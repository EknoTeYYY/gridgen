import { Building2 } from 'lucide-react'
import { serverFetch } from '@/lib/session'
import type { ContaComStatus, StatusConvite } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ExcluirContaButton } from './excluir-conta-button'
import { NovaContaDialog } from './nova-conta-dialog'
import { PlanoContaDialog } from './plano-conta-dialog'
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
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{conta.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{conta.slug} · {conta.totalPerfis} {conta.totalPerfis === 1 ? 'perfil' : 'perfis'} ·{' '}
                    {conta.totalUsuarios} {conta.totalUsuarios === 1 ? 'usuário' : 'usuários'}
                    {conta.conviteEmail && !conta.totalUsuarios ? ` · convite: ${conta.conviteEmail}` : ''}
                  </p>
                  {/* Plano fica do lado da conta (é dado dela), separado das
                      ações de acesso à direita (convite, desativar, excluir). */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PlanoContaDialog
                      contaId={conta.id}
                      nome={conta.nome}
                      uso={conta.uso}
                      atuais={{ limiteGeracoes: conta.limiteGeracoes, limitePerfis: conta.limitePerfis, perfisExtras: conta.perfisExtras }}
                    />
                    <p className="truncate text-xs text-muted-foreground">
                      {conta.uso.nomePlano} · {conta.uso.geracoes.usadas}/{conta.uso.geracoes.limite ?? '∞'} gerações no ciclo
                      {conta.uso.piloto ? (conta.uso.piloto.expirado ? ' · piloto expirado' : ` · piloto: ${conta.uso.piloto.diasRestantes}d`) : ''}
                    </p>
                    {conta.uso.nivel !== 'ok' && (
                      <Badge variant={conta.uso.nivel === 'atencao' ? 'outline' : 'destructive'}>
                        {conta.uso.nivel === 'esgotado' ? 'Cota esgotada' : 'Uso alto'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
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
