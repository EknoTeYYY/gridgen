import { PLANOS } from '@gridgen/shared'
import { serverFetch } from '@/lib/session'
import type { GaleriaItem, GaleriaPasta, UsoConta } from '@/lib/types'
import { GerarComIaForm } from './gerar-com-ia-form'

export default async function NovoPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: perfilId } = await params

  // Lista de pastas pra sugerir no campo "Pasta de referência" — mesma fonte
  // dupla que a própria Galeria usa (itens já enviados + pastas criadas
  // vazias), fundidas aqui só pra dar autocomplete, não pra listar conteúdo.
  const [itens, pastasCustom, uso] = await Promise.all([
    serverFetch<GaleriaItem[]>(`/perfis/${perfilId}/galeria`),
    serverFetch<GaleriaPasta[]>(`/perfis/${perfilId}/galeria/pastas`),
    serverFetch<UsoConta>('/conta/uso').catch(() => null),
  ])
  const pastas = [...new Set([...itens.map((i) => i.pasta), ...pastasCustom.map((p) => p.nome)])].sort()
  // Sem o uso (falha de leitura), não bloqueia: a api é quem garante a regra.
  const permiteOutrasRedes = uso ? PLANOS[uso.plano].adaptacaoRedes : true

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Novo post</h1>
      <GerarComIaForm perfilId={perfilId} pastasGaleria={pastas} permiteOutrasRedes={permiteOutrasRedes} />
    </div>
  )
}
