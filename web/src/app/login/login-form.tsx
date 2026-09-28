'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro || 'e-mail ou senha inválidos')
        return
      }
      router.push(searchParams.get('next') || '/dashboard')
      router.refresh()
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="senha">Senha</Label>
          <Link href="/esqueci-senha" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <Input id="senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
      </div>
      {searchParams.get('senha') === 'redefinida' && !erro && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Senha redefinida. Entre com a nova senha.</p>
      )}
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" disabled={carregando}>
        {carregando && <Loader2 className="animate-spin" />}
        {carregando ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}
