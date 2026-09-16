'use client'

// Fundo padrão de seção da IDV Eknotech (docs/design-system-eknotech.md,
// seção 5): duas camadas, sempre nesta ordem — losangos flutuantes atrás,
// padrão de pontos por cima. As duas em `pointer-events-none` e atrás do
// conteúdo (a seção que usa isto precisa ter `position: relative` e o
// conteúdo real com `z-10` ou mais).

const QUADRADOS = [
  { top: '6%', left: '3%', size: 90, duration: 22, delay: 0 },
  { top: '15%', left: '92%', size: 60, duration: 19, delay: 2 },
  { top: '40%', left: '5%', size: 110, duration: 25, delay: 1 },
  { top: '58%', left: '88%', size: 70, duration: 20, delay: 3 },
  { top: '78%', left: '4%', size: 55, duration: 27, delay: 4 },
  { top: '85%', left: '90%', size: 95, duration: 23, delay: 1.5 },
  { top: '25%', left: '50%', size: 65, duration: 21, delay: 2.5 },
  { top: '92%', left: '45%', size: 80, duration: 24, delay: 0.5 },
  { top: '8%', left: '70%', size: 50, duration: 18, delay: 3.5 },
  { top: '55%', left: '15%', size: 120, duration: 26, delay: 1 },
]

function FloatingSquares() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {QUADRADOS.map((q, i) => (
        <div
          key={i}
          className={`absolute rounded-lg border-2 border-violet-600 opacity-[0.08] motion-safe:animate-float ${i >= 6 ? 'hidden sm:block' : ''}`}
          style={{
            top: q.top,
            left: q.left,
            width: q.size,
            height: q.size,
            transform: 'rotate(45deg)',
            animationDuration: `${q.duration}s`,
            animationDelay: `${q.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function BackgroundDots() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-5"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(124, 58, 237, 0.15) 1px, transparent 0)',
        backgroundSize: '30px 30px',
      }}
    />
  )
}

export function SectionBackground() {
  return (
    <>
      <FloatingSquares />
      <BackgroundDots />
    </>
  )
}
