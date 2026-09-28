import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { PACOTE_EXTRA, PILOTO_DIAS, PLANOS, REGENERACOES_GRATIS_POR_POST, type PlanoId } from '@gridgen/shared'
import { buttonVariants } from '@/components/ui/button'
import { GlowCard } from '@/components/marketing/glow-card'
import { ScrollReveal } from '@/components/marketing/scroll-reveal'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Planos',
  description: 'Planos do Gridgen para pequenas empresas, social medias e agências. Comece com um piloto gratuito.',
}

const PLANOS_PAGOS: PlanoId[] = ['essencial', 'profissional', 'agencia']

const PERGUNTAS = [
  {
    pergunta: 'O que conta como uma geração?',
    resposta:
      'Cada peça pronta criada pela IA: um carrossel de até 8 telas, uma sequência de stories, uma thread ou um gráfico. Cada adaptação da peça para outra rede (LinkedIn, TikTok) conta como mais uma geração.',
  },
  {
    pergunta: 'Refazer um conteúdo consome gerações?',
    resposta: `Editar o texto de um post nunca consome. Refazer a adaptação de uma rede não conta até ${REGENERACOES_GRATIS_POR_POST} vezes por post.`,
  },
  {
    pergunta: 'O que acontece quando as gerações do mês acabam?',
    resposta: `O Gridgen avisa quando o uso passa de 80% do plano. Ao chegar no limite, novas gerações ficam pausadas até o próximo ciclo, a menos que você adicione um pacote de +${PACOTE_EXTRA.geracoes} gerações ou mude de plano. Nada do que já foi criado é perdido.`,
  },
  {
    pergunta: 'Como funciona o piloto?',
    resposta: `São ${PILOTO_DIAS} dias com 1 Perfil e ${PLANOS.piloto.geracoesMes} gerações, sem custo, com a implantação feita junto com o time da Eknotech. Ao final, você escolhe o plano que faz sentido para o seu volume.`,
  },
  {
    pergunta: 'Como é feita a cobrança?',
    resposta: 'Mensal, por boleto ou PIX. Planos trimestrais e anuais têm condição especial; fale com o time comercial.',
  },
  {
    pergunta: 'A publicação nas redes é automática?',
    resposta:
      'Não. O Gridgen entrega o conteúdo pronto para publicar (imagens e legenda de cada rede) e avisa por e-mail no horário agendado. A publicação continua com você.',
  },
]

export default function PlanosPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-20">
        <ScrollReveal type="fade-up" className="max-w-2xl">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance">Planos</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Conteúdo pronto para publicar, com a identidade de cada marca, em qualquer volume. Todos os planos incluem
            implantação assistida pelo time da Eknotech.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {PLANOS_PAGOS.map((id, i) => {
            const plano = PLANOS[id]
            return (
              <ScrollReveal key={id} type="fade-up" delay={(i + 1) as 1 | 2 | 3}>
                <GlowCard clickable={false} className={cn(plano.destaque && 'border-violet-500/60')}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold">{plano.nome}</h2>
                    {plano.destaque && (
                      <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-medium text-white">Mais escolhido</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plano.publico}</p>
                  <p className="mt-6 font-heading text-4xl font-extrabold">
                    R$ {plano.precoMensal}
                    <span className="text-base font-normal text-muted-foreground">/mês</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    R$ {((plano.precoMensal ?? 0) / (plano.geracoesMes ?? 1)).toFixed(2).replace('.', ',')} por geração
                  </p>
                  <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm">
                    {plano.recursos.map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-violet-500" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/contato?plano=${id}`}
                    className={cn('mt-8 w-full', buttonVariants({ variant: plano.destaque ? 'cta' : 'outline' }))}
                  >
                    Começar com o {plano.nome}
                  </Link>
                </GlowCard>
              </ScrollReveal>
            )
          })}
        </div>

        <ScrollReveal type="fade-up" className="mt-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-violet-500/20 bg-card p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold">Piloto gratuito de {PILOTO_DIAS} dias</h2>
              <p className="text-sm text-muted-foreground">
                1 Perfil e {PLANOS.piloto.geracoesMes} gerações para testar com uma marca real, com implantação assistida.
              </p>
            </div>
            <Link href="/contato?plano=piloto" className={cn('shrink-0', buttonVariants({ variant: 'cta' }))}>
              Solicitar piloto
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal type="fade-up" className="mt-20 border-t pt-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Perguntas frequentes</h2>
          <dl className="mt-8 grid gap-8 md:grid-cols-2">
            {PERGUNTAS.map((p) => (
              <div key={p.pergunta}>
                <dt className="font-medium">{p.pergunta}</dt>
                <dd className="mt-1.5 text-sm text-muted-foreground">{p.resposta}</dd>
              </div>
            ))}
          </dl>
        </ScrollReveal>
      </div>
    </div>
  )
}
