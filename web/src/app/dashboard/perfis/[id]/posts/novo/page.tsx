import { GerarComIaForm } from './gerar-com-ia-form'

export default async function NovoPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: perfilId } = await params

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Novo post</h1>
      <GerarComIaForm perfilId={perfilId} />
    </div>
  )
}
