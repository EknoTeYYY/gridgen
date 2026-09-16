# Como o Gridgen gera conteúdo

Documento de referência sobre o processo criativo do Gridgen: como cada peça de conteúdo nasce, quais formatos existem hoje, o que já funciona bem, o que está em revisão e o que ainda não existe. Escrito para o time de marketing usar como base ao planejar, revisar ou propor melhorias nos tipos de conteúdo.

Este documento descreve o estado ATUAL da ferramenta (setembro de 2026). Onde algo está em revisão ou ainda não foi construído, isso está marcado explicitamente.

---

## 1. Visão geral do processo

Um post nasce em 6 passos:

1. **Perfil**: cada cliente tem um Perfil, com identidade de marca própria (cores, fonte, logo, ícone), dados de contato (telefone, site, Instagram) e uma Galeria de imagens própria.
2. **Contexto de marca**: uma conversa guiada (chat com IA) constrói um documento vivo sobre a marca, cobrindo produtos/serviços, público-alvo, diferenciais e tom de voz. Esse contexto é usado em toda geração de texto.
3. **Escolha na criação do post**: quem cria escolhe Tipo de conteúdo, Formato (Feed/Quadrado/Stories), Estilo visual (Estático/Tweet/Gráfico) e Método de conversão (o que o CTA final faz).
4. **Geração por IA**: a IA escreve o texto de cada slide seguindo a receita do tipo escolhido, e sugere buscas de imagem quando o layout pede foto. As imagens são resolvidas automaticamente, com a Galeria do Perfil como primeira opção e um banco de imagens de terceiros como reforço.
5. **Revisão manual**: o post nasce em rascunho. Quem usa a ferramenta revisa texto, troca foto se quiser, e só então manda gerar as imagens finais.
6. **Render**: o motor de imagem transforma cada slide em um PNG pronto pra postar, já com a identidade visual do Perfil aplicada.

Depois de pronto, o post pode ganhar uma versão adaptada pra LinkedIn e/ou TikTok, um agendamento (que dispara um lembrete por e-mail na hora certa) e o download do zip com todas as imagens + legenda.

**Importante: a publicação em si é sempre manual.** O Gridgen nunca posta sozinho em rede nenhuma. Ele entrega a arte pronta e a legenda; quem publica é uma pessoa.

---

## 2. Glossário rápido

| Termo | O que é |
|---|---|
| **Perfil** | O cliente/marca dentro de uma Conta. Tem identidade visual própria. |
| **Tipo de conteúdo** | A intenção/narrativa do post (Dor, Prova, Didático, etc.). Decide O QUE o post diz e quantos slides tem. |
| **Formato** | A proporção da imagem: Feed (retrato), Quadrado ou Stories (vertical cheio). |
| **Estilo visual** | COMO o carrossel se parece: Estático (o padrão, fotos/texto), Tweet (card estilo publicação de rede social) ou Gráfico (infográfico de barras). Independente do Tipo. |
| **Layout** | O "molde" de um slide específico (foto de capa, texto grande, lista numerada, etc.). Cada Tipo usa uma sequência própria de layouts. |
| **Variante** | Composições visuais alternativas dentro do MESMO layout (hoje até 4 por layout), sorteadas automaticamente a cada geração, pra o mesmo tipo de post não sair sempre com a cara idêntica. |
| **Galeria** | Banco de imagens próprio de cada Perfil, organizado em pastas livres. Sempre a primeira fonte de foto. |
| **Método de conversão** | O que o último slide do post pede pra quem vê fazer: comentar, chamar no WhatsApp, acessar um link ou ir no link da bio. |
| **Contexto de marca** | O documento vivo (gerado por conversa) que descreve a marca pro Perfil. |

---

## 3. Formato do post

