# Identidade Visual Eknotech (IDV) — Guia de Design

> Fonte da verdade: a LP institucional (`ekno-tech`, este repo). Este documento existe para que Gridgen (`studio`), Gedfy e Athelium consigam recriar a mesma identidade visual sem precisar ler o código-fonte da LP. É documentação de **design** (cores, tipografia, componentes, espaçamento, motion) — copy/conteúdo textual não faz parte deste guia, pois está em revisão separada.

## 1. Princípios

- **Dark mode como base.** Fundo preto puro (`#000000`) em todas as seções — não é "dark theme opcional", é a identidade.
- **Uma cor de marca.** Roxo `#7c3aed` é o único acento de cor real do produto. Não introduzir outras cores de marca — a única exceção deliberada é verde para o CTA de WhatsApp (ação de contato, não de marca).
- **Vidro fosco (glassmorphism) na navegação.** A navbar flutua sobre o conteúdo com `backdrop-blur`, nunca é uma barra opaca full-width.
- **Cards com glow de borda.** O componente visual mais repetido do site é um card com um "halo" gradiente borrado atrás dele, que acende no hover. Esse é o "assinatura visual" do produto — ver seção 6.3.
- **Ícones outline minimalistas.** SVG inline, traço fino (stroke-width 2), nunca ícones preenchidos/coloridos sólidos.
- **Motion sutil.** Reveal-on-scroll suave, hover com leve scale/translate — nunca animações chamativas ou longas.

## 2. Cores

### 2.1 Escala de roxo (marca)

| Token (Tailwind) | Hex | Uso |
|---|---|---|
| `purple-400` | `#a78bfa` | Ícones dentro de caixas tintadas, texto de tag/chip, gradiente claro |
| `purple-500` | `#8b5cf6` | Meio de gradientes de texto |
| `purple-600` | `#7c3aed` | **Cor primária.** Botões, bordas de foco, glow, badges, dots |
| `purple-700` | `#6d28d9` | Hover de botões sólidos (escurece) |
| `purple-800` | `#5b21b6` | Reservado (sem uso confirmado hoje) |
| `purple-900` | `#4c1d95` | Reservado (sem uso confirmado hoje) |

`#7c3aed` também aparece como `rgba(124, 58, 237, α)` para fundos/bordas/glows tintados. Alfas usados na prática: `0.03` (linhas de grid), `0.1` (fundo de caixa de ícone/badge), `0.15`–`0.2` (bordas de badge, glow), `0.3`–`0.4` (sombras de botão, bordas de hover), `0.5` (sombra de hover de botão primário), `0.8` (glow de barra de progresso).

> Uma escala `blue` (400–900) existe no `tailwind.config.js` mas **não é usada em nenhum conteúdo real** — aparece só em dados de demonstração (carrossel de empresas fictícias). Não adotar azul como cor de marca.

### 2.2 Neutros

| Token | Hex/valor | Uso |
|---|---|---|
| Preto | `#000000` | Fundo de página/seção (`bg-black`) |
| Quase-preto | `#0a0a0a` | Fundo do botão CTA da navbar |
| Cartão | `bg-gray-900/90` | Preenchimento padrão de card |
| Cartão alternativo | `gradient-to-br from-gray-900 to-gray-800` | Cards de duas cores (CTA) |
| Tile simples | `bg-gray-800/30` | Tiles menores/planos (StatCard, linhas de contato) |
| Branco | `#ffffff` | Headings, texto principal sobre fundo escuro |
| Borda sutil | `rgba(255,255,255,0.1)` | Borda da navbar flutuante e painéis dropdown |
| Texto secundário | `#d4d4d4` | Links de navegação (estado padrão) |
| Texto terciário | `#a1a1a1` | Subtítulos, descrições de dropdown |
| Texto de apoio | `text-gray-400` | Parágrafos de descrição em cards |
| Legendas | `text-gray-500` / `text-gray-600` | Labels em uppercase, captions pequenas |

### 2.3 Verde (somente CTA de WhatsApp)

