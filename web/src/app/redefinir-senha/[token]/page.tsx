import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { serverFetch } from '@/lib/session'
import { RedefinirSenhaForm } from './redefinir-senha-form'

export default async function RedefinirSenhaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const info = await serverFetch<{ email: string }>(`/auth/senha/redefinir/${token}`, {}, { redirectOn401: false }).catch(() => null)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <Image src="/gridgen-wordmark-roxo.png" alt="Gridgen" width={122} height={28} className="h-7 w-auto dark:hidden" />
          <Image src="/gridgen-wordmark-branco.png" alt="Gridgen" width={122} height={28} className="hidden h-7 w-auto dark:block" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Nova senha</CardTitle>
            <CardDescription>{info ? 'Escolha uma nova senha para a sua conta.' : 'Link inválido ou expirado.'}</CardDescription>
          </CardHeader>
          <CardContent>
            {info ? (
              <RedefinirSenhaForm token={token} email={info.email} />
            ) : (
              <p className="text-sm text-muted-foreground">
                O link já foi usado ou passou de 60 minutos.{' '}
                <Link href="/esqueci-senha" className="font-medium text-foreground underline underline-offset-2">
                  Peça um novo link
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
