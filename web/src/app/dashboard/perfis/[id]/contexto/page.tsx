import { serverFetch } from '@/lib/session'
import type { ContextoPerfil, Perfil } from '@/lib/types'
import { ContextoChat } from './contexto-chat'

export default async function ContextoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: perfilId } = await params
  const [perfil, contexto] = await Promise.all([
    serverFetch<Perfil>(`/perfis/${perfilId}`),
    serverFetch<ContextoPerfil>(`/perfis/${perfilId}/contexto`),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contexto — {perfil.nome}</h1>
        <p className="text-sm text-muted-foreground">
          Converse pra construir o contexto de marca que a IA usa na geração assistida de post.
        </p>
      </div>
      <ContextoChat
        perfilId={perfilId}
        perfilNome={perfil.nome}
        contextoInicial={contexto}
        canalConfirmadoInicial={perfil.canalConversaoConfirmado}
      />
    </div>
  )
}
