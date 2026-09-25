'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2, Pencil, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { TIPOS } from '@gridgen/shared'
import type { PautaCalendario, Post, PropostaCalendario, SaidaEntrega } from '@/lib/types'
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
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/form/info-tooltip'
import { RedesSociaisIcons } from '@/components/redes-sociais-icons'
import { aprovarPropostaMensal, editarPautaMensal, gerarPropostaMensal } from './calendario/actions'
import { proximoMesAno } from './proximo-mes'

function formatarMesAno(ano: number, mes: number): string {
  const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, mes - 1, 1)))
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}

function formatarDataHorario(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(d)
}

// `PautaCalendario.dataHorario` guarda os componentes de data/hora "nus"
// (sem deslocamento de fuso, sempre lidos de volta com `timeZone: 'UTC'` —
// mesma convenção documentada em `calendario.service.ts`), então agrupar por
// dia usa os componentes UTC diretamente, sem risco de virar o dia errado
// perto da meia-noite.
function chaveDia(iso: string): string {
  return iso.slice(0, 10) // "YYYY-MM-DD" — já vem assim do ISO, sem precisar parsear
}

function formatarDiaPill(chave: string): string {
  const [, mes, dia] = chave.split('-')
  return `${dia}/${mes}`
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

// Badge de status do post gerado — cores/texto batem com `StatusBadge` já
// usado na grade de posts, só que num contexto mais compacto (dentro do card
// de pauta, ao lado do preview).
function BadgePostGerado({ status }: { status: Post['status'] | null }) {
  if (status === null) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="size-3 animate-spin" />
        carregando…
      </Badge>
    )
  }
  if (status === 'erro') return <Badge variant="destructive">erro ao gerar</Badge>
  if (status === 'gerando') {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="size-3 animate-spin" />
        gerando post…
      </Badge>
    )
  }
  if (status === 'pronto') return <Badge className="bg-emerald-600/15 text-emerald-600 border-emerald-600/30">post pronto</Badge>
  return <Badge className="bg-emerald-600/15 text-emerald-600 border-emerald-600/30">post já gerado</Badge>
}

