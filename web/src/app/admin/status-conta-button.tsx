'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, CircleCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { alterarStatusConta } from './actions'

// Desativar corta o acesso da conta (login e refresh de sessão passam a
// recusar) sem apagar nada — reversível a qualquer momento reativando de
// novo. É a ferramenta certa pra "pausar" uma agência (ex. inadimplência),
// diferente da exclusão (permanente, sem volta).
export function StatusContaButton({ contaId, status }: { contaId: string; status: 'ativa' | 'inativa' }) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [alterando, startTransition] = useTransition()
  const ativando = status === 'inativa'

  function confirmar() {
    startTransition(async () => {
      const resultado = await alterarStatusConta(contaId, ativando ? 'ativa' : 'inativa')
      if (resultado?.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success(ativando ? 'Conta reativada.' : 'Conta desativada — acesso bloqueado.')
      setAberto(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={aberto} onOpenChange={setAberto}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={alterando}>
          {alterando ? (
            <Loader2 className="animate-spin" />
          ) : ativando ? (
            <CircleCheck />
          ) : (
            <Ban />
          )}
          {ativando ? 'Reativar' : 'Desativar'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ativando ? 'Reativar esta conta?' : 'Desativar esta conta?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {ativando
              ? 'Os usuários dessa conta voltam a conseguir entrar normalmente.'
              : 'Os usuários dessa conta não conseguem mais entrar (sessões já abertas caem em até 15 minutos). Nada é apagado — dá pra reativar quando quiser.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              confirmar()
            }}
            disabled={alterando}
            className={ativando ? undefined : 'bg-destructive text-white hover:bg-destructive/90'}
          >
            {alterando && <Loader2 className="animate-spin" />}
            {ativando ? 'Reativar' : 'Desativar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
