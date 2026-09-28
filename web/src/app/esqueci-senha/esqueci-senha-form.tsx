'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EsqueciSenhaForm() {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      const res = await fetch('/api/auth/senha/esqueci', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setErro(data?.erro || 'não foi possível enviar agora, tente de novo em instantes')
        return
      }
      setEnviado(true)
    } finally {
      setCarregando(false)
    }
  }

  // Mensagem neutra de propósito: a mesma exista a conta ou não.
  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <CheckCircle2 className="size-8 text-emerald-500" />
        <p className="text-sm">Se houver uma conta com <strong>{email}</strong>, você vai receber um link para redefinir a senha.</p>
        <p className="text-xs text-muted-foreground">O link vale por 60 minutos. Confira também a caixa de spam.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" disabled={carregando}>
        {carregando && <Loader2 className="animate-spin" />}
        {carregando ? 'Enviando…' : 'Enviar link'}
      </Button>
    </form>
  )
}
