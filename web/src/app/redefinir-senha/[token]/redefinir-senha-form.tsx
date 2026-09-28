'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RedefinirSenhaForm({ token, email }: { token: string; email: string }) {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (senha !== confirmacao) {
      setErro('as duas senhas não são iguais')
      return
    }
    setCarregando(true)
    try {
      const res = await fetch(`/api/auth/senha/redefinir/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setErro(data?.erro || 'não foi possível redefinir a senha')
        return
      }
      router.push('/login?senha=redefinida')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" value={email} disabled />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="senha">Nova senha</Label>
        <Input id="senha" type="password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmacao">Confirme a nova senha</Label>
        <Input
          id="confirmacao"
          type="password"
          required
          minLength={8}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" disabled={carregando}>
        {carregando && <Loader2 className="animate-spin" />}
        {carregando ? 'Salvando…' : 'Salvar nova senha'}
      </Button>
    </form>
  )
}
