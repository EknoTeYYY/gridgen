'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type TipoReveal = 'fade-up' | 'slide-left' | 'slide-right' | 'scale' | 'scale-up' | 'blur'

// Mecanismo de scroll-reveal da IDV Eknotech (docs/design-system-eknotech.md,
// seção 7) — o componente só observa e alterna a classe `.is-visible` na
// primeira vez que entra na viewport (permanece visível depois, não some de
// novo ao rolar pra trás). A transição em si é 100% CSS (globals.css).
export function ScrollReveal({
  children,
  type = 'fade-up',
  delay,
  className,
}: {
  children: React.ReactNode
  type?: TipoReveal
  delay?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} data-scroll={type} data-delay={delay} className={className}>
      {children}
    </div>
  )
}
