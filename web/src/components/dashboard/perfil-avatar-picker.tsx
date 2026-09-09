'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Perfil } from '@/lib/types'
import { GaleriaPickerDialog } from '@/components/form/galeria-picker-dialog'
import { atualizarAssetMarca } from '@/app/dashboard/perfis/actions'
import { PerfilAvatar } from './perfil-avatar'

const PASTA_LOGO = 'Logo'

// Mesmo círculo de identificação do Perfil, só que clicável — e só na tela de
// edição (`/editar`), onde faz sentido oferecer a ação. Escolher uma imagem
// da pasta "Logo" da Galeria vira o avatar (ícone colorido e branco
// recebem a mesma imagem — o avatar é um conceito só; quem precisar de
// variantes distintas por tema usa o painel de papéis dentro da própria
// pasta na Galeria).
export function PerfilAvatarPicker({ perfil, className }: { perfil: Perfil; className?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const editando = pathname?.endsWith('/editar') ?? false

  if (!editando) {
    return <PerfilAvatar perfil={perfil} className={className} />
  }

  async function escolher(url: string) {
    setSalvando(true)
    const [r1, r2] = await Promise.all([
      atualizarAssetMarca(perfil.id, 'iconeColorUrl', url),
      atualizarAssetMarca(perfil.id, 'iconeBrancoUrl', url),
    ])
    setSalvando(false)
    const erro = r1?.erro || r2?.erro
    if (erro) {
      toast.error(erro)
      return
    }
    toast.success('Avatar atualizado.')
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        disabled={salvando}
        className="group relative shrink-0 rounded-full"
        title="Trocar avatar"
      >
        <PerfilAvatar perfil={perfil} className={className} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          Trocar
        </span>
      </button>
      <GaleriaPickerDialog
        perfilId={perfil.id}
        open={aberto}
        onOpenChange={setAberto}
        onEscolher={escolher}
        pastaFixa={PASTA_LOGO}
      />
    </>
  )
}