| Formato | Dimensão | Uso |
|---|---|---|
| **Feed** | 1080×1350 (retrato, padrão de carrossel) | O padrão pra praticamente tudo |
| **Quadrado** | 1080×1080 | Alternativa mais compacta |
| **Stories** | 1080×1920 (vertical cheio) | Formato de story, com área de segurança maior no topo/rodapé (a UI do Instagram cobre essas áreas) |

O Formato é independente do Tipo e do Estilo: qualquer combinação é permitida.

---

## 4. Estilo visual: as 3 formas de montar o carrossel

### Estático (padrão)
O carrossel de sempre: cada slide segue a sequência de layouts da receita do Tipo escolhido (foto, texto grande, lista, etc.). É o único estilo que tem CTA final e pode ganhar adaptação pra LinkedIn/TikTok.

### Tweet
Um carrossel de cards no estilo "publicação de rede social": avatar do Perfil, nome, selo de verificado, @ do Instagram e um texto por card, sem gráfico nem foto obrigatória (uma imagem de referência é opcional, dentro do card). A quantidade de cards é a mesma que a receita do Tipo escolhido definiria no estilo Estático, mas cada etapa da narrativa vira um card de texto em vez de foto/gráfico.

Regras importantes desse estilo:
- Precisa que o campo Instagram do Perfil esteja preenchido (o @ aparece no card).
- Cada card precisa ser um parágrafo completo e com profundidade real (o formato existe pra reter quem já segue o perfil), nunca uma palavra solta ou frase de efeito curta.
- **Exclusivo do Instagram.** Não pode ganhar LinkedIn nem TikTok.

### Gráfico
Uma peça única (não um carrossel): um infográfico com um gráfico de barras, título, subtítulo e fonte/observação. Pensado pra comparações e benchmarks (ex.: "3 posts por semana sozinho vs. 20+ com o Gridgen").

Regras importantes desse estilo:
- **Os números do gráfico nunca são gerados pela IA.** Ela escreve só o título e o subtítulo; quem usa a ferramenta digita os valores reais na tela de edição, antes de gerar a imagem. Isso é proposital: evita que a IA "invente" uma estatística e ela seja publicada como se fosse real.
- É preciso pelo menos 2 barras preenchidas (rótulo, valor numérico e texto exibido) pra poder gerar a imagem.
- **Pode ir pro LinkedIn** (a mesma peça é reaproveitada, só o título/subtítulo são reescritos pro tom da rede, os números nunca mudam). **Não pode ir pro TikTok** (infográfico estático não combina com o formato de vídeo curto).

---

## 5. Os 6 tipos de conteúdo hoje

Cada Tipo tem uma receita fixa de layouts (a sequência de slides), um tom de escrita e uma estratégia de conversão pretendida. A tabela abaixo é a estrutura real usada hoje.

### Âncora
- **Objetivo:** institucional. Diz quem a marca é e pra quem, fica fixado no início do perfil.
- **Quando usar:** uma vez, refeito só quando o posicionamento mudar.
- **Estrutura (6 slides):** logo em destaque → foto → texto de respiro → lista → frase de impacto → CTA.
- **Tom:** institucional sem ser corporativo, primeira pessoa do plural, diz o que faz (não o que é).
- **Conversão pretendida:** convite direto de contato (WhatsApp por padrão).

### Dor / Provocação
- **Objetivo:** criar identificação imediata. É o tipo que mais gera comentário e compartilhamento.
- **Quando usar:** o carro-chefe, toda semana tem uma dor do mercado pra nomear.
- **Estrutura (7 slides):** foto de capa → passo 1 da cena → passo 2 da cena → frase de impacto → foto → foto → CTA.
- **Tom:** segunda pessoa, descreve a cena que a pessoa vive sem julgar, nomeia o problema antes de vender.
- **Conversão pretendida:** comentário (pergunta aberta).
- **Observação de motor:** a narrativa numerada (split) é o motor deste tipo, cada slide é um passo concreto da cena.

