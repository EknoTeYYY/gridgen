# Layouts do Gridgen: referência

> Referência de como cada layout é montado no código. Base: `render/src/engine.ts` no commit `98abedb` (05/10/2026).
> Quem usa: Erick (código), Ellen (direção editorial e visual) e o assistente de desenvolvimento.

## 1. Como um slide nasce

1. **Receita do tipo** (`packages/shared/src/types/tipos.ts`): cada tipo de conteúdo define a capa, a
   sequência padrão de layouts e o tema. A IA só usa layouts que estão na receita do tipo.
2. **Sorteio da variação** (`packages/shared/src/types/post-builder.ts`, `aplicarMetadadosSlides`): uma
   variação por layout por post. O mesmo layout repete a mesma variação dentro do post.
   Quantidade de variações por layout: `packages/shared/src/types/variantes.ts`.
3. **Foto por slide** (`api/src/modules/calendario/calendario.service.ts`): a IA devolve uma busca de imagem
   por slide quando acha que cabe foto. A imagem vem da Galeria do Perfil e, se não houver, do Pexels.
4. **Render** (`render/src/engine.ts`, `pageHTML`): monta o HTML do slide com o CSS gerado por `css()` e o
   Chromium tira o screenshot.

Todo slide tem três faixas empilhadas: **topo** (logo grande, só na capa), **meio** (o conteúdo) e
**rodapé** (logo pequena à esquerda e contador à direita).

## 2. Onde mexer em cada coisa (`render/src/engine.ts`)

| O quê | Função / bloco | Linhas aprox. |
|---|---|---|
| Formatos e área segura | `dimensoesPara` | 46-52 |
| Filtro e escurecimento das fotos | início de `css()` (`bleed*`, `frame*`, `fotoSuave`) | 66-91 |
| Escala tipográfica (`T`) | `css()` | 108-123 |
| Escala de espaçamento (`SP`) | `css()` | 130 |
| Temas (`ink`, `brand`, `light`, `paper`) | `css()` | 139-142 |
| Topo e rodapé (logo, contador) | `headBlock`, `footBlock`, `logoNoRodape` | 347-365 |
| Capa com foto (5 variações) | `capaFotoHTML` + CSS `.photo-full*`, `.painel-capa` | 371-387 / 184-230 |
| Foto interna (4 variações) | `photoInternaHTML` + CSS `.photo-frame*`, `.photo-over*` | 397-408 / 169-178, 233-242 |
| Título e texto (`split`, `item`) | `tituloTextoHTML` + CSS `.item-*` | 417-419 / 271-278 |
| Lista (4 variações) | `listHTML` + CSS `.list*` | 423-440 / 249-251, 279-284 |
| Texto sobre foto (regra que anula variações) | `conteudoTipograficoSobreFoto` + CSS `.photo-full` | 483-512 / 188-201 |
| `word`, `bottom`, `cta`, `cover`, `enquete`, `logocover` | `midBlock` | 514-572 |
| Marca d'água | `wmMarkup` | 574-583 |
| Card estilo tweet | `tweetPageHTML` + CSS `.tw-*` | 588-605 / 143-163 |
| Gráfico | `graficoHTML` + CSS `.grafico-*` | 448-462 / 293-306 |

## 3. Regras globais

- **Formatos:** feed 1080×1350, quadrado 1080×1080, Stories 1080×1920. Margem lateral de 96px. Topo e base
  de 96px no feed e no quadrado; no Stories, 280px no topo e 320px na base.
- **Temas:**

  | Tema | Fundo | Texto | Logo usada |
  |---|---|---|---|
  | `ink` (padrão de todas as receitas) | cor de fundo da marca com dois brilhos suaves | cor de texto da marca | branca |
  | `brand` | cor primária escurecida | branco | branca |
  | `light` | branco | grafite `#1A1830` | colorida |
  | `paper` | cinza `#F4F4F6` | grafite | colorida |

- **Regra da foto:** quando um layout de texto (`cover`, `word`, `bottom`, `split`, `item`, `list`, `cta`,
  `enquete`) recebe foto, **a variação é ignorada**. O slide vira foto sangrada, escurecida, com texto
  branco embaixo. As variações só aparecem em slides sem foto.
- **Marca d'água:** ícone da marca grande e quase transparente no canto superior direito, só em slide
  sem foto.
- **Produtos e Serviços:** filtro e escurecimento da foto mais leves (`fotoSuave`), para o produto
  aparecer.
- **Escala tipográfica (px):** 20 · 24 · 28 · 34 · 45 · 58 · 64 · 78 · 84 · 90 · 100 · 112 · 148.
- **Escala de espaçamento (px):** 8 · 16 · 24 · 32 · 40 · 48 · 64 · 96.

## 4. Catálogo de layouts

No código as variações começam em 0. Aqui, "Variação 1" corresponde a `variante 0`.

### 4.1 Capa com foto (`photo`, `full: true`)

**Usada em:** capa de Conexão e de Produtos e Serviços. **Variações:** 5.
Base comum: foto sangrada no slide inteiro, levemente dessaturada e escurecida, com véu nas cores da marca.