Usado exclusivamente para a ação de "falar no WhatsApp" — nunca para outro propósito: `from-green-600 to-green-500` (hover `from-green-500 to-green-400`), `border-green-500/30`, `text-green-400`, `shadow-green-500/30` (hover `/50`).

## 3. Tipografia

- **Corpo de texto:** Inter (`system-ui, -apple-system, sans-serif` como fallback).
- **Headings (h1–h6):** Poppins, `font-weight: 700`, `letter-spacing: -0.02em` por padrão. `h1` é `800`, `h2` é `700`, `h3`/`h4` são `600`.
- Suavização de fonte: `-webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;`

### Escala tipográfica (valores reais em uso)

| Papel | Especificação |
|---|---|
| Título hero | `clamp(2.5rem, 6vw, 5rem)`, weight `600`, `line-height: 1.1`, `letter-spacing: -0.02em` (mobile: `clamp(1.875rem, 7vw, 2.75rem)`) |
| Subtítulo hero | `clamp(1rem, 2vw, 1.25rem)`, `line-height: 1.6`, cor `#a1a1a1`, `max-width: 820px` |
| H2 de seção | `text-4xl md:text-5xl lg:text-6xl font-bold` (36px → 48px → 60px) |
| H2 de seção secundária (CTA) | `text-3xl md:text-4xl font-bold` |
| H3 de card | `text-2xl font-bold text-white` |
| H3/H4 menor (footer, cards pequenos) | `text-lg font-bold` / `text-base font-bold` |
| Intro de seção | `text-xl text-gray-300 leading-relaxed` |
| Corpo de card | `text-base text-gray-400 leading-relaxed` (classe implícita, sem sufixo de tamanho) |
| Caption/label | `text-xs text-gray-500 uppercase tracking-wider` |
| Link de navegação | `1rem`, weight `500` (`0.9375rem` em telas ≤1024px) |

> Nota de inconsistência conhecida: o `.hero-title` sobrescreve o peso global de `h1` (800) para `600` via especificidade de classe — isso é intencional no hero, mas não deve ser copiado como regra geral de h1.

## 4. Espaçamento, grid e breakpoints

- **Container:** `container mx-auto` + `relative z-10` (para ficar acima dos efeitos de fundo). Larguras internas máximas conforme o bloco: `max-w-3xl` (texto), `max-w-4xl`/`max-w-5xl` (hero/CTA), `max-w-6xl` (grids de 3 colunas).
- **Padding vertical de seção:** seções "cheias" usam `min-h-screen flex flex-col justify-center` + `py-16`; seções de fechamento (CTA, footer) usam `py-8`.
- **Grid gaps:** `gap-8` (grids principais de 3 colunas), `gap-6` (grids de 2/4 colunas), `gap-3` / `gap-2.5` (linhas de chips e tiles pequenos).
- **Padding interno de card:** `p-6` (cards principais), `p-5` (cards de CTA/tiras de stat), `p-3` (tiles de contato).
- **Divisor decorativo:** toda seção usa a mesma régua fixa `w-32 h-1` com gradiente (ver 6.3).
- **Breakpoints:** `1024px`, `768px`, `480px` — os três únicos breakpoints usados no projeto inteiro.

## 5. Fundo padrão de seção

Toda seção de conteúdo (`<section class="bg-black relative overflow-hidden">`) tem duas camadas de fundo, sempre nesta ordem:

1. `<BackgroundEffect />` — quadrados rotacionados (losangos) flutuantes, ver 5.1.
2. Um padrão de pontos sutil, **idêntico em todo o site**:

```html
<div class="absolute inset-0 opacity-5">
  <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(124, 58, 237, 0.15) 1px, transparent 0); background-size: 30px 30px;"></div>
</div>
```

### 5.1 BackgroundEffect (losangos flutuantes)

- ~10 quadrados posicionados nas bordas da tela (2–8% das laterais), rotacionados 45°, apenas contorno (sem preenchimento): `border: 2px solid #7c3aed; border-radius: 8px; transform: rotate(45deg);`.
- Tamanhos entre 50–120px, opacidade entre 0.05–0.12, animação de flutuação (`translateY` + rotação contínua) com durações 18–27s e delays escalonados.
- Reativado via `IntersectionObserver` sempre que a seção reentra na viewport.
- Em ≤768px: mostra só os 6 primeiros, todos fixados em 50×50px.
- Respeita `prefers-reduced-motion: reduce` (opacidade fixa em 0.05, sem animação).

