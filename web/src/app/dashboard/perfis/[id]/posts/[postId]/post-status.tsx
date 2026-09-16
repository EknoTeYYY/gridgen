'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageIcon, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { camposFaltando, CAMPOS_POR_LAYOUT, type ItemGrafico, type Slide } from '@gridgen/shared'
import type { Post } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GraficoBarrasField } from '@/components/form/grafico-barras-field'
import { PhotoSlideField } from '@/components/form/photo-slide-field'
import { redeAtivaResolvida, type RedeSocial } from '@/components/redes-sociais-icons'
import { PostProntoDetalhe } from '../post-pronto-detalhe'
import { RedesPublicacao } from '../redes-publicacao'

const STATUS_LABEL: Record<Post['status'], string> = {
  rascunho: 'Rascunho — revise antes de gerar',
  gerando: 'Gerando…',
  pronto: 'Pronto',
  erro: 'Erro ao gerar',
}

function valorTexto(valor: unknown): string {
  return typeof valor === 'string' || typeof valor === 'number' ? String(valor) : ''
}

function chaveCampo(slideIndex: number, campo: string): string {
  return `${slideIndex}-${campo}`
}

export function PostStatus({
  postInicial,
  titulo,
  subtitulo,
  onFechar,
  onExcluido,
}: {
  postInicial: Post
  titulo?: string
  subtitulo?: string
  onFechar?: () => void
  onExcluido?: () => void
}) {
  const router = useRouter()
  const [post, setPost] = useState<Post>(postInicial)
  const [caption, setCaption] = useState(postInicial.caption)
  const [hashtags, setHashtags] = useState(postInicial.hashtags)
  const [slides, setSlides] = useState<Slide[]>(postInicial.slides)
  const [camposInvalidos, setCamposInvalidos] = useState<Set<string>>(new Set())
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [redeAtiva, setRedeAtiva] = useState<RedeSocial | null>(null)
  // O formulário de edição do Instagram (legenda + slides, abaixo) só faz
  // sentido quando a aba Instagram está ativa — senão duplicava o mesmo
  // conteúdo que já aparece dentro do card da rede (achado real do
  // usuário: "os cards estão duplicados... os 2 formatos misturados no
  // mesmo toggle").
  const ehInstagramAtivo = redeAtivaResolvida(post.saidas, redeAtiva) === 'instagram'

  useEffect(() => {
    if (post.status !== 'gerando') return
    const intervalo = setInterval(async () => {
      const res = await fetch(`/api/posts/${post.id}`, { cache: 'no-store' })
      if (res.ok) {
        const atualizado = (await res.json()) as Post
        if (atualizado.status === 'pronto') {
          toast.success('Post gerado com sucesso.')
          // Nessa página cheia (formulário de edição), um post que acabou de
          // ficar pronto não deve continuar sendo exibido aqui — vai pra
          // grade, que abre ele na modal (melhor visualização). Dentro da
          // própria modal (`onFechar` presente) não navega: já troca pro
          // painel de 2 colunas no lugar, sem sair da tela.
          if (!onFechar) {
            router.push(`/dashboard/perfis/${atualizado.perfilId}/posts?post=${atualizado.id}`)
            return
          }
        }
        if (atualizado.status === 'erro') toast.error('Falha ao gerar o post — veja o detalhe abaixo.')
        // A troca de "gerando" pra "pronto"/"erro" muda a contagem de
        // Aprovações — isso é estado do servidor (layout do dashboard),
        // setPost sozinho não avisa o sidebar.
        if (atualizado.status !== 'gerando') router.refresh()
        setPost(atualizado)
      }
    }, 2000)
    return () => clearInterval(intervalo)
  }, [post.status, post.id, onFechar, router])

  function atualizarSlide(i: number, campo: keyof Slide, valor: unknown) {
    setSlides((atual) => atual.map((s, idx) => (idx === i ? { ...s, [campo]: valor } : s)))
    setCamposInvalidos((atual) => {
      if (!atual.has(chaveCampo(i, campo))) return atual
      const novo = new Set(atual)
      novo.delete(chaveCampo(i, campo))
      return novo
    })
  }

  async function salvarEGerar() {
    setErro(null)

    const faltando = camposFaltando(slides)
    if (faltando.length > 0) {
      setCamposInvalidos(new Set(faltando.map((f) => chaveCampo(f.slideIndex, f.campo))))
      const mensagem = `Preencha antes de gerar: ${faltando.map((f) => `slide ${f.slideIndex + 1} "${f.label}"`).join(', ')}.`
      setErro(mensagem)
      toast.error('Faltam campos obrigatórios — veja os campos marcados em vermelho.')
      return
    }
    setCamposInvalidos(new Set())

    setEnviando(true)
    try {
      const patchRes = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, hashtags, slides }),
      })
      const patchData = await patchRes.json()
      if (!patchRes.ok) {
        setErro(patchData.erro || 'falha ao salvar as alterações')
        toast.error(patchData.erro || 'falha ao salvar as alterações')
        return
      }

      const gerarRes = await fetch(`/api/posts/${post.id}/gerar`, { method: 'POST' })
      if (!gerarRes.ok) {
        const gerarData = await gerarRes.json().catch(() => null)
        const mensagem = gerarData?.detalhes?.join(', ') || gerarData?.erro || 'falha ao iniciar a geração'
        setErro(mensagem)
        toast.error(mensagem)
        setPost(patchData)
        return
      }
      setPost({ ...patchData, status: 'gerando' })
    } finally {
      setEnviando(false)
    }
  }

  if (post.status === 'pronto') {
    return (
      <PostProntoDetalhe
        postInicial={post}
        perfilId={post.perfilId}
        titulo={titulo}
        subtitulo={subtitulo}
        mostrarExcluir={!!onFechar}
        onFechar={onFechar}
        onExcluido={onExcluido}
      />
    )
  }

  const editavel = post.status === 'rascunho' || post.status === 'erro'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={post.status === 'erro' ? 'destructive' : 'secondary'} className="gap-1">
          {post.status === 'gerando' && <Loader2 className="size-3 animate-spin" />}
          {STATUS_LABEL[post.status]}
        </Badge>

        {editavel && (
          <Button size="sm" onClick={salvarEGerar} disabled={enviando}>
            {enviando ? <Loader2 className="animate-spin" /> : post.status === 'erro' ? <RefreshCw /> : <Sparkles />}
            {enviando ? 'Enviando…' : post.status === 'erro' ? 'Salvar e tentar de novo' : 'Gerar imagens'}
          </Button>
        )}

        {post.status === 'gerando' && (
          <span className="text-xs text-muted-foreground">atualizando automaticamente…</span>
        )}
      </div>

      <RedesPublicacao post={post} onPostChange={setPost} redeAtiva={redeAtiva} onRedeAtivaChange={setRedeAtiva} />

      {post.status === 'erro' && post.renderJobs?.[0]?.erroMsg && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {post.renderJobs[0].erroMsg}
        </p>
      )}
      {erro && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>}

      {editavel && ehInstagramAtivo && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="caption">Legenda</Label>
              <Textarea id="caption" className="min-h-32" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input id="hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {editavel && ehInstagramAtivo && (
        <div className="flex flex-col gap-4">
          {slides.map((slide, i) => (
            <Card key={i}>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <Badge variant="secondary" className="font-mono">
                  {i + 1}
                </Badge>
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {slide.layout}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {(CAMPOS_POR_LAYOUT[slide.layout] ?? []).map((campo) => {
                  const valorAtual = slide[campo.nome]
                  const invalido = camposInvalidos.has(chaveCampo(i, campo.nome))

                  if (campo.tipo === 'foto') {
                    return (
                      <PhotoSlideField
                        key={campo.nome}
                        perfilId={post.perfilId}
                        label={campo.label}
                        value={typeof valorAtual === 'string' ? valorAtual : ''}
                        onChange={(valor) => atualizarSlide(i, campo.nome, valor)}
                        ehCapa={slide.full === true}
                      />
                    )
                  }
                  if (campo.tipo === 'grafico-itens') {
                    return (
                      <GraficoBarrasField
                        key={campo.nome}
                        label={campo.label}
                        value={valorAtual as ItemGrafico[] | undefined}
                        onChange={(valor) => atualizarSlide(i, campo.nome, valor)}
                      />
                    )
                  }
                  if (campo.tipo === 'lista') {
                    return (
                      <div key={campo.nome} className="flex flex-col gap-1.5">
                        <Label>{campo.label}</Label>
                        <Textarea
                          aria-invalid={invalido}
                          className="min-h-24"
                          value={Array.isArray(valorAtual) ? valorAtual.join('\n') : ''}
                          onChange={(e) => atualizarSlide(i, campo.nome, e.target.value.split('\n'))}
                        />
                      </div>
                    )
                  }
                  if (campo.tipo === 'texto-longo') {
                    return (
                      <div key={campo.nome} className="flex flex-col gap-1.5">
                        <Label>{campo.label}</Label>
                        <Textarea
                          aria-invalid={invalido}
                          maxLength={campo.maxLength}
                          className="min-h-16"
                          value={valorTexto(valorAtual)}
                          onChange={(e) => atualizarSlide(i, campo.nome, e.target.value)}
                        />
                      </div>
                    )
                  }
                  return (
                    <div key={campo.nome} className="flex flex-col gap-1.5">
                      <Label>{campo.label}</Label>
                      <Input
                        aria-invalid={invalido}
                        maxLength={campo.maxLength}
                        value={valorTexto(valorAtual)}
                        onChange={(e) => atualizarSlide(i, campo.nome, e.target.value)}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {post.status === 'gerando' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="size-4" />
          as imagens aparecem aqui assim que o render terminar
        </div>
      )}
    </div>
  )
}
