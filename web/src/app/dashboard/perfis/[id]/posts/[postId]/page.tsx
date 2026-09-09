import { ArrowLeft, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { Post } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { ExcluirPostButton } from '../excluir-post-button'
import { PostStatus } from './post-status'

export default async function PostDetalhePage({ params }: { params: Promise<{ id: string; postId: string }> }) {
  const { id: perfilId, postId } = await params

  let post: Post
  try {
    post = await serverFetch<Post>(`/posts/${postId}`)
  } catch (err) {
    if (err instanceof ServerFetchError && err.status === 404) notFound()
    throw err
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/dashboard/perfis/${perfilId}/posts`}
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-3" />
            voltar pros posts
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{post.slug}</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground capitalize">
              {post.tipo} · {post.formato}
            </p>
            {post.campanhaNome && (
              <Badge variant="secondary" className="gap-1">
                <CalendarDays className="size-3" />
                {post.campanhaNome}
              </Badge>
            )}
          </div>
        </div>
        <ExcluirPostButton perfilId={perfilId} postId={post.id} titulo={post.slug} voltarParaLista />
      </div>
      <PostStatus postInicial={post} />
    </div>
  )
}