## 6. Componentes

### 6.1 Navbar flutuante (glass pill)

Este é o elemento mais reconhecível da IDV — **não é uma barra full-width**, é uma pílula flutuante centralizada:

```css
.navbar-wrapper { position: fixed; top: 0; width: 100%; padding: 16px 0; display: flex; justify-content: center; }
.navbar-floating {
  max-width: 1100px;
  width: 92%;
  background: transparent;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 24px;
  transition: all 0.3s ease;
}
.navbar-floating:hover {
  background: rgba(15, 15, 15, 0.3);
  border-color: rgba(124, 58, 237, 0.2);
}
```

- Logo: `height: 52px` desktop, `44px` em ≤768px, `40px` em ≤480px.
- Links: cor `#d4d4d4`, hover `#ffffff`, com sublinhado animado (`::after`, `height: 2px; background: #7c3aed;`, largura `0 → 100%` em `0.3s`).
- Dropdown de produtos: painel `320px`, `background: rgba(15,15,15,0.97)`, mesmo `backdrop-filter: blur(20px)`, `border-radius: 12px`, `box-shadow: 0 20px 40px rgba(0,0,0,0.4)`. Cada item tem 8px de raio e `background: rgba(124,58,237,0.1)` no hover.
- Em mobile (≤768px), a pílula vira um fundo sólido semitransparente (`rgba(15,15,15,0.85)`) em vez de transparente+blur, para não ficar ilegível sobre conteúdo em scroll.

### 6.2 Botões

| Variante | Uso | Especificação |
|---|---|---|
| **Primário sólido** (`.btn-primary`) | CTA principal do hero | `padding: 14px 32px; border-radius: 8px; background: #7c3aed; border: 2px solid #7c3aed; box-shadow: 0 0 20px rgba(124,58,237,0.3);` hover: `background: #6d28d9; box-shadow: 0 0 30px rgba(124,58,237,0.5); translateY(-2px)` |
| **Secundário outline** (`.btn-secondary`) | CTA secundário do hero | `background: transparent; border: 2px solid rgba(124,58,237,0.5); color: #fff;` hover: `background: rgba(124,58,237,0.1); border-color: #7c3aed; translateY(-2px)` |
| **CTA da navbar** (`.btn-cta-glow`) | "Entrar em Contato" na navbar | Pílula escura (`background: #0a0a0a; border: 2px solid #7c3aed; border-radius: 10px;`) com um brilho interno que desliza em loop (`::before` com gradiente linear animado, 4s, `ease-in-out infinite`). Hover: `box-shadow: 0 0 20px rgba(124,58,237,0.4)` |
| **CTA mobile** (`.mobile-dropdown-cta`) | CTA dentro do menu mobile | `background: #7c3aed; border-radius: 8px;` hover: `background: #6d28d9; translateY(-1px)` |
| **CTA gradiente (páginas de produto)** | "Acessar produto" | `bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-500 hover:to-purple-500 rounded-lg shadow-lg hover:shadow-purple-500/50 hover:scale-105` |
| **CTA de WhatsApp** | Única variante verde do site | `bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105` |

Todas as variantes: `transition: all 0.3s ease` (ou `duration-300` no Tailwind), nunca instantâneas.

### 6.3 Cards — padrão de "glow" de borda (o componente-assinatura)

Esse é o padrão mais repetido do site (cards de produto, pilares "quem somos", CTAs) e é o que dá a sensação de profundidade sem usar sombras pesadas. Estrutura de duas camadas:

```html
<div class="group relative">
  <!-- camada de glow: maior que o card, borrada, opacidade baixa -->
  <div class="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>

  <!-- camada de conteúdo: por cima, opaca -->
  <div class="relative bg-gray-900/90 p-6 rounded-2xl border border-purple-500/20 transform transition-all duration-500 group-hover:-translate-y-2 group-hover:border-purple-500/40">
    <!-- conteúdo do card -->
  </div>
</div>
```

