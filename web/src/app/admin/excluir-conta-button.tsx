'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { excluirConta } from './actions'

// Exclusão é permanente — apaga a conta e tudo dela em cascata (usuários,
// perfis, posts, galeria). Bem mais grave que excluir 1 post, então pede
// digitar o nome da conta pra confirmar, em vez do AlertDialog simples usado
// pro resto do produto (ex. excluir-post-button.tsx).
export function ExcluirContaButton({ contaId, nome }: { contaId: string; nome: string }) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const [excluindo, startTransition] = useTransition()

  function confirmar() {
    startTransition(async () => {
      const resultado = await excluirConta(contaId)
      if (resultado?.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Conta excluída.')
      setAberto(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v)
        if (!v) setConfirmacao('')
      }}
    >
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
          <Trash2 />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir “{nome}” permanentemente?</AlertDialogTitle>
          <AlertDialogDescription>
            Apaga a conta e tudo que pertence a ela — usuários, perfis, posts gerados, galeria. Essa ação não pode
            ser desfeita. Se é só pra bloquear o acesso, use "Desativar" em vez disso.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmacao">
            Digite <span className="font-semibold">{nome}</span> pra confirmar
          </Label>
          <Input id="confirmacao" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} autoFocus />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              confirmar()
            }}
            disabled={excluindo || confirmacao !== nome}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {excluindo && <Loader2 className="animate-spin" />}
            Excluir permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
