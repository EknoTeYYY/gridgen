'use client'

import { Plus, Star, Trash2 } from 'lucide-react'
import type { ItemGrafico } from '@gridgen/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const BARRA_VAZIA: ItemGrafico = { rotulo: '', valor: 0, valorExibido: '', subrotulo: '', destaque: false }

// Dado numérico real do gráfico — sempre digitado à mão aqui (nunca pela IA,
// ver `EstiloVisual` em @gridgen/shared: risco de alucinar estatística e
// apresentar como verdadeira é grave demais nesse campo específico).
export function GraficoBarrasField({
  label,
  value,
  onChange,
}: {
  label: string
  value: ItemGrafico[] | undefined
  onChange: (valor: ItemGrafico[]) => void
}) {
  const barras = value ?? []

  function atualizar(i: number, campo: keyof ItemGrafico, valor: string | number | boolean) {
    onChange(barras.map((b, idx) => (idx === i ? { ...b, [campo]: valor } : b)))
  }

  function remover(i: number) {
    onChange(barras.filter((_, idx) => idx !== i))
  }

  function adicionar() {
    onChange([...barras, { ...BARRA_VAZIA }])
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">
        Dado real, digitado por você — a IA nunca preenche os números aqui. Pelo menos 2 barras.
      </p>
      <div className="flex flex-col gap-3">
        {barras.map((b, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-md border p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-normal text-muted-foreground">Rótulo</Label>
                <Input
                  value={b.rotulo}
                  onChange={(e) => atualizar(i, 'rotulo', e.target.value)}
                  placeholder="ex.: Netflix"
                  maxLength={40}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-normal text-muted-foreground">Valor (calcula a altura)</Label>
                <Input
                  type="number"
                  value={Number.isFinite(b.valor) ? b.valor : ''}
                  onChange={(e) => atualizar(i, 'valor', Number(e.target.value))}
                  placeholder="ex.: 11300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-normal text-muted-foreground">Texto exibido</Label>
                <Input
                  value={b.valorExibido}
                  onChange={(e) => atualizar(i, 'valorExibido', e.target.value)}
                  placeholder="ex.: 11.300"
                  maxLength={20}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-normal text-muted-foreground">Sub-rótulo (opcional)</Label>
                <Input
                  value={b.subrotulo ?? ''}
                  onChange={(e) => atualizar(i, 'subrotulo', e.target.value)}
                  placeholder="ex.: 2021"
                  maxLength={20}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => atualizar(i, 'destaque', !b.destaque)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors',
                  b.destaque ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Star className="size-3.5" />
                Destacar essa barra
              </button>
              <Button type="button" variant="ghost" size="sm" onClick={() => remover(i)}>
                <Trash2 />
                Remover
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={adicionar}>
        <Plus />
        Adicionar barra
      </Button>
    </div>
  )
}