| Variação | Título | Logo | Escurecimento da foto |
|---|---|---|---|
| 1 (`v0`) | embaixo, 90px | topo | forte na base, leve no meio, médio no topo |
| 2 (`v1`) | centralizado nos dois eixos, 100px | topo | radial: bordas escuras, centro claro |
| 3 (`v2`) | ancorado no topo, 84px | **rodapé**, ao lado do contador | escuro no topo e na base, limpo no meio |
| 4 (`v3`) | dentro de um **painel** em degradê da marca, cantos de 32px, sombra, ancorado embaixo, 78px | topo | quase nenhum (o painel garante a leitura) |
| 5 (`v4`) | embaixo, caixa alta, 112px, extra-negrito, entrelinha apertada | topo | igual à variação 1 |

### 4.2 Capa de texto (`cover`)

**Usada em:** capa do Educativo. **Variações:** 1.
Sem foto: logo no topo, título de 78px embaixo, com espaço extra antes do rodapé, e subtítulo em fonte mono.
Com foto: segue a regra da foto (título branco embaixo).

### 4.3 Foto interna (`photo`, sem `full`)

**Usada em:** slides internos de Educativo, Conexão e Produtos e Serviços; peça única da Prova Social
(com logo no topo). **Variações:** 4. A foto fica numa moldura sobre o fundo do tema.

| Variação | Composição |
|---|---|
| 1 (`v0`) | moldura de 600px, cantos de 34px, sombra; título (58px) e subtítulo **dentro** da foto, embaixo |
| 2 (`v1`) | moldura de 520px; título e subtítulo **abaixo** da foto, sobre o fundo do tema |
| 3 (`v2`) | igual à 2, invertida: texto em cima, foto embaixo |
| 4 (`v3`) | foto de 500px (cantos de 16px só em cima) emendada numa **faixa em degradê da marca** (cantos de 24px só embaixo) com título e subtítulo brancos |

### 4.4 Título e texto (`split` e `item`)

**Usados em:** `split` em Educativo, Conexão e Produtos e Serviços; `item` só em Educativo.
**Variações:** 1. Os dois têm o **mesmo visual**.
Sem foto: título de 64px e parágrafo de 45px na cor secundária do tema, até ~30 caracteres por linha,
centralizados na vertical. Com foto: título de 78px branco e parágrafo a 86% de opacidade, embaixo.

### 4.5 Lista (`list`)

**Usada em:** Produtos e Serviços. **Variações:** 4 (só sem foto). Título opcional de 58px, itens de 45px.

| Variação | Marcador |
|---|---|
| 1 (`v0`) | quadradinho arredondado em degradê da marca |
| 2 (`v1`) | número dentro de círculo translúcido na cor de destaque |
| 3 (`v2`) | cada item num cartão de fundo sutil, com o quadradinho |
| 4 (`v3`) | check branco num quadrado sólido na cor de destaque |

Com foto: sempre a variação 1, itens brancos embaixo.

### 4.6 Palavra de impacto (`word`)

**Usada em:** Conexão. **Variações:** 4. Manchete de 148px, a maior do sistema.

| Variação | Composição |
|---|---|
| 1 (`v0`) | à esquerda, centralizada na vertical |
| 2 (`v1`) | centralizada na horizontal |
| 3 (`v2`) | à esquerda; a palavra marcada ganha fundo sólido na cor de destaque (marca-texto) |
| 4 (`v3`) | à direita, centralizada na vertical |

### 4.7 Frase embaixo (`bottom`)

**Usada em:** nenhuma receita (a IA não gera). **Variações:** 4. Frase de 78px.
1: embaixo · 2: centralizada · 3: no topo · 4: embaixo com barrinha de 120px em degradê acima.

### 4.8 Fechamento (`cta`)

**Usado em:** último slide de Educativo, Conexão, Produtos e Serviços e Interativo. **Variações:** 4.
Chamada de 78px e destino em fonte mono na cor de destaque.
1: embaixo · 2: centralizado · 3: embaixo, destino numa **pílula** em degradê · 4: no topo.
Com foto: chamada branca embaixo, destino em texto simples.

### 4.9 Enquete (`enquete`)

**Usada em:** Interativo, sempre Stories. **Variações:** 1. Pergunta de 78px, opções em caixas com borda e
fundo translúcido na cor de destaque, e a nota "Espaço reservado para a enquete nativa do Instagram".
O próprio código registra que é um tratamento mínimo, sem passada de design.

### 4.10 Capa com logo (`logocover`)

**Usada em:** nenhuma receita (era da antiga categoria Âncora). Logo de 760px no centro, frase curta em
caixa alta mono espaçada, tema `brand`.

### 4.11 Card estilo tweet (`tweet`)

**Usado em:** posts gerados no estilo "tweet". Temas claro (fundo branco) e escuro (fundo preto), com cores
que imitam a rede social, não a marca. Avatar redondo de 120px com o ícone da marca, nome com selo azul,
@ do Instagram e texto de 50px em negrito. Sem logo e sem contador. Foto opcional; com foto e texto acima
de 150 caracteres, os dois encolhem.

### 4.12 Gráfico (`grafico`)

**Usado em:** estilo "gráfico", peça única com números preenchidos à mão. Título, subtítulo e barras
proporcionais ao maior valor (até 480px). A barra destacada é verde.

### 4.13 Frase simples (`statement`)

Usado só quando um slide chega sem layout. Frase de 78px centralizada na vertical.
