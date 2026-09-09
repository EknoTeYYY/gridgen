'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { reenviarConvite } from './actions'

export function ReenviarConviteButton({ contaId }: { contaId: string }) {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()

  function reenviar() {
    startTransition(async () => {
      const resultado = await reenviarConvite(contaId)
      if (resultado?.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success(resultado.emailEnviado ? 'Convite reenviado.' : 'Convite renovado, mas o e-mail falhou.')
      router.refresh()
    })
  }

  return (
    <Button size="sm" variant="outline" onClick={reenviar} disabled={enviando}>
      {enviando ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      Reenviar convite
    </Button>
  )
}
