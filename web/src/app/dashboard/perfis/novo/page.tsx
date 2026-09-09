import { PerfilForm } from '../perfil-form'

export default function NovoPerfilPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo perfil</h1>
        <p className="text-sm text-muted-foreground">A marca/cliente para quem o conteúdo vai ser gerado.</p>
      </div>
      <PerfilForm />
    </div>
  )
}
