import { Target } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { buttonVariants } from '@/components/ui/button'
import { AutoplayCover } from './autoplay-cover'
import { TiposDeConteudo } from './tipos-de-conteudo'

function pastaDeExemplos(pasta: string, total: number) {
  return Array.from({ length: total }, (_, i) => `/exemplos/eknotech/${pasta}/${String(i + 1).padStart(2, '0')}.png`)
}

const EXEMPLOS_CARROSSEL = [
  { nome: 'Quem somos', slides: pastaDeExemplos('02-quem-somos', 6) },
  { nome: 'Tempo de resposta', slides: pastaDeExemplos('03-tempo-de-resposta', 6) },
  { nome: 'CPL imobiliário', slides: pastaDeExemplos('04-cpl-imobiliario', 4) },
]

const EXEMPLOS_STORIES = [{ nome: 'Sobre nós', slides: pastaDeExemplos('06-sobre-nos-stories', 6) }]

const EXEMPLOS_TWEETS = [{ nome: 'Atendimento via WhatsApp', slides: pastaDeExemplos('07-atendimento-whatsapp', 4) }]

export default async function LandingPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div className="flex flex-col">
      <section
        id="inicio"
        className="mx-auto grid h-dvh max-w-6xl snap-start grid-cols-1 items-center gap-12 overflow-y-auto px-6 py-24 lg:grid-cols-2"
      >
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <Target className="size-3.5" />
            produção de conteúdo em massa, sem perder qualidade
          </span>
          <h1 className="font-heading text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
            Conteúdo em massa, sempre com a cara da sua marca.
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            De agências com vários clientes a quem ainda não tem Instagram. A IA escreve, o motor mantém o padrão
            visual, você aprova antes de sair.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contato" className={buttonVariants({ variant: 'cta' })}>
              Fale com a gente
            </Link>
            <Link href="/como-funciona" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Ver como funciona
            </Link>
          </div>
        </div>
        <AutoplayCover
          imagens={[
            '/exemplos/eknotech/02-quem-somos/01.png',
            '/exemplos/eknotech/03-tempo-de-resposta/01.png',
            '/exemplos/eknotech/04-cpl-imobiliario/01.png',
          ]}
          trasDireita="/exemplos/eknotech/03-tempo-de-resposta/02.png"
          trasEsquerda="/exemplos/eknotech/02-quem-somos/03.png"
        />
      </section>

      <section
        id="exemplos"
        className="flex h-dvh snap-start flex-col justify-center overflow-y-auto border-t bg-muted/30 py-16"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Cada formato, a mesma marca</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Posts reais gerados pra própria eknotech.
            <br />
            A identidade visual e o método por trás não mudam de formato pra formato.
          </p>

          <div className="mt-8 w-full">
            <TiposDeConteudo carrossel={EXEMPLOS_CARROSSEL} stories={EXEMPLOS_STORIES} tweets={EXEMPLOS_TWEETS} />
          </div>
        </div>
      </section>

      <section
        id="comece"
        className="relative flex min-h-[85dvh] snap-start flex-col items-center justify-center overflow-hidden border-t px-6 py-16 text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-500 to-blue-500 opacity-[0.08] dark:opacity-[0.15]" />
        <div className="relative flex max-w-xl flex-col items-center gap-6">
          <h2 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">Pronto pra testar?</h2>
          <p className="text-lg text-muted-foreground">
            Fale com a gente pra colocar sua agência no Gridgen e gerar o primeiro post em poucos minutos.
          </p>
          <Link href="/contato" className={buttonVariants({ variant: 'cta' })}>
            Fale com a gente
          </Link>
        </div>
      </section>
    </div>
  )
}
