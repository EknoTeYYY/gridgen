'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarClock, ChevronLeft, ChevronRight, Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { ANTECEDENCIA_DIAS, CALENDARIO_SAZONAL, diferencaEmDias, TIPOS, type TipoConteudo } from '@gridgen/shared'
import type { DataPersonalizada, Post } from '@/lib/types'
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
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { RedesSociaisIcons } from '@/components/redes-sociais-icons'
import { criarDataPersonalizada, excluirDataPersonalizada } from './actions'

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const TIPO_KEYS = Object.keys(TIPOS) as TipoConteudo[]

interface Evento {
  id: string
  nome: string
  tipo: 'sazonal' | 'personalizada'
  ano: number
  mes: number
  dia: number
  data: Date
  // só em eventos personalizada — id de verdade em DataPersonalizada, pra
  // excluir (o `id` acima é o slug de campanha, prefixado, usado no match
  // com o post gerado — não é o id da linha no banco).
  personalizadaId?: string
}

function chaveDia(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// Mesma "chave de campanha" usada na api (slug + data) — pra achar o post que
// uma ocorrência do calendário já gerou. O post guarda `campanhaData` como
// UTC (é assim que o agendador monta a data), por isso os componentes vêm
// via getUTC*, não getFullYear/getMonth/getDate (que leriam fuso local e
// podiam cair no dia errado perto da meia-noite).
function chaveCampanha(slug: string, ano: number, mes: number, dia: number): string {
  return `${slug}__${ano}-${mes}-${dia}`
}

function ocorrenciasDoAno(ano: number, personalizadas: DataPersonalizada[]): Evento[] {
  const sazonais: Evento[] = CALENDARIO_SAZONAL.map((d) => {
    const { mes, dia } = d.calcular(ano)
    return { id: d.slug, nome: d.nome, tipo: 'sazonal', ano, mes, dia, data: new Date(ano, mes - 1, dia) }
  })
  const proprias: Evento[] = personalizadas.map((p) => ({
    id: `perfil-${p.id}`,
    personalizadaId: p.id,
    nome: p.nome,
    tipo: 'personalizada',
    ano,
    mes: p.mes,
    dia: p.dia,
    data: new Date(ano, p.mes - 1, p.dia),
  }))
  return [...sazonais, ...proprias]
}

function gerarGrade(ano: number, mes: number): Date[] {
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)
  const inicio = new Date(primeiroDia)
  inicio.setDate(inicio.getDate() - inicio.getDay())
  const fim = new Date(ultimoDia)
  fim.setDate(fim.getDate() + (6 - fim.getDay()))

  const dias: Date[] = []
  for (const d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    dias.push(new Date(d))
  }
  return dias
}

function avisarSemPost(evento: Evento) {
  const dias = diferencaEmDias(new Date(), evento.data)
  if (dias < 0) {
    toast.info(`"${evento.nome}" já passou sem gerar post — a geração automática só olha pra frente.`)
  } else if (dias > ANTECEDENCIA_DIAS) {
    toast.info(`O rascunho de "${evento.nome}" é gerado automaticamente ${ANTECEDENCIA_DIAS} dias antes da data — ainda não chegou a hora.`)
  } else {
    toast.info(`Ainda não há post gerado pra "${evento.nome}" — a geração automática deve estar em andamento.`)
  }
}

function corDoStatus(status: Post['status']): string {
  if (status === 'pronto') return 'bg-emerald-500'
  if (status === 'erro') return 'bg-destructive'
  return 'bg-muted-foreground'
}

