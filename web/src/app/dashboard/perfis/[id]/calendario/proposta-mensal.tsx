'use client'

import { useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Pencil, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { TIPOS } from '@gridgen/shared'
import type { PautaCalendario, PropostaCalendario } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { InfoTooltip } from '@/components/form/info-tooltip'
import { aprovarPropostaMensal, buscarPropostaMensal, editarPautaMensal, gerarPropostaMensal } from './actions'

function proximoMesAno(): { ano: number; mes: number } {
  const hoje = new Date()
  const mes = hoje.getMonth() + 2 // +1 pra 1-based, +1 pro mês seguinte
  return mes > 12 ? { ano: hoje.getFullYear() + 1, mes: mes - 12 } : { ano: hoje.getFullYear(), mes }
}

function formatarMesAno(ano: number, mes: number): string {
  const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, mes - 1, 1)))
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

function formatarDataHorario(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(d)
}

function EditarPautaForm({
  perfilId,
  pauta,
  precisaMotivo,
  onSalvo,
  onCancelar,
}: {
  perfilId: string
  pauta: PautaCalendario
  precisaMotivo: boolean
  onSalvo: (atualizada: Partial<PautaCalendario>) => void
  onCancelar: () => void
}) {
  const [assunto, setAssunto] = useState(pauta.assunto)
  const [abordagem, setAbordagem] = useState(pauta.abordagem)
  const [motivoTroca, setMotivoTroca] = useState('')
  const [salvando, startTransition] = useTransition()

  function salvar() {
    if (precisaMotivo && !motivoTroca.trim()) {
      toast.error('Informe o motivo da troca — a proposta já foi aprovada.')
      return
    }
    startTransition(async () => {
      const resultado = await editarPautaMensal(perfilId, pauta.id, {
        assunto,
        abordagem,
        ...(motivoTroca.trim() ? { motivoTroca: motivoTroca.trim() } : {}),
      })
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Pauta atualizada.')
      onSalvo({ assunto, abordagem, ...(motivoTroca.trim() ? { motivoUltimaTroca: motivoTroca.trim() } : {}) })
    })
  }

  return (
    <div className="flex flex-col gap-2 border-t pt-3 mt-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Assunto</Label>
        <Input value={assunto} onChange={(e) => setAssunto(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs">Abordagem</Label>
        <Textarea value={abordagem} onChange={(e) => setAbordagem(e.target.value)} className="min-h-16" />
      </div>
      {precisaMotivo && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Motivo da troca (obrigatório — proposta já aprovada)</Label>
          <Input value={motivoTroca} onChange={(e) => setMotivoTroca(e.target.value)} placeholder="ex.: cliente pediu pra priorizar outro lançamento" />
        </div>
      )}
      <div className="flex gap-2 justify-end mt-1">
        <Button variant="ghost" size="sm" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </Button>
        <Button size="sm" onClick={salvar} disabled={salvando}>
          {salvando ? <Loader2 className="size-4 animate-spin" /> : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}

function PautaCard({ perfilId, pauta, propostaAprovada, onAtualizada }: { perfilId: string; pauta: PautaCalendario; propostaAprovada: boolean; onAtualizada: (atualizada: Partial<PautaCalendario>) => void }) {
  const [editando, setEditando] = useState(false)
  const bloqueada = Boolean(pauta.postId)

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{TIPOS[pauta.tipo]?.nome ?? pauta.tipo}</Badge>
            <span className="text-xs text-muted-foreground">{formatarDataHorario(pauta.dataHorario)}</span>
            {pauta.ocasiao && <Badge variant="secondary">{pauta.ocasiao}</Badge>}
            {bloqueada && <Badge className="bg-emerald-600/15 text-emerald-600 border-emerald-600/30">post já gerado</Badge>}
          </div>
          <p className="font-medium leading-tight">{pauta.assunto}</p>
          <p className="text-sm text-muted-foreground">{pauta.abordagem}</p>
        </div>
        {!bloqueada && !editando && (
          <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setEditando(true)} title="Editar pauta">
            <Pencil className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground/80">Objetivo:</strong> {pauta.objetivo}
        </span>
        <span>
          <strong className="text-foreground/80">Ação desejada:</strong> {pauta.acaoDesejada}
        </span>
        <span className="col-span-2">
          <strong className="text-foreground/80">Origem:</strong> {pauta.origemInformacao}
        </span>
        {pauta.motivoUltimaTroca && (
          <span className="col-span-2 text-amber-600">
            <strong>Última troca:</strong> {pauta.motivoUltimaTroca}
          </span>
        )}
      </div>

      {editando && (
        <EditarPautaForm
          perfilId={perfilId}
          pauta={pauta}
          precisaMotivo={propostaAprovada}
          onSalvo={(atualizada) => {
            onAtualizada(atualizada)
            setEditando(false)
          }}
          onCancelar={() => setEditando(false)}
        />
      )}
    </div>
  )
}

export function PropostaMensal({ perfilId, propostaInicial }: { perfilId: string; propostaInicial: PropostaCalendario | null }) {
  const [{ ano, mes }, setAnoMes] = useState(proximoMesAno)
  const [proposta, setProposta] = useState<PropostaCalendario | null>(propostaInicial)
  const [buscando, startBusca] = useTransition()
  const [gerando, startGeracao] = useTransition()
  const [aprovando, startAprovacao] = useTransition()

  function buscar(anoAlvo = ano, mesAlvo = mes) {
    startBusca(async () => {
      const encontrada = await buscarPropostaMensal(perfilId, anoAlvo, mesAlvo)
      setProposta(encontrada)
      if (!encontrada) toast.message(`Nenhuma proposta gerada pra ${formatarMesAno(anoAlvo, mesAlvo)} ainda.`)
    })
  }

  // Trocar de mês some com a proposta na hora (é de outro mês) e já busca se
  // existe uma salva pra lá — sem isso, "Ver proposta salva" não tinha pra
  // onde navegar, só re-buscava o mesmo mês já carregado (achado real do
  // usuário: o botão "não fazia nada" visível).
  function mudarMes(delta: number) {
    const total = (ano * 12 + (mes - 1)) + delta
    const novoAno = Math.floor(total / 12)
    const novoMes = (total % 12) + 1
    setAnoMes({ ano: novoAno, mes: novoMes })
    setProposta(null)
    buscar(novoAno, novoMes)
  }

  function gerar() {
    startGeracao(async () => {
      const resultado = await gerarPropostaMensal(perfilId, ano, mes)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      setProposta(resultado.proposta ?? null)
      toast.success('Proposta do mês gerada — revise antes de aprovar.')
    })
  }

  function aprovar() {
    if (!proposta) return
    startAprovacao(async () => {
      const resultado = await aprovarPropostaMensal(perfilId, proposta.id)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      setProposta(resultado.proposta ?? null)
      toast.success('Calendário do mês aprovado — as pautas vão gerar post automaticamente perto da data.')
    })
  }

  function atualizarPauta(pautaId: string, campos: Partial<PautaCalendario>) {
    setProposta((atual) => (atual ? { ...atual, pautas: atual.pautas.map((p) => (p.id === pautaId ? { ...p, ...campos } : p)) } : atual))
  }

  const aprovada = proposta?.status === 'aprovado'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-7" onClick={() => mudarMes(-1)} disabled={buscando}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-7" onClick={() => mudarMes(1)} disabled={buscando}>
              <ChevronRight className="size-4" />
            </Button>
            <CardTitle className="ml-1">Proposta do mês — {formatarMesAno(ano, mes)}</CardTitle>
            <InfoTooltip texto="A IA propõe o mês inteiro de uma vez (frequência + uma pauta por publicação). Nenhuma pauta vira post de verdade até você aprovar a proposta inteira. Use as setas pra navegar entre meses." />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={gerar} disabled={gerando || aprovada}>
              {gerando ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {proposta ? 'Gerar de novo' : 'Gerar proposta do mês'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!proposta && <p className="text-sm text-muted-foreground">Nenhuma proposta pra {formatarMesAno(ano, mes)} ainda. Gere pra ver o mês inteiro de uma vez.</p>}

        {proposta && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium line-clamp-1">{proposta.frequenciaJustificativa}</span>
              <span className="text-xs text-muted-foreground">
                {proposta.totalPautas} publicaç{proposta.totalPautas === 1 ? 'ão' : 'ões'} planejada{proposta.totalPautas === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {aprovada ? (
                <Badge className="bg-emerald-600/15 text-emerald-600 border-emerald-600/30">Aprovado</Badge>
              ) : (
                <Badge variant="outline">Rascunho</Badge>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ver pautas
                  </Button>
                </DialogTrigger>
                {/* Modal em vez de lista inline (achado real do usuário: a lista
                    completa empurrava o calendário-grade lá embaixo da tela,
                    dificultando ver os dois juntos). Cabeçalho + barra de
                    aprovação ficam fixos; só a lista de pautas rola. */}
                <DialogContent className="flex h-[85vh] flex-col sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Pautas de {formatarMesAno(ano, mes)}</DialogTitle>
                  </DialogHeader>

                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{proposta.frequenciaJustificativa}</span>
                      <span className="text-xs text-muted-foreground">
                        {proposta.totalPautas} publicaç{proposta.totalPautas === 1 ? 'ão' : 'ões'} planejada{proposta.totalPautas === 1 ? '' : 's'}
                      </span>
                    </div>
                    {aprovada ? (
                      <Badge className="bg-emerald-600/15 text-emerald-600 border-emerald-600/30">Aprovado — as pautas vão gerar post automaticamente</Badge>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button disabled={aprovando}>{aprovando ? <Loader2 className="size-4 animate-spin" /> : 'Aprovar calendário do mês inteiro'}</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Aprovar o mês inteiro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso cobre as {proposta.totalPautas} pautas de uma vez — nenhuma é aprovada parcialmente. Depois de aprovado, cada pauta gera o post automaticamente
                              perto da data (mesmo mecanismo do calendário sazonal). Pra trocar uma pauta depois, edite ela e informe o motivo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={aprovar}>Aprovar mês inteiro</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                    {proposta.pautas.map((pauta) => (
                      <PautaCard key={pauta.id} perfilId={perfilId} pauta={pauta} propostaAprovada={aprovada} onAtualizada={(campos) => atualizarPauta(pauta.id, campos)} />
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
