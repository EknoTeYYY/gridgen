'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, ChevronLeft, ChevronRight, Copy, Download, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Post } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RedeSocial } from '@/components/redes-sociais-icons'
import { cn } from '@/lib/utils'
import { ExcluirPostButton } from './excluir-post-button'
import { RedesPublicacao } from './redes-publicacao'

const STATUS_LABEL: Record<Post['status'], string> = {
  rascunho: 'Rascunho — revise antes de gerar',
  gerando: 'Gerando…',
  pronto: 'Pronto',
  erro: 'Erro ao gerar',
}

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success('Copiado.')
  } catch {
    toast.error('não foi possível copiar')
  }
}

function paraInputLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatarAgendamento(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
}

export function CarrosselImagens({
  postId,
  canal,
  imagens,
}: {
  postId: string
  canal?: RedeSocial
  imagens: string[]
}) {
  const [indice, setIndice] = useState(0)
  if (imagens.length === 0) return null
  const nome = imagens[indice]
  const src = canal ? `/api/posts/${postId}/canais/${canal}/arquivos/${nome}` : `/api/posts/${postId}/arquivos/${nome}`

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-lg border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Slide ${indice + 1} de ${imagens.length}`}
          className="max-h-[480px] w-full object-contain"
        />
        {imagens.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndice((i) => (i - 1 + imagens.length) % imagens.length)}
              className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Slide anterior</span>
            </button>
            <button
              type="button"
              onClick={() => setIndice((i) => (i + 1) % imagens.length)}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Próximo slide</span>
            </button>
            <span className="absolute right-2 bottom-2 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
              {indice + 1} / {imagens.length}
            </span>
          </>
        )}
      </div>
      {imagens.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {imagens.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setIndice(i)}
              className={cn('size-1.5 rounded-full transition-colors', i === indice ? 'bg-primary' : 'bg-muted-foreground/30')}
            >
              <span className="sr-only">Ir pro slide {i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Visão de um post já pronto — usada tanto dentro do modal aberto a
// partir da grade de posts (com `titulo`/`onFechar`) quanto na página cheia
// do post, reaproveitada pelo `PostStatus` quando o status já não é mais
// editável (sem `titulo`, porque a página já mostra o próprio cabeçalho).
export function PostProntoDetalhe({
  postInicial,
  perfilId,
  titulo,
  subtitulo,
  mostrarExcluir = true,
  onFechar,
  onExcluido,
}: {
  postInicial: Post
  perfilId: string
  titulo?: string
  subtitulo?: string
  mostrarExcluir?: boolean
  onFechar?: () => void
  onExcluido?: () => void
}) {
  const router = useRouter()
  const [post, setPost] = useState<Post>(postInicial)
  const [agendamentoInput, setAgendamentoInput] = useState(postInicial.agendadoPara ? paraInputLocal(postInicial.agendadoPara) : '')
  const [agendando, setAgendando] = useState(false)
  const [redeAtiva, setRedeAtiva] = useState<RedeSocial | null>(null)

  async function agendar(agendadoPara: string | null) {
    setAgendando(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/agendar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendadoPara }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.erro || 'falha ao agendar o aviso')
        return
      }
      // A resposta do PATCH é o post "cru" do Prisma, sem `arquivos`/`saidas`
      // (só a rota de detalhe completa devolve isso) — busca de novo, mesmo
      // padrão já usado por alternarRede/adaptarPara, pra não zerar o
      // carrossel e as redes marcadas na tela.
      const atualizado = await fetch(`/api/posts/${post.id}`, { cache: 'no-store' })
      if (atualizado.ok) setPost(await atualizado.json())
      setAgendamentoInput(data.agendadoPara ? paraInputLocal(data.agendadoPara) : '')
      toast.success(agendadoPara ? 'Aviso agendado.' : 'Aviso removido.')
      router.refresh()
    } finally {
      setAgendando(false)
    }
  }

  const imagens = (post.arquivos ?? []).filter((nome) => nome.endsWith('.png'))
  // Só a modal (posts-grid.tsx) passa `onFechar` — é o sinal de que este
  // componente está dentro de um container de altura fixa e precisa que as
  // duas colunas rolem cada uma na sua, em vez de dividir uma rolagem só (o
  // que fazia sobrar espaço vazio quando uma coluna era mais curta, ou
  // espremer tudo quando a outra crescia — "o mesmo problema de antes",
  // como o usuário apontou depois de ver a primeira versão da modal).
  const dentroDeModal = !!onFechar

  return (
    <div className={cn('flex flex-col gap-6', dentroDeModal && 'h-full min-h-0')}>
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          {titulo && <h2 className="text-xl font-semibold tracking-tight">{titulo}</h2>}
          {subtitulo && <p className="text-sm text-muted-foreground">{subtitulo}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge className="gap-1 border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
            {STATUS_LABEL[post.status]}
          </Badge>
          <Button size="sm" variant="outline" asChild>
            <a href={`/api/posts/${post.id}/download`} download>
              <Download />
              Baixar post
            </a>
          </Button>
          {mostrarExcluir && (
            <ExcluirPostButton perfilId={perfilId} postId={post.id} titulo={post.slug} onExcluido={onExcluido} />
          )}
          {onFechar && (
            <Button type="button" variant="ghost" size="icon" onClick={onFechar}>
              <X />
              <span className="sr-only">Fechar</span>
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-6 lg:grid-cols-2',
          dentroDeModal && 'min-h-0 flex-1 overflow-hidden',
        )}
      >
        {/* Esquerda: imagens + legenda geral */}
        <div className={cn('flex flex-col gap-4', dentroDeModal && 'min-h-0 overflow-y-auto pr-1')}>
          <CarrosselImagens postId={post.id} imagens={imagens} />

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <p className="text-sm font-semibold">Legenda</p>
              <Button variant="ghost" size="sm" onClick={() => copiar(`${post.caption}\n\n${post.hashtags}`)}>
                <Copy />
                Copiar
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm whitespace-pre-wrap">
                {post.caption || <span className="text-muted-foreground">(sem legenda)</span>}
              </p>
              {post.hashtags && <p className="text-sm text-primary">{post.hashtags}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Direita: aviso de publicação, redes */}
        <div className={cn('flex flex-col gap-4', dentroDeModal && 'min-h-0 overflow-y-auto pr-1')}>
          <Card>
            <CardHeader className="space-y-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <CalendarClock className="size-4" />
                  Aviso de publicação
                </p>
                {post.agendadoPara && (
                  <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                    Aviso agendado pra {formatarAgendamento(post.agendadoPara)}
                  </Badge>
                )}
                {post.avisoAgendamentoEnviadoEm && (
                  <Badge variant="outline" className="gap-1 border-emerald-600/30 text-emerald-700 dark:text-emerald-400">
                    Aviso enviado em {formatarAgendamento(post.avisoAgendamentoEnviadoEm)}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Escolha quando você planeja publicar esse post — nesse horário a gente manda um e-mail com o link,
                pra você baixar as imagens e copiar a legenda.
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="agendadoPara">Data e hora</Label>
                <Input
                  id="agendadoPara"
                  type="datetime-local"
                  className="w-fit"
                  value={agendamentoInput}
                  onChange={(e) => setAgendamentoInput(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                disabled={agendando || !agendamentoInput}
                onClick={() => agendar(new Date(agendamentoInput).toISOString())}
              >
                {agendando ? <Loader2 className="animate-spin" /> : <CalendarClock />}
                {post.agendadoPara ? 'Atualizar aviso' : 'Agendar aviso'}
              </Button>
              {post.agendadoPara && (
                <Button size="sm" variant="ghost" disabled={agendando} onClick={() => agendar(null)}>
                  <X />
                  Remover aviso
                </Button>
              )}
            </CardContent>
          </Card>

          <RedesPublicacao post={post} onPostChange={setPost} redeAtiva={redeAtiva} onRedeAtivaChange={setRedeAtiva} />
        </div>
      </div>
    </div>
  )
}
