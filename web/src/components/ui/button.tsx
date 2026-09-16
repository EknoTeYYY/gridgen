import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Réplica literal do `.btn-cta-glow` do site real da eknotech
        // (NavBar.vue/NavBar.css) — fundo quase-preto + borda roxa + um
        // glow deslizante interno (pseudo-elemento `::before` animado), não
        // um botão preenchido de roxo. Cor de marca literal (não `--primary`,
        // que varia entre claro/escuro), porque o guia trata isso como
        // receita de componente, não como token de tema. Exclusivo dos CTAs
        // de conversão da LP ("Fale com a gente") — não é o botão padrão do
        // produto (login, novo post, etc. usam `default`). Padding/altura/
        // fonte forçados com `!important` pra não depender do `size` que o
        // call site passar (esse variant tem forma própria, fixa).
        cta: "relative overflow-hidden !h-auto !rounded-[10px] !px-5 !py-2 !text-base border-2 border-violet-600 bg-[#0a0a0a] text-white before:pointer-events-none before:absolute before:top-[-25%] before:h-[150%] before:w-20 before:animate-slide-glow before:content-[''] before:[background:linear-gradient(90deg,transparent_0%,rgba(167,139,250,0.15)_20%,rgba(167,139,250,0.3)_50%,rgba(167,139,250,0.15)_80%,transparent_100%)] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
