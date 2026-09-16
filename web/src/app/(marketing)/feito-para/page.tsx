import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FEITO_PARA } from '../feito-para-dados'

export default function FeitoParaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-20">
      <div className="max-w-xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">Feito para</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          De agências com vários clientes a quem ainda não tem Instagram. O mesmo motor serve públicos diferentes.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4">
        {FEITO_PARA.map((publico) => (
          <Link key={publico.slug} href={`/feito-para/${publico.slug}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <publico.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{publico.titulo}</h3>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{publico.resumo}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 border-t pt-12">
        <Link href="/contato" className={buttonVariants({ size: 'lg' })}>
          Fale com a gente
        </Link>
      </div>
    </div>
  )
}
