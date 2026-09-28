import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EsqueciSenhaForm } from './esqueci-senha-form'

export default function EsqueciSenhaPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <Link
        href="/login"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar pro login
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <Image src="/gridgen-wordmark-roxo.png" alt="Gridgen" width={122} height={28} className="h-7 w-auto dark:hidden" />
          <Image src="/gridgen-wordmark-branco.png" alt="Gridgen" width={122} height={28} className="hidden h-7 w-auto dark:block" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Esqueci minha senha</CardTitle>
            <CardDescription>Informe o e-mail da sua conta. Enviamos um link para você escolher uma nova senha.</CardDescription>
          </CardHeader>
          <CardContent>
            <EsqueciSenhaForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
