'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ImageIcon, Instagram, Linkedin, Music2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RECURSOS as RECURSOS_DETALHADOS } from './recursos-dados'
import { FEITO_PARA as FEITO_PARA_DETALHADO } from './feito-para-dados'

type Menu = 'recursos' | 'integracoes' | 'feito-para'

const RECURSOS = RECURSOS_DETALHADOS.map((r) => ({ slug: r.slug, icon: r.icon, titulo: r.titulo, descricao: r.resumo }))
const FEITO_PARA = FEITO_PARA_DETALHADO.map((p) => ({ slug: p.slug, icon: p.icon, titulo: p.titulo, descricao: p.resumo }))

const INTEGRACOES = [
  { icon: ImageIcon, titulo: 'Pexels', descricao: 'Banco de imagens de referência.', status: 'ativo' as const },
  { icon: Sparkles, titulo: 'Anthropic Claude', descricao: 'Modelo por trás da geração de texto.', status: 'ativo' as const },
  { icon: Instagram, titulo: 'Instagram', descricao: 'Legenda adaptada e aviso na hora de publicar.', status: 'ativo' as const },
  { icon: Linkedin, titulo: 'LinkedIn', descricao: 'Legenda adaptada e aviso na hora de publicar.', status: 'ativo' as const },
  { icon: Music2, titulo: 'TikTok', descricao: 'Legenda adaptada e aviso na hora de publicar.', status: 'ativo' as const },
]

interface ItemDeMenu {
  icon: React.ComponentType<{ className?: string }>
  titulo: string
  descricao: string
  status?: 'ativo' | 'em breve'
  slug?: string
}

function ItemGrid({
  itens,
  colunas = 2,
  hrefBase,
  onNavegar,
}: {
  itens: ItemDeMenu[]
  colunas?: 1 | 2
  hrefBase?: string
  onNavegar?: () => void
}) {
  return (
    <div className={cn('grid gap-1', colunas === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
      {itens.map((item) => {
        const conteudo = (
          <>
            <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium">{item.titulo}</p>
                {item.status === 'em breve' && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Em breve
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.descricao}</p>
            </div>
          </>
        )
        const className = 'flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted'
        return hrefBase && item.slug ? (
          <Link key={item.titulo} href={`${hrefBase}/${item.slug}`} onClick={onNavegar} className={className}>
            {conteudo}
          </Link>
        ) : (
          <div key={item.titulo} className={className}>
            {conteudo}
          </div>
        )
      })}
    </div>
  )
}

export function NavDropdowns() {
  const [aberto, setAberto] = useState<Menu | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(null)
    }
    function aoTeclarEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(null)
    }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclarEsc)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclarEsc)
    }
  }, [])

  function alternar(menu: Menu) {
    setAberto((atual) => (atual === menu ? null : menu))
  }

  return (
    <div ref={containerRef} className="flex items-center gap-8 text-sm">
      <div className="relative">
        <button
          type="button"
          onClick={() => alternar('recursos')}
          className={cn(
            'group relative flex items-center gap-1 py-1 transition-colors hover:text-foreground',
            aberto === 'recursos' ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          Recursos
          <ChevronDown className={cn('size-3.5 transition-transform', aberto === 'recursos' && 'rotate-180')} />
          <span
            className={cn(
              'absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100',
              aberto === 'recursos' && 'scale-x-100',
            )}
          />
        </button>
        {aberto === 'recursos' && (
          <div className="absolute top-full left-1/2 mt-3 w-[520px] -translate-x-1/2 rounded-2xl border bg-background p-3 shadow-2xl">
            <ItemGrid itens={RECURSOS} colunas={2} hrefBase="/recursos" onNavegar={() => setAberto(null)} />
            <Link
              href="/recursos"
              onClick={() => setAberto(null)}
              className="mt-1 flex items-center justify-center rounded-lg py-2 text-sm font-medium text-primary hover:bg-muted"
            >
              Ver todos os recursos
            </Link>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => alternar('integracoes')}
          className={cn(
            'group relative flex items-center gap-1 py-1 transition-colors hover:text-foreground',
            aberto === 'integracoes' ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          Integrações
          <ChevronDown className={cn('size-3.5 transition-transform', aberto === 'integracoes' && 'rotate-180')} />
          <span
            className={cn(
              'absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100',
              aberto === 'integracoes' && 'scale-x-100',
            )}
          />
        </button>
        {aberto === 'integracoes' && (
          <div className="absolute top-full left-1/2 mt-3 w-80 -translate-x-1/2 rounded-2xl border bg-background p-3 shadow-2xl">
            <ItemGrid itens={INTEGRACOES} colunas={1} />
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => alternar('feito-para')}
          className={cn(
            'group relative flex items-center gap-1 py-1 transition-colors hover:text-foreground',
            aberto === 'feito-para' ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          Feito para
          <ChevronDown className={cn('size-3.5 transition-transform', aberto === 'feito-para' && 'rotate-180')} />
          <span
            className={cn(
              'absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100',
              aberto === 'feito-para' && 'scale-x-100',
            )}
          />
        </button>
        {aberto === 'feito-para' && (
          <div className="absolute top-full left-1/2 mt-3 w-80 -translate-x-1/2 rounded-2xl border bg-background p-3 shadow-2xl">
            <ItemGrid itens={FEITO_PARA} colunas={1} hrefBase="/feito-para" onNavegar={() => setAberto(null)} />
            <Link
              href="/feito-para"
              onClick={() => setAberto(null)}
              className="mt-1 flex items-center justify-center rounded-lg py-2 text-sm font-medium text-primary hover:bg-muted"
            >
              Ver tudo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