Mecânica:
- A camada de trás usa **as duas pontas do gradiente com a mesma cor** (`from-purple-600 to-purple-600`) — não é um gradiente visível, é só um jeito de gerar uma forma borrada (`blur`) atrás do card.
- `-inset-0.5` faz o glow "vazar" um pouco além das bordas do card (`-inset-1` na variante verde do WhatsApp).
- Repouso: opacidade do glow `20%`, borda do card `purple-500/20`.
- Hover: opacidade do glow sobe para `40%`, borda para `purple-500/40`, card sobe `8px` (`-translate-y-2`) — tudo em `duration-500`.
- Cards não-clicáveis (tiras de estatística, tags de tecnologia) usam a mesma camada de glow mas **sem** `group`/hover — ficam estáticos em opacidade 20%.
- Raio sempre `rounded-2xl` (16px) nas duas camadas — precisam bater exatamente.

Ícone dentro do card: caixa `w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/30`, ícone `h-7 w-7 text-purple-400`, com `group-hover:scale-110`.

Logo de produto dentro do card: `<div class="h-12 flex items-center group-hover:scale-105 origin-left"><img class="h-10 w-auto object-contain"></div>`.

### 6.4 Badges e chips

Todos compartilham o mesmo DNA: fundo roxo (sólido ou tintado 10%), **sempre totalmente arredondados** (`rounded-full` / `999px` / `50px`), texto branco ou `purple-300`, peso semibold/bold, padding compacto.

| Tipo | Especificação |
|---|---|
| Badge "Novo" (canto do card) | `absolute -top-3 right-6 px-3 py-1 bg-purple-600 rounded-full`, texto `text-xs font-semibold text-white` |
| Badge inline (ao lado de nome) | `text-sm font-semibold text-white bg-purple-600 px-3 py-1 rounded-full` |
| Badge no dropdown da navbar | `font-size: 0.625rem; font-weight: 700; background: #7c3aed; padding: 2px 8px; border-radius: 999px;` |
| Chip/tag (ex: lista de tecnologias) | `px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium` |

### 6.5 Ícones

- SVG inline, estilo outline (tipo Heroicons): `viewBox="0 0 24 24" fill="none" stroke="currentColor"`, `stroke-linecap="round" stroke-linejoin="round" stroke-width="2"`.
- Cor via `currentColor` + classe de texto, quase sempre `text-purple-400`.
- Escala de tamanho: `16px` (inline, dropdown), `20px` (tiles pequenos), `28px` (ícone de card `w-14 h-14`), `40px` (placeholder grande `w-20 h-20`).
- Convenção "ícone dentro de caixa": caixa quadrada/arredondada com `bg-purple-500/10 border border-purple-500/30`, ícone centralizado — nunca ícone solto sem caixa em contexto de destaque.
- Ícones de marca/contato (WhatsApp, e-mail, redes sociais) usam Font Awesome, não SVG inline — é a única exceção ao padrão outline.

## 7. Animações (scroll-reveal)

Todo elemento que "aparece" ao rolar a página usa o atributo `data-scroll`, nunca uma lib de animação pesada:

```html
<h2 data-scroll="blur" data-delay="1">...</h2>
<p data-scroll="fade-up" data-delay="3">...</p>
```

