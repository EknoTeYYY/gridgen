import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { NavDropdowns } from './site-nav'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative py-1 text-muted-foreground transition-colors max-lg:text-[15px] hover:text-foreground"
    >
      {children}
      {/* Sublinhado sempre na cor de marca (roxo), não na cor do texto — regra
          da IDV Eknotech (docs/design-system-eknotech.md, seção 6.1). */}
      <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-violet-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  )
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed inset-x-0 top-4 z-50 max-md:top-2.5 max-[480px]:top-2">
        {/* Pílula flutuante: transparente em repouso, só ganha fundo/borda de
            marca no hover (IDV Eknotech, seção 6.1). Medidas replicadas do
            NavBar.css real da eknotech: largura 92%/1100px, raio 12px,
            padding 12px 24px (a altura nasce do conteúdo, não é fixa). */}
        <div className="mx-auto flex w-[92%] max-w-[1100px] items-center justify-between rounded-[12px] border border-border bg-transparent px-6 py-3 shadow-lg shadow-black/5 backdrop-blur-xl transition-colors max-md:w-[calc(100%-32px)] max-md:px-3.5 max-md:py-2.5 max-[480px]:w-[calc(100%-24px)] max-[480px]:px-3 max-[480px]:py-2 hover:border-violet-600/20 hover:bg-background/30">
          <Link href="/" className="flex items-center">
            <Image
              src="/gridgen-wordmark-roxo.png"
              alt="Gridgen"
              width={227}
              height={52}
              className="h-9 w-auto max-md:h-8 max-[480px]:h-7 dark:hidden"
            />
            <Image
              src="/gridgen-wordmark-branco.png"
              alt="Gridgen"
              width={227}
              height={52}
              className="hidden h-9 w-auto max-md:h-8 max-[480px]:h-7 dark:block"
            />
          </Link>
          <div className="hidden items-center gap-7 max-lg:gap-5 sm:flex">
            <NavLink href="/como-funciona">Como funciona</NavLink>
            <NavDropdowns />
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Entrar
            </Link>
            <Link href="/contato" className={buttonVariants({ variant: 'cta' })}>
              Fale com a gente
            </Link>
          </div>
        </div>
      </header>

      <div className="h-dvh snap-y snap-mandatory overflow-y-auto scroll-smooth">
        <main>{children}</main>

        <footer className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Image src="/gridgen-wordmark-roxo.png" alt="Gridgen" width={87} height={20} className="h-5 w-auto dark:hidden" />
                <Image
                  src="/gridgen-wordmark-branco.png"
                  alt="Gridgen"
                  width={87}
                  height={20}
                  className="hidden h-5 w-auto dark:block"
                />
                <span>produção de conteúdo em massa pra redes sociais.</span>
              </div>
              <div className="flex gap-4">
                <Link href="/como-funciona" className="hover:text-foreground">
                  Como funciona
                </Link>
                <Link href="/recursos" className="hover:text-foreground">
                  Recursos
                </Link>
                <Link href="/privacidade" className="hover:text-foreground">
                  Privacidade
                </Link>
                <Link href="/termos" className="hover:text-foreground">
                  Termos
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
              <a
                href="https://eknotech.com.br"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Image src="/eknotech-icone.png" alt="eknotech" width={16} height={16} className="rounded-sm" />
                <span>&copy; {new Date().getFullYear()} eknotech. Todos os direitos reservados.</span>
              </a>
              <a
                href="https://eknotech.com.br"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground hover:underline"
              >
                eknotech.com.br
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
