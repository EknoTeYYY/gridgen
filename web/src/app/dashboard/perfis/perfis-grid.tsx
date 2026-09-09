'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus, Search, Users2 } from 'lucide-react'
import type { Perfil } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PerfilAvatar } from '@/components/dashboard/perfil-avatar'

// 12 = 3 colunas × 4 linhas no breakpoint largo — enche a tela sem precisar
// de scroll, pedido do usuário depois de ver a grade com 20+ perfis ("em
// tela, paginado com 12 itens, melhor visualização").
const PERFIS_POR_PAGINA = 12

// Busca client-side simples (sem round-trip à api) — a lista de Perfis de
// uma Conta já vem inteira do servidor, filtrar localmente é suficiente pra
// essa escala e evita mais uma chamada de rede a cada letra digitada.
export function PerfisGrid({ perfis }: { perfis: Perfil[] }) {
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(0)

  const termo = busca.trim().toLowerCase()
  const filtrados = termo ? perfis.filter((p) => p.nome.toLowerCase().includes(termo)) : perfis

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PERFIS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas - 1)
  const inicio = paginaAtual * PERFIS_POR_PAGINA
  const perfisDaPagina = filtrados.slice(inicio, inicio + PERFIS_POR_PAGINA)

  return (
    <div className="flex flex-col gap-4">
      {perfis.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar perfil por nome…"
            className="pl-9"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPagina(0)
            }}
          />
        </div>
      )}

      {filtrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Users2 className="size-6 text-muted-foreground" />
            </div>
            {termo ? (
              <p className="font-medium">Nenhum perfil encontrado para "{busca}".</p>
            ) : (
              <>
                <div>
                  <p className="font-medium">Nenhum perfil ainda</p>
                  <p className="text-sm text-muted-foreground">Crie o primeiro pra começar a gerar conteúdo.</p>
                </div>
                <Link href="/dashboard/perfis/novo" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  <Plus />
                  Novo perfil
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perfisDaPagina.map((perfil) => (
              <Link key={perfil.id} href={`/dashboard/perfis/${perfil.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <PerfilAvatar perfil={perfil} className="size-8" />
                      <Badge variant="secondary" className="capitalize">
                        {perfil.tipo}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{perfil.nome}</p>
                      <p className="text-xs text-muted-foreground">/{perfil.slug}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {/* Preenche as vagas até completar 12 com cards invisíveis (mesma
                estrutura, mesma altura) — sem isso, a última página (com
                menos itens que as anteriores) tinha menos linhas, e a
                paginação "subia" pra logo abaixo do último card real (achado
                real do usuário, mesmo problema já corrigido na sidebar, só
                que aqui não dá pra usar altura fixa em pixel: a grade tem
                colunas responsivas, então quantas linhas cabem depende do
                breakpoint — cards invisíveis resolvem isso automaticamente
                em qualquer largura de tela). */}
            {totalPaginas > 1 &&
              Array.from({ length: PERFIS_POR_PAGINA - perfisDaPagina.length }).map((_, i) => (
                <div key={`vago-${i}`} aria-hidden="true" className="invisible">
                  <Card className="h-full">
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="size-8" />
                        <Badge variant="secondary">x</Badge>
                      </div>
                      <div>
                        <p className="font-medium">x</p>
                        <p className="text-xs">x</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={paginaAtual === 0}
                className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Página anterior</span>
              </button>
              <span className="text-sm text-muted-foreground">
                {paginaAtual + 1} / {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                disabled={paginaAtual === totalPaginas - 1}
                className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Próxima página</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
