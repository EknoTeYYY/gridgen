'use client'

import { HexColorPicker } from 'react-colorful'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const HEX_VALIDO = /^#[0-9a-fA-F]{6}$/

// Substitui o <input type="color"> nativo — o picker do próprio sistema
// operacional abre fora do controle da página (sem tema, mal posicionado).
// Este é um popover ancorado, dentro do layout e do tema do app.
export function ColorPickerField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
}) {
  const corValida = HEX_VALIDO.test(value)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Escolher ${label}`}
              className="h-9 w-11 shrink-0 rounded-md border border-input"
              style={{ background: corValida ? value : undefined }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker color={corValida ? value : '#000000'} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="font-mono"
        />
      </div>
    </div>
  )
}