export function CalendarioMensal({
  perfilId,
  personalizadasIniciais,
  posts,
}: {
  perfilId: string
  personalizadasIniciais: DataPersonalizada[]
  posts: Post[]
}) {
  const router = useRouter()
  const hoje = useMemo(() => new Date(), [])
  const [mesVisivel, setMesVisivel] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [dia, setDia] = useState('1')
  const [tipoSugerido, setTipoSugerido] = useState<TipoConteudo>('produtos_servicos')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, startSalvar] = useTransition()
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  const grade = useMemo(() => gerarGrade(mesVisivel.getFullYear(), mesVisivel.getMonth()), [mesVisivel])

  const postsPorCampanha = useMemo(() => {
    const mapa = new Map<string, Post>()
    for (const post of posts) {
      if (!post.campanhaSlug || !post.campanhaData) continue
      const d = new Date(post.campanhaData)
      mapa.set(chaveCampanha(post.campanhaSlug, d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()), post)
    }
    return mapa
  }, [posts])

  // Data/hora de publicação escolhida pelo usuário — diferente da campanha
  // (que é sobre quando GERAR o rascunho): aqui é sobre quando o post
  // finalizado deve ir pro ar, e usa componentes locais (não UTC), já que
  // vem direto de um <input datetime-local> sem nenhum agendador de servidor
  // envolvido no meio.
  const postsAgendadosPorDia = useMemo(() => {
    const mapa = new Map<string, Post[]>()
    for (const post of posts) {
      if (!post.agendadoPara) continue
      const d = new Date(post.agendadoPara)
      const chave = chaveDia(d)
      mapa.set(chave, [...(mapa.get(chave) ?? []), post])
    }
    // Ordem cronológica dentro do dia — sem isso, os chips apareciam na ordem
    // de criação do post, não na ordem em que vão sair, confundindo a leitura
    // do horário.
    for (const lista of mapa.values()) {
      lista.sort((a, b) => new Date(a.agendadoPara!).getTime() - new Date(b.agendadoPara!).getTime())
    }
    return mapa
  }, [posts])

  const eventosPorDia = useMemo(() => {
    const anos = new Set(grade.map((d) => d.getFullYear()))
    const eventos = [...anos].flatMap((ano) => ocorrenciasDoAno(ano, personalizadasIniciais))
    const mapa = new Map<string, Evento[]>()
    for (const evento of eventos) {
      const chave = chaveDia(evento.data)
      mapa.set(chave, [...(mapa.get(chave) ?? []), evento])
    }
    return mapa
  }, [grade, personalizadasIniciais])

  function mudarMes(delta: number) {
    setMesVisivel((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1))
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    startSalvar(async () => {
      const resultado = await criarDataPersonalizada(perfilId, {
        nome,
        mes: mesVisivel.getMonth() + 1,
        dia: Number(dia),
        tipoSugerido,
      })
      if (resultado?.erro) {
        setErro(resultado.erro)
        toast.error(resultado.erro)
        return
      }
      setAberto(false)
      setNome('')
      setDia('1')
      toast.success('Data adicionada.')
      router.refresh()
    })
  }

  async function excluir(id: string) {
    setExcluindoId(id)
    try {
      const resultado = await excluirDataPersonalizada(perfilId, id)
      if (resultado?.erro) {
        toast.error(resultado.erro)
        return
      }
      router.refresh()
    } finally {
      setExcluindoId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => mudarMes(-1)}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" onClick={() => mudarMes(1)}>
            <ChevronRight />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMesVisivel(new Date(hoje.getFullYear(), hoje.getMonth(), 1))}>
            Hoje
          </Button>
          <h2 className="ml-2 text-lg font-semibold capitalize">
            {MESES[mesVisivel.getMonth()]} de {mesVisivel.getFullYear()}
          </h2>
        </div>

        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus />
              Nova data personalizada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova data personalizada</DialogTitle>
            </DialogHeader>
            <form onSubmit={salvar} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  placeholder="ex.: Aniversário da empresa"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Mês</Label>
                  <Select
                    value={String(mesVisivel.getMonth() + 1)}
                    onValueChange={(v) => setMesVisivel(new Date(mesVisivel.getFullYear(), Number(v) - 1, 1))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((nomeMes, i) => (
                        <SelectItem key={nomeMes} value={String(i + 1)}>
                          {nomeMes}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dia">Dia</Label>
                  <Input id="dia" type="number" min={1} max={31} value={dia} onChange={(e) => setDia(e.target.value)} required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Tipo de conteúdo sugerido</Label>
                <Select value={tipoSugerido} onValueChange={(v) => setTipoSugerido(v as TipoConteudo)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {TIPOS[k].nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {erro && <p className="text-sm text-destructive">{erro}</p>}
              <DialogFooter>
                <Button type="submit" disabled={salvando}>
                  {salvando && <Loader2 className="animate-spin" />}
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          Calendário sazonal (todos os Perfis)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500" />
          Personalizada deste Perfil
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          Já tem post gerado
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3 text-primary" />
          Aviso de publicação
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grade.map((d) => {
            const doMesAtual = d.getMonth() === mesVisivel.getMonth()
            const ehHoje = chaveDia(d) === chaveDia(hoje)
            const eventos = eventosPorDia.get(chaveDia(d)) ?? []
            const agendados = postsAgendadosPorDia.get(chaveDia(d)) ?? []
            return (
              <div
                key={d.toISOString()}
                className={cn(
                  'flex min-h-[70px] flex-col gap-0.5 border-r border-b p-1 last:border-r-0',
                  !doMesAtual && 'bg-muted/20',
                )}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full text-xs',
                    ehHoje ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground',
                    !doMesAtual && !ehHoje && 'opacity-50',
                  )}
                >
                  {d.getDate()}
                </span>
                <div className="flex flex-col gap-0.5">
                  {eventos.map((evento) => {
                    const post = postsPorCampanha.get(chaveCampanha(evento.id, evento.ano, evento.mes, evento.dia))
                    return (
                      <div
                        key={evento.id}
                        className={cn(
                          'flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] leading-tight',
                          evento.tipo === 'sazonal'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
                        )}
                      >
                        {post && <span className={cn('size-1.5 shrink-0 rounded-full', corDoStatus(post.status))} />}
                        {post ? (
                          <Link
                            href={`/dashboard/perfis/${perfilId}/posts?post=${post.id}`}
                            className="flex min-w-0 flex-1 items-center gap-1 truncate hover:underline"
                            title={`${evento.nome} — abrir post`}
                          >
                            <span className="min-w-0 flex-1 truncate">{evento.nome}</span>
                            <RedesSociaisIcons saidas={post.saidas} tamanho="size-2.5" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => avisarSemPost(evento)}
                            className="min-w-0 flex-1 truncate text-left"
                            title={`${evento.nome} — ainda sem post gerado`}
                          >
                            {evento.nome}
                          </button>
                        )}
                        {evento.personalizadaId && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                disabled={excluindoId === evento.personalizadaId}
                                className="shrink-0 opacity-70 hover:text-destructive hover:opacity-100"
                              >
                                {excluindoId === evento.personalizadaId ? (
                                  <Loader2 className="size-2.5 animate-spin" />
                                ) : (
                                  <X className="size-2.5" />
                                )}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir "{evento.nome}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa data personalizada deixa de gerar posts automaticamente. Posts já gerados por
                                  ela continuam salvos normalmente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => excluir(evento.personalizadaId!)}
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )
                  })}
                  {agendados.map((post) => {
                    const hora = new Date(post.agendadoPara!).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    return (
                      <Link
                        key={post.id}
                        href={`/dashboard/perfis/${perfilId}/posts?post=${post.id}`}
                        className="flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[11px] leading-tight text-primary hover:underline"
                        title={`Aviso de publicação pra ${hora}`}
                      >
                        <CalendarClock className="size-2.5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-semibold">{hora}</span> · {post.slug}
                        </span>
                        <RedesSociaisIcons saidas={post.saidas} tamanho="size-2.5" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
