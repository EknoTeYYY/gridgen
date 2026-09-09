'use client'

import { useRef, useState } from 'react'
import { Images, ImageIcon, Search, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GaleriaPickerDialog } from './galeria-picker-dialog'
import { PexelsPickerDialog } from './pexels-picker-dialog'

function converterParaDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('falha ao ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

// Foto de slide tem três origens possíveis — upload próprio (produto/ambiente
// do cliente), busca no banco de imagens de referência, ou a galeria própria
// do Perfil — ao contrário do GaleriaAssetField (painel de papéis de marca
// dentro da pasta "Logo"), que só escolhe da Galeria (a marca não
// deveria ter a mesma logo subida em dois lugares).
export function PhotoSlideField({
  perfilId,
  label,
  value,
  onChange,
  ehCapa = false,
}: {
  perfilId: string
  label: string
  value: string
  onChange: (valor: string) => void
  ehCapa?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [galeriaAberta, setGaleriaAberta] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function onArquivo(file: File | undefined) {
    if (!file) return
    setErro(null)
    try {
      onChange(await converterParaDataUri(file))
    } catch {
      setErro('não foi possível ler a imagem selecionada')
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">
        {ehCapa
          ? 'Sua imagem mais forte — é a primeira coisa que alguém vê.'
          : 'Uma foto diferente da capa, do mesmo ambiente/produto, outro ângulo.'}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onArquivo(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload />
              {value ? 'Trocar arquivo' : 'Enviar arquivo'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setBuscaAberta(true)}>
              <Search />
              Buscar imagem
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setGaleriaAberta(true)}>
              <Images />
              Escolher da galeria
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
                <X />
                Remover
              </Button>
            )}
          </div>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
        </div>
      </div>

      <PexelsPickerDialog open={buscaAberta} onOpenChange={setBuscaAberta} onEscolher={onChange} />
      <GaleriaPickerDialog
        perfilId={perfilId}
        open={galeriaAberta}
        onOpenChange={setGaleriaAberta}
        onEscolher={onChange}
      />
    </div>
  )
}
