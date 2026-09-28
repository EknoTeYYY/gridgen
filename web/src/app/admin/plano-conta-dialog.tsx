'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Loader2, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { PACOTE_EXTRA, PLANOS, type PlanoId } from '@gridgen/shared'
import type { UsoConta } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adicionarPacoteExtra, alterarPlanoConta } from './actions'

const IDS = Object.keys(PLANOS) as PlanoId[]

function numeroOuNulo(valor: string): number | null {
  return valor.trim() === '' ? null : Number(valor)
}

// Cobrança manual: aqui o superadmin registra o que foi contratado (plano,
// início do ciclo, overrides do sob medida) e lança pacotes extras pagos.
export function PlanoContaDialog({
  contaId,
  nome,
  uso,
  atuais,
}: {
  contaId: string
  nome: string
  uso: UsoConta
  // Valores já gravados na Conta: o form abre com eles, pra salvar sem mexer
  // num campo nunca apagar o que já estava contratado.
  atuais: { limiteGeracoes: number | null; limitePerfis: number | null; perfisExtras: number }
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [plano, setPlano] = useState<PlanoId>(uso.plano)
  const [reiniciarCiclo, setReiniciarCiclo] = useState(false)
  const [limiteGeracoes, setLimiteGeracoes] = useState(atuais.limiteGeracoes?.toString() ?? '')
  const [limitePerfis, setLimitePerfis] = useState(atuais.limitePerfis?.toString() ?? '')
  const [perfisExtras, setPerfisExtras] = useState(String(atuais.perfisExtras))
  const [pilotoExpiraEm, setPilotoExpiraEm] = useState(uso.piloto?.expiraEm?.slice(0, 10) ?? '')
  const [pacotes, setPacotes] = useState('1')
  const [salvando, startSalvar] = useTransition()

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    startSalvar(async () => {
      const resultado = await alterarPlanoConta(contaId, {
        plano,
        reiniciarCiclo,
        limiteGeracoes: numeroOuNulo(limiteGeracoes),
        limitePerfis: numeroOuNulo(limitePerfis),
        perfisExtras: Number(perfisExtras) || 0,
        ...(plano === 'piloto' && pilotoExpiraEm ? { pilotoExpiraEm: new Date(`${pilotoExpiraEm}T23:59:00Z`).toISOString() } : {}),
      })
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success(`Plano de ${nome} atualizado para ${PLANOS[plano].nome}.`)
      setAberto(false)
      router.refresh()
    })
  }

  function lancarPacote() {
    startSalvar(async () => {
      const resultado = await adicionarPacoteExtra(contaId, Number(pacotes) || 1)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success(`+${(Number(pacotes) || 1) * PACOTE_EXTRA.geracoes} gerações lançadas no ciclo atual.`)
      setAberto(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <CreditCard />
          Plano
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Plano de {nome}</DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Plano contratado</Label>
            <Select value={plano} onValueChange={(v) => setPlano(v as PlanoId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {PLANOS[id].nome}
                    {PLANOS[id].precoMensal ? ` · R$ ${PLANOS[id].precoMensal}/mês` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {plano === 'piloto' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pilotoExpiraEm">Piloto termina em</Label>
              <Input id="pilotoExpiraEm" type="date" value={pilotoExpiraEm} onChange={(e) => setPilotoExpiraEm(e.target.value)} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="limiteGeracoes">Gerações/mês</Label>
              <Input
                id="limiteGeracoes"
                type="number"
                min={0}
                placeholder={String(PLANOS[plano].geracoesMes ?? '∞')}
                value={limiteGeracoes}
                onChange={(e) => setLimiteGeracoes(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="limitePerfis">Perfis</Label>
              <Input
                id="limitePerfis"
                type="number"
                min={0}
                placeholder={String(PLANOS[plano].perfis ?? '∞')}
                value={limitePerfis}
                onChange={(e) => setLimitePerfis(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="perfisExtras">Perfis extras</Label>
              <Input id="perfisExtras" type="number" min={0} value={perfisExtras} onChange={(e) => setPerfisExtras(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Campos de limite vazios usam o padrão do plano (valor em cinza).</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={reiniciarCiclo} onChange={(e) => setReiniciarCiclo(e.target.checked)} />
            Reiniciar o ciclo hoje (início do contrato)
          </label>
          <DialogFooter>
            <Button type="submit" disabled={salvando}>
              {salvando && <Loader2 className="animate-spin" />}
              Salvar plano
            </Button>
          </DialogFooter>
        </form>
        <div className="flex items-end gap-3 border-t pt-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="pacotes">Pacotes extras (+{PACOTE_EXTRA.geracoes} cada, ciclo atual)</Label>
            <Input id="pacotes" type="number" min={1} max={20} value={pacotes} onChange={(e) => setPacotes(e.target.value)} />
          </div>
          <Button type="button" variant="outline" onClick={lancarPacote} disabled={salvando}>
            <PackagePlus />
            Lançar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