### Prova / Portfólio ⚠️ em revisão
- **Objetivo real:** apresentar um produto/serviço/entrega específica do Perfil de forma bonita e estilizada. É uma vitrine, não uma jornada abstrata.
- **Quando usar:** sempre que houver um trabalho, entrega ou resultado real pra mostrar.
- **Estrutura hoje (7 slides):** foto de capa → texto sem foto → foto → passo → passo → foto → CTA.
- **Tom:** menos texto, mais imagem, deixa o trabalho falar.
- **Conversão pretendida:** WhatsApp.
- **Gap identificado (setembro/2026):** num teste real com um corretor de imóveis, o resultado saiu como uma narrativa genérica de "jornada" (reserva → acompanhamento → entrega das chaves), sem nenhuma foto real do imóvel específico nem detalhe concreto dele. Duas causas:
  1. A Galeria do Perfil estava vazia, e o motor caiu no banco de imagens genérico (Pexels) como se fosse prova, o que nunca deveria acontecer nesse Tipo especificamente (proof genuíno exige foto real, não banco de imagem).
  2. A receita atual não força nenhum detalhe concreto do item (specs, características, comparação), deixando a IA livre pra escrever algo abstrato.
  **Redesenho proposto, ainda não implementado:** capa como vitrine (foto mais forte, texto mínimo) + 2-3 fotos reais de detalhes específicos + um slide de "ficha técnica" (specs concretos, escaneável) + fechamento emocional + CTA. E o banco de imagem genérico deixa de ser usado como fallback pra este Tipo (sem foto real na Galeria, o slide fica sem foto em vez de mostrar algo genérico).

### Didático
- **Objetivo:** ensinar algo útil. É o tipo que a pessoa SALVA, e salvamento pesa no alcance do Instagram.
- **Quando usar:** explicar um conceito do nicho do Perfil.
- **Estrutura (7 slides):** capa de texto → 4 ideias numeradas → foto → CTA.
- **Tom:** professor, não guru. Uma ideia por slide, sem jargão sem explicar.
- **Conversão pretendida:** comentário (pergunta direta sobre a experiência de quem lê).
- **Observação de motor:** usa o layout "item" (número empilhado acima do texto), não "split". O empilhado lê como lista de aula.
- **Ainda não testado criticamente** nesta rodada de revisão (ver seção 8).

### Dado / Benchmark
- **Objetivo:** autoridade por número. Um dado concreto vale mais que três adjetivos.
- **Quando usar:** um dado de mercado, uma métrica, um benchmark do nicho.
- **Estrutura (5 slides, o mais curto):** foto de capa com o número → texto de respiro → passo → foto → CTA.
- **Tom:** o número primeiro, o contexto depois, sempre citando a fonte.
- **Conversão pretendida:** comentário ("Como está o seu?").
- **Validado em setembro/2026** com o estilo Gráfico (ver seção 4) usando este Tipo: funcionou bem, tanto no Instagram quanto adaptado pro LinkedIn.

### Oferta / Urgência
- **Objetivo:** converter. Chamada direta, sem rodeio.
- **Quando usar:** vaga aberta, condição por tempo limitado, lançamento.
- **Estrutura (4 slides, o mais curto de todos):** foto de capa com o convite → lista → foto → CTA.
- **Tom:** direto, diz o que é, pra quem, e o que fazer agora, sem falsa escassez.
- **Conversão pretendida:** link (site) por padrão, WhatsApp como alternativa.
- **Regra de disciplina:** post curto de propósito. Se precisar de mais slides pra explicar, o conteúdo é Didático, não Oferta.
- **Validado em setembro/2026** com destino real (link do site): funcionou bem depois de um ajuste no limite de tamanho do texto do convite (ver seção 8).

---

## 6. Sistema de variações visuais

Cada layout (foto, texto grande, lista, item numerado, etc.) tem hoje **até 4 composições visuais diferentes** já construídas no motor de render. A cada geração, o sistema sorteia uma variante por combinação de layout, então o próximo post do mesmo Tipo tende a sair com uma cara visual diferente do anterior, mesmo seguindo a mesma receita de conteúdo.

