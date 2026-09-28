import { Check, Lightbulb, Minus } from 'lucide-react'
import {
  PACOTE_EXTRA,
  PERFIL_EXTRA_PRECO,
  PLANOS,
  PLANOS_EM_ORDEM,
  type NivelUso,
  type PlanoId,
} from '@gridgen/shared'
import { serverFetch } from '@/lib/session'
import type { UsoConta } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { BarraUso } from '@/components/dashboard/uso-plano'
import { SolicitarButton } from './solicitar-button'

const COLUNAS: PlanoId[] = [...PLANOS_EM_ORDEM, 'sob_medida']

const STATUS: Record<NivelUso, { texto: string; classe: string }> = {
  ok: { texto: 'Uso dentro do plano', classe: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  atencao: { texto: 'Uso alto', classe: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  critico: { texto: 'Uso quase no limite', classe: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  esgotado: { texto: 'Limite atingido', classe: 'bg-destructive/10 text-destructive' },
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '')
}

function precoDoPlano(id: PlanoId): string {
  const preco = PLANOS[id].precoMensal
  if (preco === null) return 'Sob consulta'
  if (preco === 0) return 'Grátis'
  return `R$ ${preco.toLocaleString('pt-BR')}/mês`
}

function Medidor({
  rotulo,
  usados,
  limite,
  nivel,
  detalhe,
}: {
  rotulo: string
  usados: number
  limite: number | null
  nivel: NivelUso
  detalhe?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">{rotulo}</span>
        <span className="text-sm tabular-nums">
          <span className="text-2xl font-semibold">{usados}</span>
          <span className="text-muted-foreground"> / {limite ?? 'sem limite'}</span>
        </span>
      </div>
      {limite !== null && <BarraUso usadas={usados} limite={limite} nivel={nivel} className="h-2" />}
      {detalhe && <span className="text-xs text-muted-foreground">{detalhe}</span>}
    </div>
  )
}

export default async function PlanoPage() {
  const uso = await serverFetch<UsoConta>('/conta/uso')
  const { geracoes, perfis, ciclo, recomendacao } = uso
  const plano = PLANOS[uso.plano]
  // Sob medida é o topo da escada (nada "acima" dele); piloto fica abaixo de
  // todos (-1), então todo plano pago aparece como opção.
  const indiceAtual = uso.plano === 'sob_medida' ? PLANOS_EM_ORDEM.length : PLANOS_EM_ORDEM.indexOf(uso.plano)
  const perfisNoLimite = perfis.limite !== null && perfis.usados >= perfis.limite
  // Perfis cheios é informação, não alerta (usar o que o plano inclui é o normal).
  const nivelPerfis: NivelUso = 'ok'
  const status = STATUS[uso.nivel]

  const detalheGeracoes = [
    geracoes.restantes !== null ? `${geracoes.restantes} restantes` : null,
    geracoes.limite !== null ? `~${geracoes.projecaoCiclo} projetadas até o fim do ciclo` : null,
    geracoes.extras > 0 ? `inclui +${geracoes.extras} de pacote extra` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const descricaoPlano = uso.piloto
    ? uso.piloto.expirado
      ? 'Piloto encerrado'
      : `Piloto gratuito · termina em ${uso.piloto.diasRestantes} ${uso.piloto.diasRestantes === 1 ? 'dia' : 'dias'}`
    : plano.precoMensal === null
      ? 'Condições comerciais sob medida'
      : precoDoPlano(uso.plano)

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plano e uso</h1>
        <p className="text-sm text-muted-foreground">
          Ciclo de {formatarData(ciclo.inicio)} a {formatarData(ciclo.fim)} · renova em {ciclo.diasRestantes}{' '}
          {ciclo.diasRestantes === 1 ? 'dia' : 'dias'}
        </p>
      </div>

      {/* Um painel só: o que o cliente tem, quanto já usou e o que fazer agora.
          Recomendação e extras ficam dentro dele, no contexto do consumo. */}
      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Seu plano</p>
              <p className="mt-1 text-2xl font-semibold">{plano.nome}</p>
              <p className="text-sm text-muted-foreground">{descricaoPlano}</p>
            </div>
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', status.classe)}>{status.texto}</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
            <Medidor rotulo="Gerações neste ciclo" usados={geracoes.usadas} limite={geracoes.limite} nivel={uso.nivel} detalhe={detalheGeracoes || undefined} />
            <Medidor
              rotulo="Perfis"
              usados={perfis.usados}
              limite={perfis.limite}
              nivel={nivelPerfis}
              detalhe={perfisNoLimite ? 'Todos os Perfis do plano estão em uso' : undefined}
            />
          </div>
        </CardContent>

        {recomendacao && (
          <div className="flex flex-col gap-3 border-t bg-violet-500/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-violet-500" />
              <p className="text-sm">{recomendacao.motivo}</p>
            </div>
            <SolicitarButton
              className="shrink-0"
              pedido={{
                tipo: recomendacao.tipo,
                planoId: recomendacao.planoId && recomendacao.planoId !== 'piloto' ? recomendacao.planoId : undefined,
              }}
            >
              {recomendacao.tipo === 'pacote'
                ? `Pedir pacote +${PACOTE_EXTRA.geracoes}`
                : recomendacao.tipo === 'perfil_extra'
                  ? 'Pedir Perfil extra'
                  : recomendacao.planoId
                    ? `Pedir plano ${PLANOS[recomendacao.planoId].nome}`
                    : 'Falar com o time comercial'}
            </SolicitarButton>
          </div>
        )}

        {uso.plano !== 'sob_medida' && (
          <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Precisa de mais sem mudar de plano?</p>
            <div className="flex flex-wrap gap-2">
              <SolicitarButton variant="outline" pedido={{ tipo: 'pacote' }}>
                +{PACOTE_EXTRA.geracoes} gerações · R$ {PACOTE_EXTRA.preco}
              </SolicitarButton>
              <SolicitarButton variant="outline" pedido={{ tipo: 'perfil_extra' }}>
                +1 Perfil · R$ {PERFIL_EXTRA_PRECO}/mês
              </SolicitarButton>
            </div>
          </div>
        )}
      </Card>

      {/* Comparação em tabela: lado a lado, linha por linha, é mais fácil de
          ler que um card por plano. A coluna do plano atual fica destacada. */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Comparar planos</h2>
          <p className="text-sm text-muted-foreground">Mudanças de plano são confirmadas pelo time comercial da Eknotech.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="w-[22%] p-4" />
                {COLUNAS.map((id) => (
                  <th key={id} className={cn('p-4 text-left align-top font-normal', id === uso.plano && 'bg-violet-500/5')}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{PLANOS[id].nome}</span>
                      {id === uso.plano && <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-medium text-white">Seu plano</span>}
                    </div>
                    <div className="mt-1 text-muted-foreground">{precoDoPlano(id)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:not(:last-child)]:border-b">
              <Linha rotulo="Perfis" atual={uso.plano} valor={(id) => PLANOS[id].perfis ?? 'Sob medida'} />
              <Linha rotulo="Gerações por mês" atual={uso.plano} valor={(id) => PLANOS[id].geracoesMes ?? 'Sob medida'} />
              <Linha rotulo="Calendário mensal com IA" atual={uso.plano} valor={(id) => PLANOS[id].calendarioMensal} />
              <Linha rotulo="Implantação assistida" atual={uso.plano} valor={() => true} />
              {/* Linha de ações só existe quando há plano acima do atual — no
                  topo da escada (sob medida) ela ficaria vazia. */}
              {uso.plano !== 'sob_medida' && (
              <tr className="border-b-0">
                <td className="p-4" />
                {COLUNAS.map((id) => {
                  const acima = id === 'sob_medida' ? uso.plano !== 'sob_medida' : PLANOS_EM_ORDEM.indexOf(id) > indiceAtual
                  return (
                    <td key={id} className={cn('p-4', id === uso.plano && 'bg-violet-500/5')}>
                      {acima ? (
                        <SolicitarButton
                          variant={PLANOS[id].destaque ? 'default' : 'outline'}
                          className="w-full"
                          pedido={id === 'sob_medida' ? { tipo: 'sob_medida' } : { tipo: 'plano', planoId: id as 'essencial' | 'profissional' | 'agencia' }}
                        >
                          {id === 'sob_medida' ? 'Pedir proposta' : `Mudar para ${PLANOS[id].nome}`}
                        </SolicitarButton>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Linha({ rotulo, atual, valor }: { rotulo: string; atual: PlanoId; valor: (id: PlanoId) => string | number | boolean }) {
  return (
    <tr>
      <td className="p-4 text-muted-foreground">{rotulo}</td>
      {COLUNAS.map((id) => {
        const v = valor(id)
        return (
          <td key={id} className={cn('p-4', id === atual && 'bg-violet-500/5')}>
            {v === true ? (
              <Check className="size-4 text-violet-500" aria-label="Incluído" />
            ) : v === false ? (
              <Minus className="size-4 text-muted-foreground/50" aria-label="Não incluído" />
            ) : (
              <span className="tabular-nums">{v}</span>
            )}
          </td>
        )
      })}
    </tr>
  )
}
