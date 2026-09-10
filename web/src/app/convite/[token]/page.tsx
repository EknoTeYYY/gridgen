import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ServerFetchError, serverFetch } from '@/lib/session'
import type { ConviteInfo } from '@/lib/types'
import { AceitarConviteForm } from './aceitar-convite-form'

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  let info: ConviteInfo | null = null
  let erro: string | null = null
  try {
    info = await serverFetch<ConviteInfo>(`/auth/convite/${token}`)
  } catch (err) {
    erro = err instanceof ServerFetchError ? err.message : 'não foi possível carregar o convite'
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <Image src="/gridgen-wordmark-roxo.png" alt="Gridgen" width={122} height={28} className="h-7 w-auto dark:hidden" />
          <Image
            src="/gridgen-wordmark-branco.png"
            alt="Gridgen"
            width={122}
            height={28}
            className="hidden h-7 w-auto dark:block"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Aceitar convite</CardTitle>
            <CardDescription>
              {info ? `Você foi convidado pra acessar ${info.contaNome}.` : 'Convite inválido ou expirado.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {info ? (
              <AceitarConviteForm token={token} email={info.email} />
            ) : (
              <p className="text-sm text-muted-foreground">
                {erro} — peça pra quem te convidou reenviar o convite.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
