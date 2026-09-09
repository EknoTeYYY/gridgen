'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays, Download, Folder, Loader2 } from 'lucide-react'
import type { Post } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { RedesSociaisIcons } from '@/components/redes-sociais-icons'
import { ExcluirPostButton } from './excluir-post-button'
import { PostStatus } from './[postId]/post-status'

const STATUS_LABEL: Record<Post['status'], string> = {
  rascunho: 'Rascunho',
  gerando: 'Gerando…',
  pronto: 'Pronto',
  erro: 'Erro',
}

const TIPO_LABEL: Record<Post['tipo'], string> = {
  ancora: 'Âncora',
  dor: 'Dor',
  prova: 'Prova',
  didatico: 'Didático',
  dado: 'Dado',
  oferta: 'Oferta',
}

function StatusBadge({ status }: { status: Post['status'] }) {
  if (status === 'erro') return <Badge variant="destructive">{STATUS_LABEL[status]}</Badge>
  if (status === 'gerando') {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="size-3 animate-spin" />
        {STATUS_LABEL[status]}
      </Badge>
    )
  }
  if (status === 'pronto') {
    return (
      <Badge className={cn('border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400')}>
        {STATUS_LABEL[status]}
      </Badge>
    )
  }
  return <Badge variant="secondary">{STATUS_LABEL[status]}</Badge>
}

// Só post pronto abre num modal (o painel de 2 colunas, com o
// carrossel de imagens) — rascunho/gerando/erro continuam na página cheia de
// edição, que é um formulário por slide e nunca foi o problema. `?post=<id>`
// é como outras telas (a própria página cheia, quando a geração termina; a
// lista de Aprovações) pedem pra essa grade abrir o post certo — sempre
// verificando o status de verdade antes de decidir modal ou página cheia,
// nunca confiando cegamente em quem apontou o link.
export function PostsGrid({ perfilId, posts }: { perfilId: string; posts: Post[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [postAberto, setPostAberto] = useState<Post | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function abrir(postId: string) {
    setAbertoId(postId)
    setCarregando(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, { cache: 'no-store' })
      if (res.ok) setPostAberto(await res.json())
    } finally {
      setCarregando(false)
    }
  }

  function fechar() {
    setAbertoId(null)
    setPostAberto(null)
    router.refresh()
  }

  useEffect(() => {
    const postId = searchParams.get('post')
    if (!postId) return
    ;(async () => {
      const res = await fetch(`/api/posts/${postId}`, { cache: 'no-store' })
      if (!res.ok) {
        router.replace(`/dashboard/perfis/${perfilId}/posts`)
        return
      }
      const post = (await res.json()) as Post
      if (post.status === 'pronto') {
        setAbertoId(post.id)
        setPostAberto(post)
        router.replace(`/dashboard/perfis/${perfilId}/posts`)
      } else {
        router.replace(`/dashboard/perfis/${perfilId}/posts/${postId}`)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((post) => {
          const pronto = post.status === 'pronto'
          const conteudoCard = (
            <>
              <div className="flex aspect-square items-center justify-center bg-muted">
                {pronto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/posts/${post.id}/arquivos/01.png`}
                    alt={post.slug}
                    className="size-full object-cover"
                  />
                ) : (
                  <Folder className="size-10 text-muted-foreground" strokeWidth={1.5} />
                )}
              </div>
              <CardContent className="flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{post.slug}</p>
                    {post.campanhaNome ? (
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <CalendarDays className="size-3 shrink-0" />
                        {post.campanhaNome}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground capitalize">{post.formato}</p>
                    )}
                  </div>
                  <StatusBadge status={post.status} />
                </div>
                <RedesSociaisIcons saidas={post.saidas} />
              </CardContent>
            </>
          )

          return (
            <Card key={post.id} className="relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
              <div className="absolute top-2 right-2 z-10 flex gap-1">
                {pronto && (
                  <a
                    href={`/api/posts/${post.id}/download`}
                    download
                    title="Baixar post"
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm hover:bg-background dark:hover:bg-background',
                    )}
                  >
                    <Download className="size-4" />
                    <span className="sr-only">Baixar post</span>
                  </a>
                )}
                <ExcluirPostButton
                  perfilId={perfilId}
                  postId={post.id}
                  titulo={post.slug}
                  className="bg-background/80 backdrop-blur-sm hover:bg-background dark:hover:bg-background"
                />
              </div>
              {pronto ? (
                <button type="button" onClick={() => abrir(post.id)} className="block w-full text-left">
                  {conteudoCard}
                </button>
              ) : (
                <Link href={`/dashboard/perfis/${perfilId}/posts/${post.id}`}>{conteudoCard}</Link>
              )}
            </Card>
          )
        })}
      </div>

      <Dialog open={abertoId !== null} onOpenChange={(aberto) => !aberto && fechar()}>
        <DialogContent
          className="flex h-[85vh] max-h-[85vh] flex-col overflow-hidden sm:max-w-6xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Detalhes do post</DialogTitle>
          {carregando || !postAberto ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PostStatus
              postInicial={postAberto}
              titulo={postAberto.slug}
              subtitulo={`${TIPO_LABEL[postAberto.tipo]} · ${postAberto.formato}`}
              onFechar={fechar}
              onExcluido={fechar}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
