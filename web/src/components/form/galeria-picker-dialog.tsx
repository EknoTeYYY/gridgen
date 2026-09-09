'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { GaleriaItem } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function GaleriaPickerDialog({
  perfilId,
  open,
  onOpenChange,
  onEscolher,
  pastaFixa,
}: {
  perfilId: string
  open: boolean
  onOpenChange: (aberto: boolean) => void
  onEscolher: (dataUri: string) => void
  // Quando definido, trava o dialog nessa pasta só — sem abas pra trocar de
  // pasta. Usado pelos campos de Asset da marca (Logo/Ícone), que não fazem
  // sentido misturados com pastas de referência solta.
  pastaFixa?: string
}) {
  const [itens, setItens] = useState<GaleriaItem[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pastaAtiva, setPastaAtiva] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setErro(null)
    setCarregando(true)
    fetch(`/api/perfis/${perfilId}/galeria`)
      .then((res) => res.json())
      .then((dados) => {
        if (Array.isArray(dados)) {
          setItens(dados)
          setPastaAtiva((atual) => atual ?? pastaFixa ?? dados[0]?.pasta ?? null)
        } else {
          setErro(dados.erro || 'falha ao carregar a galeria')
        }
      })
      .catch(() => setErro('falha ao carregar a galeria'))
      .finally(() => setCarregando(false))
  }, [open, perfilId, pastaFixa])

  const pastas = useMemo(() => {
    const nomes = [...new Set(itens.map((i) => i.pasta))].filter((nome) => !pastaFixa || nome === pastaFixa)
    return nomes.map((nome) => ({ nome, itens: itens.filter((i) => i.pasta === nome) }))
  }, [itens, pastaFixa])

  const pastaSelecionada = pastas.find((p) => p.nome === pastaAtiva)

  function escolher(item: GaleriaItem) {
    onEscolher(item.url)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pastaFixa ? `Escolher da pasta "${pastaFixa}"` : 'Escolher imagem da galeria'}</DialogTitle>
        </DialogHeader>

        {carregando && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!carregando && erro && <p className="text-sm text-destructive">{erro}</p>}

        {!carregando && !erro && pastas.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {pastaFixa
              ? `Nenhuma imagem na pasta "${pastaFixa}" ainda — adicione uma pela Galeria do perfil.`
              : 'Nenhuma imagem na galeria desse perfil ainda.'}
          </p>
        )}

        {!carregando && pastas.length > 0 && (
          <>
            {!pastaFixa && (
              <div className="flex flex-wrap gap-1.5">
                {pastas.map((pasta) => (
                  <button
                    key={pasta.nome}
                    type="button"
                    onClick={() => setPastaAtiva(pasta.nome)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      pastaAtiva === pasta.nome
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {pasta.nome} ({pasta.itens.length})
                  </button>
                ))}
              </div>
            )}

            <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {pastaSelecionada?.itens.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => escolher(item)}
                  className="group relative aspect-square overflow-hidden rounded-md border bg-muted p-1.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.nome ?? item.pasta}
                    className="size-full object-contain transition-transform group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
