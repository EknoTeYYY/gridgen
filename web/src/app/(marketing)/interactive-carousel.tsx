'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostExemplo {
  nome: string
  slides: string[]
}

// Cada post é seu próprio carrossel, isolado dos demais (um seletor por cima
// troca QUAL post está em foco) — antes os slides de posts diferentes viviam
// numa fita só, dava a impressão de ser uma coisa só em vez de publicações
// separadas.
export function CarrosselInterativo({
  posts,
  aspecto = 'aspect-4/5',
  largura = 'w-72 sm:w-80',
}: {
  posts: PostExemplo[]
  aspecto?: string
  largura?: string
}) {
  const [postAtivo, setPostAtivo] = useState(0)
  const [slideAtivo, setSlideAtivo] = useState(0)
  const [arrastando, setArrastando] = useState(false)
  const [deslocamento, setDeslocamento] = useState(0)
  const inicioXRef = useRef(0)

  const post = posts[postAtivo]

  function trocarPost(i: number) {
    setPostAtivo(i)
    setSlideAtivo(0)
  }

  function irPara(novo: number) {
    setSlideAtivo(Math.max(0, Math.min(post.slides.length - 1, novo)))
  }

  function aoPressionar(e: React.PointerEvent<HTMLDivElement>) {
    inicioXRef.current = e.clientX
    setArrastando(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function aoMover(e: React.PointerEvent<HTMLDivElement>) {
    if (!arrastando) return
    setDeslocamento(e.clientX - inicioXRef.current)
  }
  function soltar() {
    if (!arrastando) return
    const LIMIAR = 50
    if (deslocamento < -LIMIAR) irPara(slideAtivo + 1)
    else if (deslocamento > LIMIAR) irPara(slideAtivo - 1)
    setDeslocamento(0)
    setArrastando(false)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {posts.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {posts.map((p, i) => (
            <button
              key={p.nome}
              type="button"
              onClick={() => trocarPost(i)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                i === postAtivo
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.nome}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <div
          className={cn(
            'relative touch-pan-y overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border select-none',
            aspecto,
            largura,
          )}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={soltar}
          onPointerLeave={soltar}
        >
          <div
            className="flex h-full"
            style={{
              width: `${post.slides.length * 100}%`,
              transform: `translateX(calc(${-slideAtivo * (100 / post.slides.length)}% + ${deslocamento}px))`,
              transition: arrastando ? 'none' : 'transform 320ms ease',
            }}
          >
            {post.slides.map((src, i) => (
              <div key={src} className="relative h-full shrink-0" style={{ width: `${100 / post.slides.length}%` }}>
                <Image
                  src={src}
                  alt={`${post.nome}, slide ${i + 1} de ${post.slides.length}`}
                  fill
                  className="pointer-events-none object-cover"
                  sizes="320px"
                  draggable={false}
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => irPara(slideAtivo - 1)}
          disabled={slideAtivo === 0}
          className="absolute top-1/2 -left-4 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-opacity disabled:pointer-events-none disabled:opacity-0"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => irPara(slideAtivo + 1)}
          disabled={slideAtivo === post.slides.length - 1}
          className="absolute top-1/2 -right-4 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md transition-opacity disabled:pointer-events-none disabled:opacity-0"
          aria-label="Próximo slide"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          {post.slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ir pro slide ${i + 1}`}
              className={cn('h-1.5 w-1.5 rounded-full transition-colors', i === slideAtivo ? 'bg-foreground' : 'bg-border')}
            />
          ))}
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {post.nome} · {slideAtivo + 1}/{post.slides.length}
        </p>
      </div>
    </div>
  )
}
