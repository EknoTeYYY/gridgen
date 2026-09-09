'use client'

import { useState } from 'react'
import { Clapperboard, Images, MessageCircle, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CarrosselInterativo } from './interactive-carousel'

interface PostExemplo {
  nome: string
  slides: string[]
}

const TIPOS = [
  { chave: 'carrossel', label: 'Carrossel', icon: Images },
  { chave: 'stories', label: 'Stories', icon: Smartphone },
  { chave: 'tweets', label: 'Tweets', icon: MessageCircle },
  { chave: 'reels', label: 'Reels', icon: Clapperboard, emBreve: true },
] as const

type Tipo = (typeof TIPOS)[number]['chave']

export function TiposDeConteudo({
  carrossel,
  stories,
  tweets,
}: {
  carrossel: PostExemplo[]
  stories: PostExemplo[]
  tweets: PostExemplo[]
}) {
  const [tipoAtivo, setTipoAtivo] = useState<Tipo>('carrossel')

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex items-center gap-1 rounded-full border p-1">
        {TIPOS.map((tipo) => (
          <button
            key={tipo.chave}
            type="button"
            disabled={'emBreve' in tipo && tipo.emBreve}
            onClick={() => setTipoAtivo(tipo.chave)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              'emBreve' in tipo && tipo.emBreve
                ? 'cursor-not-allowed text-muted-foreground/50'
                : tipoAtivo === tipo.chave
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <tipo.icon className="size-4" />
            {tipo.label}
            {'emBreve' in tipo && tipo.emBreve && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Em breve
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 flex min-h-[520px] w-full flex-col items-center justify-center">
        {tipoAtivo === 'carrossel' && (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-md text-center text-sm text-muted-foreground">
              Sequência de slides pro feed, cada um com seu papel dentro do post.
            </p>
            <CarrosselInterativo posts={carrossel} aspecto="aspect-4/5" largura="w-64 sm:w-72" />
          </div>
        )}

        {tipoAtivo === 'stories' && (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-md text-center text-sm text-muted-foreground">
              Formato vertical, pensado pra tela cheia e pro polegar que arrasta rápido.
            </p>
            <CarrosselInterativo posts={stories} aspecto="aspect-9/16" largura="w-48 sm:w-56" />
          </div>
        )}

        {tipoAtivo === 'tweets' && (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-md text-center text-sm text-muted-foreground">
              Texto que engaja como tweet rende mais em forma de tweet. Mesma marca, mesmo método, formato que
              conversa diferente com quem rola o feed rápido.
            </p>
            <CarrosselInterativo posts={tweets} aspecto="aspect-4/5" largura="w-64 sm:w-72" />
          </div>
        )}
      </div>
    </div>
  )
}
