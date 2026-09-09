import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RECURSOS } from '../recursos-dados'

export default function RecursosPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-24 pb-20">
      <div className="max-w-xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">Recursos</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Pensado pra quem produz conteúdo pra mais de uma marca, e funciona igual bem pra quem cuida só da
          própria.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {RECURSOS.map((recurso) => (
          <Link key={recurso.slug} href={`/recursos/${recurso.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <recurso.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{recurso.titulo}</h3>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{recurso.resumo}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 border-t pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Sobre publicar nas redes</h2>
        <p className="max-w-lg text-muted-foreground">
          No horário agendado, você recebe um e-mail com o link do post pronto, já com as imagens pra baixar e a
          legenda pra copiar.
        </p>
        <Link href="/contato" className={buttonVariants({ size: 'lg' })}>
          Fale com a gente
        </Link>
      </div>
    </div>
  )
}
