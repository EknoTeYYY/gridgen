'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const INTERVALO_MS = 3200

// Duas camadas de trás ficam fixas (dão profundidade); a de cima troca de
// imagem sozinha, num crossfade, sem precisar de clique.
export function AutoplayCover({ imagens, trasDireita, trasEsquerda }: { imagens: string[]; trasDireita: string; trasEsquerda: string }) {
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndice((i) => (i + 1) % imagens.length), INTERVALO_MS)
    return () => clearInterval(id)
  }, [imagens.length])

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-3 overflow-hidden rounded-2xl ring-1 ring-border">
        <Image src={trasDireita} alt="" fill className="object-cover opacity-70" sizes="320px" />
      </div>
      <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-1 overflow-hidden rounded-2xl ring-1 ring-border">
        <Image src={trasEsquerda} alt="" fill className="object-cover opacity-85" sizes="320px" />
      </div>
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border">
        {imagens.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="Exemplo de post gerado para a eknotech"
            fill
            className="object-cover transition-opacity duration-700"
            style={{ opacity: i === indice ? 1 : 0 }}
            sizes="320px"
            priority={i === 0}
          />
        ))}
      </div>
    </div>
  )
}
