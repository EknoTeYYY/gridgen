'use client'

import { useState } from 'react'
import { ImageIcon, Images, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GaleriaPickerDialog } from './galeria-picker-dialog'

// Atribui um papel técnico de marca (logo/ícone, cor ou branco) a partir de
// um item já existente na Galeria — sem upload direto aqui, pra não duplicar
// a mesma imagem em dois lugares desencontrados. Quem quiser subir uma
// imagem nova, sobe na própria pasta "Logo" da Galeria; aqui só se
// escolhe entre o que já está lá. Usado dentro do painel de papéis de marca
// em `galeria-client.tsx`.
export function GaleriaAssetField({
  perfilId,
  pasta,
  label,
  value,
  onChange,
}: {
  perfilId: string
  pasta: string
  label: string
  value: string
  onChange: (valor: string) => void
}) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted p-1.5">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="size-full object-contain" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setAberto(true)}>
            <Images />
            {value ? 'Trocar' : 'Escolher da galeria'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              <X />
              Remover
            </Button>
          )}
        </div>
      </div>
      <GaleriaPickerDialog perfilId={perfilId} open={aberto} onOpenChange={setAberto} onEscolher={onChange} pastaFixa={pasta} />
    </div>
  )
}
