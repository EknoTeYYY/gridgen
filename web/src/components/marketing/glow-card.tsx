import { cn } from '@/lib/utils'

// Componente-assinatura da IDV Eknotech (docs/design-system-eknotech.md,
// seção 6.3): duas camadas, uma borrada atrás (o "glow") e uma opaca na
// frente. As duas pontas do gradiente usam a mesma cor de propósito — não é
// um gradiente visível, é só um jeito de gerar uma forma borrada atrás do
// card. Feito pra marketing especificamente (não é o `Card` genérico do
// shadcn, usado também no dashboard interno, que não deveria ganhar esse
// tratamento decorativo).
export function GlowCard({
  children,
  className,
  clickable = true,
}: {
  children: React.ReactNode
  className?: string
  clickable?: boolean
}) {
  return (
    <div className="group relative h-full">
      <div
        className={cn(
          'absolute -inset-0.5 rounded-2xl bg-violet-600 opacity-20 blur transition-opacity duration-500',
          clickable && 'group-hover:opacity-40',
        )}
      />
      <div
        className={cn(
          'relative flex h-full flex-col rounded-2xl border border-violet-500/20 bg-card p-6 transition-all duration-500',
          clickable && 'group-hover:-translate-y-2 group-hover:border-violet-500/40',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

// Caixa de ícone padrão dentro de um GlowCard (seção 6.3 do guia).
export function GlowCardIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 transition-transform duration-500 group-hover:scale-110">
      <Icon className="size-7 text-violet-400" />
    </div>
  )
}