- Tipos disponíveis: `fade-up` (sobe 60px), `slide-left` / `slide-right` (desliza 60px lateral), `scale` (0.9→1), `scale-up` (sobe 40px + escala 0.95→1), `blur` (desfoque 10px + sobe 30px + escala 0.98→1).
- Transição padrão: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)` (`0.6s` em ≤768px).
- Delays: `data-delay="1"` a `"6"` = `0.1s` a `0.6s` de `transition-delay`, para escalonar elementos em sequência.
- Duração alternativa opcional: `data-duration="fast"` (0.5s) ou `"slow"` (1.2s).
- Disparado por `IntersectionObserver` (`threshold: 0.2`), adiciona classe `.is-visible` permanentemente na primeira entrada.
- **Sempre respeitar `prefers-reduced-motion: reduce`**: nesse caso, remover toda animação e deixar os elementos visíveis (`opacity: 1 !important; transform: none !important;`).

## 8. Convenção de assets de logo

Cada produto tem dois arquivos em `/public`:

```
/{slug}-logo-branca.png   → versão branca, usada sobre fundo escuro (uso atual em 100% dos casos)
/{slug}-logo-roxa.png     → versão roxa, reservada para uso futuro sobre fundo claro
```

**Regra crítica:** o PNG precisa vir **recortado rente ao conteúdo** (bounding box do texto/logo + uma margem pequena e proporcional, na casa de 80–90px em uma exportação de ~4300–4500px de largura — o mesmo padrão usado nos arquivos de Gedfy e Gridgen). Um arquivo entregue em canvas quadrado com a marca ocupando só uma tira fina no meio vai renderizar minúsculo sempre que o componente fixar a **altura** via CSS (`h-10`, `h-16` etc.) e deixar a largura em `auto` — porque a proporção real do canvas é que define a largura renderizada, não o texto em si. Isso já causou um bug real na logo do Athelium (canvas 4500×4500 com o texto ocupando 810px de altura) e foi corrigido recortando a imagem. **Sempre validar a proporção largura/altura do arquivo recebido do time de marketing antes de subir para produção.**

## 9. Como implementar em cada stack

O token canônico é a cor `#7c3aed` (roxo-600) + fontes Inter/Poppins. Abaixo, três formas de declarar os mesmos tokens conforme a stack do repo.

### Tailwind v3 (config file) — usado hoje em `ekno-tech`

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        purple: {
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed',
          700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
        },
      },
    },
  },
}
```

### Tailwind v4 (CSS-first, `@theme`) — usado hoje em Gridgen/`studio` e Gedfy

```css
/* globals.css */
@theme {
  --color-purple-400: #a78bfa;
  --color-purple-500: #8b5cf6;
  --color-purple-600: #7c3aed;
  --color-purple-700: #6d28d9;
  --font-sans: var(--font-inter);
  --font-heading: var(--font-poppins);
}
```

Se o projeto já usa a escala `violet` do Tailwind (é o caso do Gridgen) e ela está mapeada para os mesmos tons, não é necessário duplicar — só confirmar que `--primary`/`--ring` apontam para `violet-600` (`#7c3aed`-equivalente) e não para outro tom.

### CSS puro / variáveis (fallback universal)

```css
:root {
  --brand-purple-400: #a78bfa;
  --brand-purple-500: #8b5cf6;
  --brand-purple-600: #7c3aed;
  --brand-purple-700: #6d28d9;
  --bg-black: #000000;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-heading: 'Poppins', system-ui, sans-serif;
}
```

## 10. Notas de adaptação por produto

- **Gridgen (`studio`):** já usa `violet` como cor primária e Inter/Poppins — é o repo mais próximo da IDV hoje. A navbar já é flutuante com blur; ajustar principalmente o raio do canto (hoje `rounded-xl`, alvo é uma pílula com `border-radius: 12px` sobre `max-width: 1100px`/`92%` de largura) e conferir se o hover dos links segue o sublinhado animado da seção 6.1.
- **Gedfy:** é o que mais diverge — usa a fonte Geist (trocar para Inter/Poppins), gradientes indigo/navy fixos em hex (`#312E81` → `#1E3A8A`) em vez do roxo de marca, e uma navbar tradicional full-width sem vidro/blur em vez da pílula flutuante. Recriar a navbar como componente novo seguindo a seção 6.1 é o maior ganho de consistência.
- **Athelium:** tem uma identidade própria e deliberada ("stone + plum", primária `#5D4E6D`), documentada no próprio `tailwind.config.ts` como independente da LP. **Não sobrescrever automaticamente** — esse é um sinal de decisão de produto já tomada, não um desvio acidental. Este guia serve como referência para decidir, junto ao time, se/quando vale a pena reconciliar as duas identidades — não como uma ordem de substituição imediata.
