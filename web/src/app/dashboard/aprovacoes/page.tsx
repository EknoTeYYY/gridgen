import { BellRing, CalendarDays, Folder } from 'lucide-react'
import Link from 'next/link'
import { serverFetch } from '@/lib/session'
import type { Post } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default async function AprovacoesPage() {
  const pendentes = await serverFetch<Post[]>('/posts/pendentes')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Aprovações pendentes</h1>
        <p className="text-sm text-muted-foreground">
          Posts prontos aguardando envio, e rascunhos que o calendário sazonal gerou sozinho e ainda precisam da sua
          revisão.
        </p>
      </div>

      {pendentes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <BellRing className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Nada pendente por aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pendentes.map((post) => {
            const pronto = post.status === 'pronto'
            const comFalha = post.status === 'erro'
            return (
              <Link key={post.id} href={`/dashboard/perfis/${post.perfilId}/posts?post=${post.id}`}>
                <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
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
                  <CardContent className="flex flex-col gap-1.5 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{post.slug}</p>
                      <Badge
                        variant={pronto ? undefined : comFalha ? 'destructive' : 'secondary'}
                        className={
                          pronto ? 'border-transparent bg-emerald-600/15 text-emerald-700 dark:text-emerald-400' : undefined
                        }
                      >
                        {pronto ? 'Pronto' : comFalha ? 'Geração falhou' : 'Revisar rascunho'}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{post.perfil?.nome}</p>
                    {post.campanhaNome && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3" />
                        {post.campanhaNome}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