Isso é separado em dois grupos:
- **Variantes de capa** (o primeiro slide do carrossel, quando é foto de fundo inteiro): 5 composições diferentes (a original, mais 4 alternativas, incluindo uma manchete grande em caixa alta inspirada em capas de jornal esportivo).
- **Variantes de uso interno** (os slides de foto/texto no meio do carrossel): 4 composições por layout.

Quem cria o post não escolhe a variante manualmente, ela é sempre sorteada. Isso é proposital: garante variedade visual sem exigir uma decisão a mais de quem está criando.

---

## 7. Seleção automática de imagem

Quando um slide de layout "foto" (ou o gráfico de barras, em outro sentido) precisa de uma imagem, a IA sugere o que buscar, e o sistema resolve isso automaticamente, nesta ordem:

1. **Galeria do Perfil** (sempre a primeira opção): o sistema procura, por palavra-chave, algum item cujo nome ou pasta bata com a descrição sugerida.
2. **Banco de imagens genérico (Pexels)**, como reforço quando a Galeria não tem nada parecido.

**Limitação conhecida:** o casamento com a Galeria é por palavra-chave simples (não é busca visual/semântica). Funciona bem quando as imagens têm nome descritivo (ex.: uma pasta "Fachada" ou "Apartamento 302"), mas falha silenciosamente quando os itens têm nome genérico ou a Galeria está vazia, caindo pro banco de imagem genérico sem avisar que não achou nada real.

Como consequência do caso relatado na seção 5, o Tipo Prova está sendo ajustado pra **nunca** usar o banco de imagem genérico como substituto de prova real: sem uma foto real disponível na Galeria, o slide fica sem foto (mostra o gradiente de marca) em vez de mostrar uma imagem genérica que não é do cliente.

Upload manual de foto (e escolha manual pela Galeria) sempre continuam disponíveis, em qualquer slide, a qualquer momento.

---

## 8. Adaptação por rede social

O Instagram é sempre o formato principal de qualquer post (nunca precisa de adaptação, é o que já foi gerado). LinkedIn e TikTok são redes extras, opcionais, marcadas por post.

| Rede | Como se comporta |
|---|---|
| **Instagram** | Sempre o post principal. Não é uma "rede extra". |
| **LinkedIn** | A legenda vira longa e consultiva, várias frases curtas, termina com uma reflexão (nunca um gancho de venda). A imagem vira uma peça única (não o carrossel inteiro): no estilo Estático, é a capa do Tipo reescrita como gancho; no estilo Gráfico, é o próprio gráfico reaproveitado com o mesmo dado real. |
| **TikTok** | Reaproveita a mesma estrutura de slides do Instagram, só a legenda muda de tom (curta e direta, como o Instagram). |

Regras de hashtag por rede (quantidade que converte melhor, não é regra rígida do produto, é o que o time validou até aqui): Instagram 4 a 5, LinkedIn 3 a 5, TikTok 3 a 5.

O texto de cada rede extra é gerado sob demanda (manual, com o botão "Adaptar conteúdo") ou automaticamente já na criação do post, se a rede for marcada ali. A **imagem** de cada rede extra é sempre um passo manual (escolher/gerar), nunca automática, pra manter controle sobre a foto usada.

---

## 9. Métodos de conversão (o CTA final)

Todo Tipo (exceto Tweet e Gráfico) termina num slide de convite direto ("CTA"). O destino desse convite é escolhido na criação do post, com um padrão sugerido por Tipo (ver tabela abaixo), sempre trocável:

| Método | O que aparece no slide | De onde vem o dado |
|---|---|---|
| **Comentário** | Só o texto do convite, sem link nenhum | Nada, é só uma pergunta |
| **WhatsApp** | O telefone do Perfil, já formatado | Campo de telefone de contato do Perfil |
| **Link (LP/site)** | A URL real do site do Perfil | Campo de site do Perfil |
| **Link na bio** | O texto fixo "Link na bio" | Não depende de nenhum campo, é sempre o mesmo texto |

