'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ContatoForm() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [telefone, setTelefone] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, empresa: empresa || undefined, telefone: telefone || undefined, mensagem: mensagem || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setErro(data?.erro || 'não foi possível enviar agora, tenta de novo em instantes')
        return
      }
      setEnviado(true)
    } finally {
      setCarregando(false)
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <p className="text-lg font-medium">Recebemos seu contato.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          A equipe da Eknotech vai te responder em breve pelo e-mail informado.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="empresa">Empresa (opcional)</Label>
        <Input id="empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telefone">Telefone (opcional)</Label>
        <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mensagem">Conte um pouco do que precisa (opcional)</Label>
        <Textarea id="mensagem" rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" size="lg" disabled={carregando}>
        {carregando && <Loader2 className="animate-spin" />}
        {carregando ? 'Enviando…' : 'Enviar'}
      </Button>
    </form>
  )
}
