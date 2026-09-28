'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { solicitarUpgrade } from './actions'

// Cobrança manual: o botão não muda o plano na hora — registra o pedido pro
// time comercial da Eknotech, que confirma com o cliente e aplica no painel.
export function SolicitarButton({
  pedido,
  children,
  variant = 'default',
  className,
}: {
  pedido: Parameters<typeof solicitarUpgrade>[0]
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}) {
  const [enviando, startTransition] = useTransition()
  const [enviado, setEnviado] = useState(false)

  function enviar() {
    startTransition(async () => {
      const resultado = await solicitarUpgrade(pedido)
      if (resultado.erro) {
        toast.error(resultado.erro)
        return
      }
      setEnviado(true)
      toast.success('Pedido enviado. O time comercial da Eknotech entra em contato para confirmar.')
    })
  }

  return (
    <Button size="sm" variant={variant} onClick={enviar} disabled={enviando || enviado} className={className}>
      {enviando ? <Loader2 className="animate-spin" /> : enviado ? <Check /> : null}
      {enviado ? 'Pedido enviado' : children}
    </Button>
  )
}