Se o Perfil não tiver o dado necessário (telefone ou site vazio), o slide sai só com o texto do convite, sem destino, sem travar a geração.

**Importante: o destino nunca é inventado pela IA.** Ela escreve só o texto do convite; o destino (telefone, link) é sempre preenchido pelo sistema, a partir de dado real cadastrado no Perfil.

Padrão de conversão sugerido por Tipo hoje: Âncora e Prova usam WhatsApp, Dor/Didático/Dado usam Comentário, Oferta usa Link.

---

## 10. Reels (expectativa futura, não implementado)

O motor de Reels está planejado, mas **nenhuma linha de código foi escrita ainda**. O desenho até aqui:

Dois eixos independentes, que se cruzam:

- **Tipo de conteúdo do Reel:** Apresentação, Detalhes ou Curiosidades (uma taxonomia própria, diferente dos 6 tipos de carrossel).
- **Formato de criação:**
  - **A, só vídeo:** a IA anima fotos reais do Perfil (ex.: da pasta "Produtos" da Galeria) usando um serviço externo de imagem-pra-vídeo. Sai mudo, sem texto na tela.
  - **B, vídeo com texto na tela:** a mesma animação, mais um texto curto sobreposto por cima, escrito pela IA.
  - **C, vídeo próprio:** a pessoa sobe um vídeo já filmado, e a ferramenta só adiciona o texto na tela (sem geração de IA nenhuma no vídeo em si).

Decisões já tomadas: foco Instagram e TikTok, sem áudio (nem música nem narração, só o vídeo), geração de imagem-pra-vídeo (não texto-pra-vídeo, pra garantir que o produto real do cliente apareça, não algo genérico inventado). Diferente de texto e imagem (praticamente de graça), gerar vídeo tem custo real por geração, então a etapa de vídeo nunca vai ser automática, sempre vai exigir um clique consciente depois de revisar o roteiro.

---

## 11. Gaps conhecidos e próximos passos

Isso é uma lista viva. Atualizar conforme cada Tipo for revisado.

- **Prova**: em revisão (ver seção 5). Redesenho de receita + bloqueio do banco de imagem genérico como fallback, ainda não implementado.
- **Âncora e Didático**: ainda não passaram por um teste crítico de conteúdo real nesta rodada de revisão. Próximos da fila.
- **Tipos que podem estar faltando**, levantados como candidatos (nenhum implementado ainda):
  - **Depoimento**: a fala do cliente como protagonista do post (hoje isso não tem um lugar próprio, o Tipo Prova é sobre o item, não sobre quem fala).
  - **Bastidores**: humaniza a marca, mostra o processo/rotina por trás da entrega (diferente de Dor, que é sobre a dor do público, não da marca).
  - **Comparação**: antes e depois, ou opção A vs. opção B, como estrutura própria (hoje não existe layout pensado especificamente pra isso).
  - **Convite/Evento**: data específica, urgência de presença (diferente de Oferta, que é venda direta de um produto/serviço).
- **Variante 3 do layout "split"** (usada em Dor e Prova, entre outros): considerada "sem sal" numa avaliação visual, redesenho ainda não definido.

---

## 12. Como contribuir com este documento

Cada Tipo de conteúdo tem 3 partes que podem ser revisadas independentemente:
1. **A receita** (a sequência de layouts/slides).
2. **A direção de conteúdo** (o que a IA é instruída a escrever em cada campo).
3. **O método de conversão padrão** (o que o CTA final faz).

Ao propor uma melhoria, é mais útil trazer um exemplo real (gerado na ferramenta) do que não funcionou, e explicar especificamente qual das 3 partes acima precisa mudar, e por quê, do ponto de vista de quem consome o conteúdo, não só do ponto de vista técnico.
