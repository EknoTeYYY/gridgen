import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { FEITO_PARA } from '../../feito-para-dados'

export function generateStaticParams() {
  return FEITO_PARA.map((publico) => ({ slug: publico.slug }))
}

export default async function FeitoParaDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const publico = FEITO_PARA.find((p) => p.slug === slug)
  if (!publico) notFound()

  const outros = FEITO_PARA.filter((p) => p.slug !== slug)

  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-20">
      <Link href="/feito-para" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Feito para quem mais?
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <publico.icon className="size-6" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{publico.titulo}</h1>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">{publico.resumo}</p>

      <p className="mt-8 max-w-2xl leading-relaxed text-muted-foreground">{publico.detalhe}</p>

      <ul className="mt-8 flex flex-col gap-3">
        {publico.pontos.map((ponto) => (
          <li key={ponto} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {ponto}
          </li>
        ))}
      </ul>

      <div className="mt-12 border-t pt-10">
        <Link href="/contato" className={buttonVariants({ size: 'lg' })}>
          Fale com a gente
        </Link>
      </div>

      <div className="mt-16 border-t pt-10">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Também é feito para</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {outros.map((p) => (
            <Link
              key={p.slug}
              href={`/feito-para/${p.slug}`}
              className="rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
            >
              <p.icon className="size-4 text-muted-foreground" />
              <p className="mt-2 font-medium">{p.titulo}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
