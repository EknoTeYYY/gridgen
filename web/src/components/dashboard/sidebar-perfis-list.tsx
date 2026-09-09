'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Perfil } from '@/lib/types'
import { cn } from '@/lib/utils'
import { PerfilAvatar } from './perfil-avatar'

const PERFIS_POR_PAGINA = 10
// Cada linha: py-1.5 (12px) + text-sm/leading (20px) = 32px, mais gap-1
// (4px) entre elas. Reserva a altura de 10 linhas sempre, mesmo quando a
// página atual tem só 1 item — sem isso, a paginação "subia" na tela
// conforme a última página tinha menos itens (achado real do usuário).
const ALTURA_LISTA_PX = PERFIS_POR_PAGINA * 32 + (PERFIS_POR_PAGINA - 1) * 4

// Preenche o espaço vazio da sidebar com algo útil (não só decorativo): acesso
// direto a cada Perfil, em vez de precisar passar por "Perfis" toda vez.
// Paginado de 10 em 10 — sem isso, uma conta com muitos clientes (achado
// real testando com 20+ perfis) virava uma lista comprida demais pra sidebar.
export function SidebarPerfisList({ perfis }: { perfis: Perfil[] }) {
  const pathname = usePathname()
  const [pagina, setPagina] = useState(0)

  if (perfis.length === 0) return null

  const totalPaginas = Math.ceil(perfis.length / PERFIS_POR_PAGINA)
  const paginaAtual = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaAtual * PERFIS_POR_PAGINA
  const perfisDaPagina = perfis.slice(inicio, inicio + PERFIS_POR_PAGINA)

  return (
    <div className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto">
      <p className="px-3 py-1 text-xs font-medium text-muted-foreground">Perfis</p>
      <div className="flex flex-col gap-1" style={{ minHeight: totalPaginas > 1 ? ALTURA_LISTA_PX : undefined }}>
        {perfisDaPagina.map((perfil) => {
          const ativo = pathname.startsWith(`/dashboard/perfis/${perfil.id}`)
          return (
            <Link
              key={perfil.id}
              href={`/dashboard/perfis/${perfil.id}`}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                ativo
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <PerfilAvatar perfil={perfil} className="size-4" />
              <span className="truncate">{perfil.nome}</span>
            </Link>
          )
        })}
      </div>

      {totalPaginas > 1 && (
        <div className="mt-1 flex items-center justify-between px-3 py-1">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={paginaAtual === 0}
            className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-3.5" />
            <span className="sr-only">Página anterior</span>
          </button>
          <span className="text-[11px] text-muted-foreground">
            {paginaAtual + 1} / {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
            disabled={paginaAtual === totalPaginas - 1}
            className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-3.5" />
            <span className="sr-only">Próxima página</span>
          </button>
        </div>
      )}
    </div>
  )
}
