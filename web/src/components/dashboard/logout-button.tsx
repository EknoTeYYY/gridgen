'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function LogoutButton() {
  const router = useRouter()

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenuItem variant="destructive" onSelect={sair}>
      <LogOut />
      Sair
    </DropdownMenuItem>
  )
}
