import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { RECURSOS } from '../../recursos-dados'

export function generateStaticParams() {
  return RECURSOS.map((recurso) => ({ slug: recurso.slug }))
}

export default async function RecursoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recurso = RECURSOS.find((r) => r.slug === slug)
  if (!recurso) notFound()

  const outros = RECURSOS.filter((r) => r.slug !== slug)

  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-20">
      <Link href="/recursos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Todos os recursos
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <recurso.icon className="size-6" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{recurso.titulo}</h1>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">{recurso.resumo}</p>

      <p className="mt-8 max-w-2xl leading-relaxed text-muted-foreground">{recurso.detalhe}</p>

      <ul className="mt-8 flex flex-col gap-3">
        {recurso.pontos.map((ponto) => (
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
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Outros recursos</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {outros.map((r) => (
            <Link
              key={r.slug}
              href={`/recursos/${r.slug}`}
              className="rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
            >
              <r.icon className="size-4 text-muted-foreground" />
              <p className="mt-2 font-medium">{r.titulo}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
