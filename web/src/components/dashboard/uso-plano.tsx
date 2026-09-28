import Link from 'next/link'
import { AlertTriangle, Sparkles } from 'lucide-react'
import type { NivelUso } from '@gridgen/shared'
import type { UsoConta } from '@/lib/types'
import { cn } from '@/lib/utils'

const COR_BARRA: Record<NivelUso, string> = {
  ok: 'bg-violet-600',
  atencao: 'bg-amber-500',
  critico: 'bg-orange-600',
  esgotado: 'bg-destructive',
}

export function BarraUso({ usadas, limite, nivel, className }: { usadas: number; limite: number | null; nivel: NivelUso; className?: string }) {
  const pct = limite === null || limite === 0 ? 0 : Math.min(100, Math.round((usadas / limite) * 100))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div className={cn('h-full rounded-full transition-all', COR_BARRA[nivel])} style={{ width: `${limite === null ? 0 : Math.max(pct, 2)}%` }} />
    </div>
  )
}

// Resumo compacto na sidebar do dashboard: plano, gerações do ciclo e Perfis.
export function UsoPlanoSidebar({ uso }: { uso: UsoConta }) {
  const { geracoes, perfis } = uso
  return (
    <Link
      href="/dashboard/plano"
      className="mx-1 mt-3 flex flex-col gap-2 rounded-lg border border-sidebar-border bg-background/50 p-3 text-xs transition-colors hover:bg-sidebar-accent"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">Plano {uso.nomePlano}</span>
        {uso.nivel !== 'ok' && <AlertTriangle className="size-3.5 text-amber-500" />}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-muted-foreground">
          <span>Gerações</span>
          <span className="tabular-nums">
            {geracoes.usadas}/{geracoes.limite ?? '∞'}
          </span>
        </div>
        <BarraUso usadas={geracoes.usadas} limite={geracoes.limite} nivel={uso.nivel} />
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Perfis</span>
        <span className="tabular-nums">
          {perfis.usados}/{perfis.limite ?? '∞'}
        </span>
      </div>
      {uso.piloto && uso.piloto.diasRestantes !== null && !uso.piloto.expirado && (
        <span className="text-muted-foreground">
          Piloto: {uso.piloto.diasRestantes} {uso.piloto.diasRestantes === 1 ? 'dia restante' : 'dias restantes'}
        </span>
      )}
    </Link>
  )
}

// Faixa no topo do conteúdo quando o uso pede atenção: uso terminando, cota
// esgotada ou piloto acabando/acabado. Some quando está ok. Perfis no limite
// não entram: usar todos os Perfis do plano é o estado normal (o bloqueio só
// aparece quando alguém tenta criar mais um).
export function AvisoUsoBanner({ uso }: { uso: UsoConta }) {
  const pilotoAcabando = uso.piloto !== null && !uso.piloto.expirado && (uso.piloto.diasRestantes ?? 99) <= 3
  if (uso.nivel === 'ok' && !pilotoAcabando) return null

  let titulo: string
  if (uso.piloto?.expirado) titulo = 'Seu período de piloto terminou.'
  else if (uso.nivel === 'esgotado') titulo = `As ${uso.geracoes.limite} gerações do seu plano neste ciclo acabaram.`
  else if (uso.nivel === 'critico' || uso.nivel === 'atencao')
    titulo = `Seu uso está terminando: ${uso.geracoes.restantes} de ${uso.geracoes.limite} gerações restantes, ciclo renova em ${uso.ciclo.diasRestantes} ${uso.ciclo.diasRestantes === 1 ? 'dia' : 'dias'}.`
  else titulo = `Seu piloto termina em ${uso.piloto!.diasRestantes} ${uso.piloto!.diasRestantes === 1 ? 'dia' : 'dias'}.`

  const grave = uso.nivel === 'esgotado' || uso.nivel === 'critico' || uso.piloto?.expirado
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-center sm:justify-between',
        grave ? 'border-destructive/40 bg-destructive/5' : 'border-amber-500/40 bg-amber-500/5',
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn('mt-0.5 size-4 shrink-0', grave ? 'text-destructive' : 'text-amber-500')} />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium">{titulo}</p>
          {uso.recomendacao && <p className="text-muted-foreground">{uso.recomendacao.motivo}</p>}
        </div>
      </div>
      <Link
        href="/dashboard/plano"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
      >
        <Sparkles className="size-3.5" />
        Ver opções
      </Link>
    </div>
  )
}
