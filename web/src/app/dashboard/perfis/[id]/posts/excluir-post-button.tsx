'use client'

import { useTransition } from 'react'
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
import { cn } from '@/lib/utils'
import { excluirPost } from './actions'

export function ExcluirPostButton({
  perfilId,
  postId,
  titulo,
  voltarParaLista = false,
  onExcluido,
  className,
}: {
  perfilId: string
  postId: string
  titulo: string
  voltarParaLista?: boolean
  onExcluido?: () => void
  className?: string
}) {
  const router = useRouter()
  const [excluindo, startTransition] = useTransition()

  function confirmar() {
    startTransition(async () => {
      const resultado = await excluirPost(perfilId, postId)
      if (resultado?.erro) {
        toast.error(resultado.erro)
        return
      }
      toast.success('Post excluído.')
      onExcluido?.()
      if (voltarParaLista) router.push(`/dashboard/perfis/${perfilId}/posts`)
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('text-muted-foreground hover:text-destructive', className)}
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Excluir post</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir “{titulo}”?</AlertDialogTitle>
          <AlertDialogDescription>
            As imagens geradas e a legenda desse post são apagadas permanentemente. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              confirmar()
            }}
            disabled={excluindo}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {excluindo && <Loader2 className="animate-spin" />}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
