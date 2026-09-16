import { CalendarClock, ChevronDown, ChevronRight, FileCheck2, PenLine, Sparkles, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

const PASSOS = [
  {
    numero: '01',
    icon: PenLine,
    titulo: 'Configure o Perfil',
    descricao:
      'Cores, fonte e logo da marca, de um cliente ou da própria conta. Cada Perfil guarda seu próprio BrandKit, então o motor nunca mistura a identidade visual de uma marca com a de outra.',
  },
  {
    numero: '02',
    icon: Sparkles,
    titulo: 'Conte sobre a marca',
    descricao:
      'Uma conversa, não um formulário técnico. O que a marca vende, pra quem e como fala vira o contexto que orienta toda geração de conteúdo depois, sem precisar reexplicar toda vez.',
  },
  {
    numero: '03',
    icon: Wand2,
    titulo: 'Peça pra IA gerar',
    descricao:
      'Escolha o tipo de post. Cada um já tem uma receita própria de estrutura e objetivo, e a IA escreve respeitando o contexto da marca e o método daquele tipo, não texto genérico solto.',
  },
  {
    numero: '04',
    icon: FileCheck2,
    titulo: 'Revise e aprove',
    descricao:
      'Nada sai sem você olhar antes. Ajuste texto, troque uma foto e então gere as imagens: cada slide numerado, com a legenda pronta ao lado.',
  },
  {
    numero: '05',
    icon: CalendarClock,
    titulo: 'Deixe o calendário trabalhar',
    descricao:
      'Datas comerciais e datas próprias da marca (aniversário, lançamento) geram rascunho sozinhas, com antecedência. Você só revisa e aprova quando o conteúdo já está esperando.',
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
      <div className="max-w-xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">Como funciona</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Da configuração da marca até o post pronto pra publicar, sem precisar de designer em nenhuma etapa.
        </p>
      </div>

      {/* Telas largas: jornada horizontal, uma seta ligando cada passo ao próximo. */}
      <div className="relative mt-20 hidden lg:grid lg:grid-cols-5 lg:gap-6">
        <div className="absolute inset-x-[10%] top-6 h-px bg-border" />
        <ChevronRight className="absolute top-6 left-[20%] size-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
        <ChevronRight className="absolute top-6 left-[40%] size-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
        <ChevronRight className="absolute top-6 left-[60%] size-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
        <ChevronRight className="absolute top-6 left-[80%] size-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />

        {PASSOS.map((passo) => (
          <div key={passo.numero} className="relative z-10 flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-primary">
              <passo.icon className="size-5" />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{passo.numero}</span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-base font-semibold">{passo.titulo}</h2>
              <p className="text-sm text-muted-foreground">{passo.descricao}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Telas estreitas: mesma jornada, vertical, com linha e seta ligando os passos. */}
      <div className="mt-16 flex flex-col lg:hidden">
        {PASSOS.map((passo, i) => (
          <div key={passo.numero} className="relative flex gap-6 pb-10 last:pb-0">
            <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-primary">
              <passo.icon className="size-5" />
            </div>
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="font-mono text-xs text-muted-foreground">{passo.numero}</span>
              <h2 className="text-xl font-semibold">{passo.titulo}</h2>
              <p className="max-w-lg text-muted-foreground">{passo.descricao}</p>
            </div>
            {i < PASSOS.length - 1 && (
              <div className="absolute top-12 left-6 h-10 w-px -translate-x-1/2">
                <div className="absolute inset-0 bg-border" />
                <ChevronDown className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 border-t pt-12">
        <h2 className="text-2xl font-semibold tracking-tight">O que acontece depois de aprovado</h2>
        <p className="max-w-lg text-muted-foreground">
          O post pronto fica marcado pra cada rede escolhida (Instagram, LinkedIn, TikTok) e disponível pra
          baixar e publicar. No horário agendado, você recebe um e-mail com o link pronto — só baixar as imagens,
          copiar a legenda e publicar.
        </p>
        <Link href="/contato" className={buttonVariants({ size: 'lg' })}>
          Fale com a gente
        </Link>
      </div>
    </div>
  )
}
