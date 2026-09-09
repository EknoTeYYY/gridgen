'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { criarConta } from './actions'

export function NovaContaDialog() {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, startSalvar] = useTransition()

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    startSalvar(async () => {
      const resultado = await criarConta({ nome, email })
      if (resultado?.erro) {
        setErro(resultado.erro)
        toast.error(resultado.erro)
        return
      }
      setAberto(false)
      setNome('')
      setEmail('')
      if (resultado.emailEnviado) {
        toast.success('Conta criada — convite enviado por e-mail.')
      } else {
        toast.success('Conta criada, mas o e-mail de convite falhou — reenvie pela lista.')
      }
      router.refresh()
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Nova conta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome da conta</Label>
            <Input
              id="nome"
              placeholder="ex.: Agência Exemplo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail do convite</Label>
            <Input
              id="email"
              type="email"
              placeholder="responsavel@agencia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <DialogFooter>
            <Button type="submit" disabled={salvando}>
              {salvando && <Loader2 className="animate-spin" />}
              Criar e convidar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
