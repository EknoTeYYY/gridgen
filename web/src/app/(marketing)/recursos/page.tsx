import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { GlowCard, GlowCardIcon } from '@/components/marketing/glow-card'
import { ScrollReveal } from '@/components/marketing/scroll-reveal'
import { SectionBackground } from '@/components/marketing/section-background'
import { RECURSOS } from '../recursos-dados'

export default function RecursosPage() {
  return (
    <div className="relative overflow-hidden">
      <SectionBackground />
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-20">
        <ScrollReveal type="fade-up" className="max-w-xl">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance">Recursos</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Pensado pra quem produz conteúdo pra mais de uma marca, e funciona igual bem pra quem cuida só da
            própria.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {RECURSOS.map((recurso, i) => (
            <ScrollReveal key={recurso.slug} type="fade-up" delay={((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6} className="h-full">
              <Link href={`/recursos/${recurso.slug}`} className="block h-full">
                <GlowCard className="flex-row gap-4">
                  <GlowCardIcon icon={recurso.icon} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading font-bold">{recurso.titulo}</h3>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{recurso.resumo}</p>
                  </div>
                </GlowCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 border-t pt-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Sobre publicar nas redes</h2>
          <p className="max-w-lg text-muted-foreground">
            No horário agendado, você recebe um e-mail com o link do post pronto, já com as imagens pra baixar e a
            legenda pra copiar.
          </p>
          <Link href="/contato" className={buttonVariants({ variant: 'cta' })}>
            Fale com a gente
          </Link>
        </div>
      </div>
    </div>
  )
}