// Preview do post já gerado — largura fixa, mas SEM altura própria: o pai
// (`PautaCard`) é `items-stretch`, então a imagem esticha pra acompanhar a
// altura de tudo que tem ao lado (badges + título + abordagem + "ver
// detalhes", e cresce ainda mais quando os detalhes abrem). Achado real do
// usuário: uma miniatura de altura fixa sobrava espaço vazio embaixo dela
// mesma quando o texto ao lado é mais alto — melhor deixar a imagem grande
// de verdade ocupando a coluna toda do que travar numa proporção fixa.
// Mesma rota-ponte já usada na grade de posts (`/api/posts/:id/arquivos/
// 01.png`, só ela sabe ler o cookie httpOnly e montar o Authorization pro
// `<img>` carregar). Clicar leva pro mesmo mecanismo `?post=<id>` que a
// grade de posts já usa pra abrir o post certo.
function PreviewPostGerado({
  perfilId,
  postId,
  status,
  assunto,
}: {
  perfilId: string
  postId: string
  status: Post['status'] | null
  assunto: string
}) {
  const [falhouCarregar, setFalhouCarregar] = useState(false)
  return (
    <Link
      href={`/dashboard/perfis/${perfilId}/posts?post=${postId}`}
      title="Ver post gerado"
      className="flex w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted"
    >
      {status === 'pronto' && !falhouCarregar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/posts/${postId}/arquivos/01.png`}
          alt={assunto}
          className="size-full object-cover"
          onError={() => setFalhouCarregar(true)}
        />
      ) : status === 'erro' || falhouCarregar ? (
        <AlertTriangle className="size-6 text-destructive" />
      ) : (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      )}
    </Link>
  )
}

function PautaCard({
  perfilId,
  pauta,
  statusPost,
  saidasPost,
  propostaAprovada,
  onAtualizada,
}: {
  perfilId: string
  pauta: PautaCalendario
  statusPost: Post['status'] | null
  saidasPost: SaidaEntrega[] | undefined
  propostaAprovada: boolean
  onAtualizada: (atualizada: Partial<PautaCalendario>) => void
}) {
  const [editando, setEditando] = useState(false)
  const [detalhesAbertos, setDetalhesAbertos] = useState(false)
  const bloqueada = Boolean(pauta.postId)

  return (
    <div className="flex items-stretch gap-4 rounded-lg border p-4">
      {pauta.postId && <PreviewPostGerado perfilId={perfilId} postId={pauta.postId} status={statusPost} assunto={pauta.assunto} />}

      {/* Prioriza o "intuito" da pauta (assunto + abordagem, o que se
          pretende fazer e como) — o resto (objetivo/ação/origem) é detalhe
          técnico de justificativa, escondido por padrão. Tudo isso vive
          nesta coluna (não fora dela) de propósito: a imagem ao lado é
          `items-stretch` e cresce pra acompanhar a altura real do que tem
          aqui, inclusive quando os detalhes abrem. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{TIPOS[pauta.tipo]?.nome ?? pauta.tipo}</Badge>
            <span className="text-xs text-muted-foreground">{formatarDataHorario(pauta.dataHorario)}</span>
            {pauta.ocasiao && <Badge variant="secondary">{pauta.ocasiao}</Badge>}
            {bloqueada && <BadgePostGerado status={statusPost} />}
            {bloqueada && <RedesSociaisIcons saidas={saidasPost} incluirInstagram className="ml-0.5" />}
          </div>
          {!bloqueada && !editando && (
            <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setEditando(true)} title="Editar pauta">
              <Pencil className="size-3.5" />
            </Button>
          )}
        </div>
        <p className="text-lg font-semibold leading-snug">{pauta.assunto}</p>
        <p className="text-sm text-muted-foreground">{pauta.abordagem}</p>

        <Button
          variant="ghost"
          size="sm"
          className="mt-1 h-7 w-fit gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => setDetalhesAbertos((v) => !v)}
        >
          {detalhesAbertos ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          {detalhesAbertos ? 'Ocultar detalhes' : 'Ver detalhes'}
        </Button>

        {detalhesAbertos && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
        )}

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
    </div>
  )
}

// Substitui a lista corrida de todas as pautas do mês por uma navegação por
// dia (achado real do usuário: lista inteira em tela ficava densa demais).
// As "abas" são os próprios dias que têm pauta — só eles, não os ~30 dias do
// mês, a maioria vazia. Busca o status de todos os posts já gerados de uma
// vez (não por card) porque a bolinha de status de cada aba também precisa
// dele, não só o card do dia selecionado.
function PautasDoMes({
  perfilId,
  pautas,
  propostaAprovada,
  onAtualizada,
}: {
  perfilId: string
  pautas: PautaCalendario[]
  propostaAprovada: boolean
  onAtualizada: (pautaId: string, campos: Partial<PautaCalendario>) => void
}) {
  const [diaAtivo, setDiaAtivo] = useState<string | null>(null)
  // Guarda status + saidas (pra mostrar os ícones de rede, achado real do
  // usuário: "precisa adicionar a rede que eu senti falta") — os dois num
  // fetch só por post, não dois separados.
  const [dadosPorPost, setDadosPorPost] = useState<Record<string, Pick<Post, 'status' | 'saidas'>>>({})
  const statusPorPost = useMemo(() => Object.fromEntries(Object.entries(dadosPorPost).map(([id, d]) => [id, d.status])), [dadosPorPost])

  const idsComPost = useMemo(() => pautas.map((p) => p.postId).filter((id): id is string => Boolean(id)), [pautas])

  useEffect(() => {
    let cancelado = false
    Promise.all(
      idsComPost.map((id) =>
        fetch(`/api/posts/${id}`, { cache: 'no-store' })
          .then((res) => (res.ok ? res.json() : null))
          .then((post: Post | null) => [id, post] as const)
          .catch(() => [id, null] as const),
      ),
    ).then((resultados) => {
      if (cancelado) return
      setDadosPorPost(
        Object.fromEntries(
          resultados
            .filter((r): r is [string, Post] => Boolean(r[1]))
            .map(([id, post]) => [id, { status: post.status, saidas: post.saidas }]),
        ),
      )
    })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsComPost.join(',')])

  const pautasOrdenadas = useMemo(() => [...pautas].sort((a, b) => a.dataHorario.localeCompare(b.dataHorario)), [pautas])
  const dias = useMemo(() => Array.from(new Set(pautasOrdenadas.map((p) => chaveDia(p.dataHorario)))), [pautasOrdenadas])
  const diaSelecionado = diaAtivo && dias.includes(diaAtivo) ? diaAtivo : (dias[0] ?? null)
  const pautasDoDia = pautasOrdenadas.filter((p) => chaveDia(p.dataHorario) === diaSelecionado)

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 gap-1.5 overflow-x-auto pb-1">
        {dias.map((dia) => {
          const pautasDesseDia = pautasOrdenadas.filter((p) => chaveDia(p.dataHorario) === dia)
          const statusDesseDia = pautasDesseDia.map((p) => (p.postId ? statusPorPost[p.postId] : undefined))
          const cor = statusDesseDia.some((s) => s === 'erro')
            ? 'bg-destructive'
            : statusDesseDia.some((s) => s === 'pronto')
              ? 'bg-emerald-500'
              : statusDesseDia.some((s) => s === 'gerando')
                ? 'bg-amber-500'
                : null
          return (
            <button
              key={dia}
              type="button"
              onClick={() => setDiaAtivo(dia)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                dia === diaSelecionado ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {cor && <span className={cn('size-1.5 rounded-full', cor)} />}
              {formatarDiaPill(dia)}
            </button>
          )
        })}
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {pautasDoDia.map((pauta) => (
          <PautaCard
            key={pauta.id}
            perfilId={perfilId}
            pauta={pauta}
            statusPost={pauta.postId ? (statusPorPost[pauta.postId] ?? null) : null}
            saidasPost={pauta.postId ? dadosPorPost[pauta.postId]?.saidas : undefined}
            propostaAprovada={propostaAprovada}
            onAtualizada={(campos) => onAtualizada(pauta.id, campos)}
          />
        ))}
      </div>
    </div>
  )
}

export function PropostaMensal({ perfilId, propostaInicial }: { perfilId: string; propostaInicial: PropostaCalendario | null }) {
  const [{ ano, mes }, setAnoMes] = useState(proximoMesAno)
  const [proposta, setProposta] = useState<PropostaCalendario | null>(propostaInicial)
  const [buscando, startBusca] = useTransition()
  const [gerando, startGeracao] = useTransition()
  const [aprovando, startAprovacao] = useTransition()

  // Sem toast quando não encontra proposta: o próprio card já mostra "Nenhuma
  // proposta pra {mês} ainda" no CardContent — um toast repetiria a mesma
  // informação. Isso fica mais evidente agora que o card vive na Visão
  // Geral (visitada com muito mais frequência do que a antiga aba de
  // Calendário), onde navegar meses ociosamente empilharia toast à toa.
  //
  // Rota-ponte (fetch comum), não Server Action: é só leitura, e uma Server
  // Action força o Next a rebuscar o RSC da página inteira a cada chamada —
  // visível como a tela toda piscando a cada clique nas setas de mês.
  function buscar(anoAlvo = ano, mesAlvo = mes) {
    startBusca(async () => {
      const res = await fetch(`/api/perfis/${perfilId}/calendario-mensal?ano=${anoAlvo}&mes=${mesAlvo}`, { cache: 'no-store' })
      setProposta(res.ok ? await res.json() : null)
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
        {/* Enquanto busca (troca de mês), mostra um esqueleto em vez de piscar
            "nenhuma proposta ainda" e depois trocar pro conteúdo real — sem
            isso, `setProposta(null)` em `mudarMes` deixava a tela pular
            visivelmente entre os dois estados a cada clique, mais perceptível
            ainda quando o mês seguinte tem uma altura de conteúdo diferente
            (ex.: aprovado com 11 pautas → rascunho com 12). */}
        {buscando && <div className="h-[60px] animate-pulse rounded-lg bg-muted/50" />}

        {!buscando && !proposta && (
          <p className="text-sm text-muted-foreground">Nenhuma proposta pra {formatarMesAno(ano, mes)} ainda. Gere pra ver o mês inteiro de uma vez.</p>
        )}

        {!buscando && proposta && (
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-2xl font-bold tracking-tight">{proposta.totalPautas}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  publicaç{proposta.totalPautas === 1 ? 'ão' : 'ões'} planejada{proposta.totalPautas === 1 ? '' : 's'}
                </span>
                {aprovada ? (
                  <Badge className="gap-1 border-emerald-600/30 bg-emerald-600/15 text-emerald-600">
                    <CheckCircle2 className="size-3" />
                    Aprovado
                  </Badge>
                ) : (
                  <Badge variant="outline">Rascunho</Badge>
                )}
              </div>
              <p className="line-clamp-1 text-sm text-muted-foreground">{proposta.frequenciaJustificativa}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
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
                <DialogContent className="flex h-[85vh] flex-col sm:max-w-6xl">
                  <DialogHeader>
                    <DialogTitle>Pautas de {formatarMesAno(ano, mes)}</DialogTitle>
                  </DialogHeader>

                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-2xl font-bold tracking-tight">{proposta.totalPautas}</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          publicaç{proposta.totalPautas === 1 ? 'ão' : 'ões'} planejada{proposta.totalPautas === 1 ? '' : 's'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{proposta.frequenciaJustificativa}</span>
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

                  <PautasDoMes perfilId={perfilId} pautas={proposta.pautas} propostaAprovada={aprovada} onAtualizada={atualizarPauta} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
