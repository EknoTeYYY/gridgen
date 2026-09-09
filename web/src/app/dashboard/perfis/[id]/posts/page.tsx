import { Suspense } from 'react'
import { FileStack, Plus } from 'lucide-react'
import Link from 'next/link'
import { serverFetch } from '@/lib/session'
import type { Perfil, Post } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PostsGrid } from './posts-grid'

export default async function PostsDoPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: perfilId } = await params
  const [perfil, posts] = await Promise.all([
    serverFetch<Perfil>(`/perfis/${perfilId}`),
    serverFetch<Post[]>(`/perfis/${perfilId}/posts`),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts — {perfil.nome}</h1>
          <p className="text-sm text-muted-foreground">Conteúdo gerado por IA pra esse perfil.</p>
        </div>
        <Link href={`/dashboard/perfis/${perfilId}/posts/novo`} className={buttonVariants()}>
          <Plus />
          Novo post
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileStack className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Nenhum post ainda pra esse perfil.</p>
            <Link href={`/dashboard/perfis/${perfilId}/posts/novo`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <Plus />
              Novo post
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Suspense>
          <PostsGrid perfilId={perfilId} posts={posts} />
        </Suspense>
      )}
    </div>
  )
}
