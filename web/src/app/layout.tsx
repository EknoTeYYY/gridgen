import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const poppins = Poppins({ variable: '--font-poppins', subsets: ['latin'], weight: ['500', '600', '700'] })

const TITULO = 'Gridgen'
const DESCRICAO = 'Produção de conteúdo em massa para redes sociais, com identidade de marca aplicada automaticamente.'

export const metadata: Metadata = {
  metadataBase: new URL('https://gridgen.com.br'),
  title: TITULO,
  description: DESCRICAO,
  // Ícone de compartilhamento padronizado com o mesmo usado em
  // eknotech.com.br (og-image.png, copiado do repo ekno-tech) — mesma
  // identidade visual em qualquer produto do portfólio da Eknotech.
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://gridgen.com.br',
    siteName: TITULO,
    title: TITULO,
    description: DESCRICAO,
    images: [{ url: '/og-image.png', width: 512, height: 512, alt: 'Eknotech' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRICAO,
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
