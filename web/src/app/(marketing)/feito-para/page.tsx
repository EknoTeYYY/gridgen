import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { GlowCard, GlowCardIcon } from '@/components/marketing/glow-card'
import { ScrollReveal } from '@/components/marketing/scroll-reveal'
import { SectionBackground } from '@/components/marketing/section-background'
import { FEITO_PARA } from '../feito-para-dados'

export default function FeitoParaPage() {
  return (
    <div className="relative overflow-hidden">
      <SectionBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 pb-20">
        <ScrollReveal type="fade-up" className="max-w-xl">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance">Feito para</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            De agências com vários clientes a quem ainda não tem Instagram. O mesmo motor serve públicos diferentes.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-4">
          {FEITO_PARA.map((publico, i) => (
            <ScrollReveal key={publico.slug} type="fade-up" delay={((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6}>
              <Link href={`/feito-para/${publico.slug}`} className="block">
                <GlowCard className="flex-row items-center gap-4">
                  <GlowCardIcon icon={publico.icon} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading font-bold">{publico.titulo}</h3>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{publico.resumo}</p>
                  </div>
                </GlowCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 border-t pt-12">
          <Link href="/contato" className={buttonVariants({ variant: 'cta' })}>
            Fale com a gente
          </Link>
        </div>
      </div>
    </div>
  )
}
