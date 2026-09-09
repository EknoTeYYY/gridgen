'use client'

import { useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface FotoReferencia {
  id: number
  miniaturaUrl: string
  imagemUrl: string
  fotografo: string
  fotografoUrl: string
}

export function PexelsPickerDialog({
  open,
  onOpenChange,
  onEscolher,
}: {
  open: boolean
  onOpenChange: (aberto: boolean) => void
  onEscolher: (dataUri: string) => void
}) {
  const [busca, setBusca] = useState('')
  const [fotos, setFotos] = useState<FotoReferencia[]>([])
  const [buscando, setBuscando] = useState(false)
  const [baixando, setBaixando] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    if (!busca.trim()) return
    setErro(null)
    setBuscando(true)
    try {
      const res = await fetch(`/api/imagens-referencia/buscar?q=${encodeURIComponent(busca)}`)
      const dados = await res.json()
      if (!res.ok) {
        setErro(dados.erro || 'falha ao buscar imagens')
        setFotos([])
        return
      }
      setFotos(dados.fotos)
    } finally {
      setBuscando(false)
    }
  }

  async function escolher(foto: FotoReferencia) {
    setErro(null)
    setBaixando(foto.id)
    try {
      const res = await fetch(`/api/imagens-referencia/baixar?url=${encodeURIComponent(foto.imagemUrl)}`)
      const dados = await res.json()
      if (!res.ok) {
        setErro(dados.erro || 'falha ao baixar imagem')
        return
      }
      onEscolher(dados.dataUri)
      onOpenChange(false)
    } finally {
      setBaixando(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buscar imagem de referência</DialogTitle>
        </DialogHeader>
        <form onSubmit={buscar} className="flex gap-2">
          <Input
            placeholder="ex.: apartamento moderno, corretor sorrindo, cidade à noite"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Button type="submit" disabled={buscando}>
            {buscando ? <Loader2 className="animate-spin" /> : <Search />}
            Buscar
          </Button>
        </form>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {fotos.map((foto) => (
            <button
              key={foto.id}
              type="button"
              disabled={baixando !== null}
              onClick={() => escolher(foto)}
              className="group relative aspect-square overflow-hidden rounded-md border disabled:opacity-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.miniaturaUrl}
                alt=""
                className="size-full object-cover transition-transform group-hover:scale-105"
              />
              {baixando === foto.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>
        {fotos.length > 0 && (
          <p className="text-xs text-muted-foreground">Fotos via Pexels — crédito automático aos fotógrafos.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
