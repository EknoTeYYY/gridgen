# Plano de melhorias de Design/UX — Gridgen

> Resultado de uma revisão de design/UX focada em cores e ergonomia do app logado (não a marketing). **Conclusão geral: a paleta atual (violet como acento de marca) está correta e não precisa de alteração drástica.** Os itens abaixo são refinamentos pontuais, documentados para execução direta — não é necessário reabrir a investigação, só aplicar.

## Contexto do diagnóstico

O app logado (`web/src/app/dashboard/**`) compartilha o `globals.css` com a marketing (`--primary`/`--ring` em `violet-600`/`500`/`400`) e herda o mesmo `ThemeProvider` com `defaultTheme="dark"` definido no `RootLayout` (`web/src/app/layout.tsx`). Ou seja, hoje **o produto inteiro abre em modo escuro por padrão**, não só a landing.

Dentro do dashboard, o violet é usado de forma saudável — sempre como acento (botão primário, anel de foco, chip de evento sazonal, dot de "hoje"), nunca como cor de fundo dominante. O problema não é a cor, é o tema padrão + duplicação de valores de cor fora do sistema de tokens.

## Melhoria 1 — Trocar o tema padrão do dashboard para claro

**Por quê:** Gridgen é uma ferramenta de revisão visual (o usuário compara cor/contraste de posts/artes geradas pela IA, várias vezes ao dia). Fundo escuro por padrão distorce a percepção de cor da arte sendo avaliada e cansa mais em sessões longas — é um problema conhecido em ferramentas de edição/revisão visual. Isso não é verdade para a landing de marketing, onde dark+violet é a escolha certa (conversão, impacto visual em poucos segundos).

**O que fazer:**
1. Em `web/src/components/theme-provider.tsx` / onde o `ThemeProvider` (next-themes) é configurado no `web/src/app/layout.tsx`, mudar `defaultTheme="dark"` para `defaultTheme="light"` (ou `"system"`, se preferirem respeitar o SO do usuário).
2. A landing de marketing (`web/src/app/(marketing)/**`) deve **continuar sempre escura**, independente da preferência de tema do usuário logado. Como o Tailwind v4 usa variante `dark` baseada em classe (`.dark`, escopável em qualquer ancestral, não só `<html>`), a forma mais limpa é envolver o layout do grupo `(marketing)` com uma div/classe `dark` fixa (ex: `<div className="dark">{children}</div>` em `web/src/app/(marketing)/layout.tsx`), forçando essas rotas a renderizar em dark mode mesmo com o tema global do app em `light`.
3. Manter o dark mode disponível como opção para quem usa o dashboard (toggle de tema já deve existir via next-themes) — não remover a capacidade, só trocar o padrão.
4. Testar: abrir o dashboard pela primeira vez (sem preferência salva em localStorage) e confirmar que abre claro; abrir a landing (`/`) e confirmar que continua escura independente do tema salvo.

## Melhoria 2 — Consolidar cores de status hardcoded em tokens

**Por quê:** Hoje "pronto"/sucesso usa `emerald-600`/`emerald-500` copiado diretamente (hex/classe Tailwind crua) em pelo menos 3 arquivos diferentes, e "data personalizada" no calendário usa `amber-500` também hardcoded. Isso é duplicação técnica: qualquer ajuste futuro de tom exige caçar múltiplos arquivos, e cria risco de os tons divergirem sutilmente entre telas com o tempo.

**Onde está hoje:**
- `web/src/app/dashboard/aprovacoes/page.tsx` — `emerald` hardcoded
- `web/src/app/dashboard/perfis/[id]/posts/posts-grid.tsx` — `emerald` hardcoded
- `web/src/app/dashboard/perfis/[id]/calendario/calendario-mensal.tsx` — `emerald` e `amber` hardcoded
- `web/src/app/dashboard/perfis/[id]/posts/[postId]/post-status.tsx` — status de post (conferir se usa os mesmos valores crus)

**O que fazer:**
1. Adicionar tokens semânticos no `globals.css` (ao lado de `--primary`/`--ring`): `--success` (mapear para o mesmo tom de `emerald-600`/`emerald-500` já em uso, sem mudar a cor, só nomeá-la) e `--warning` (mapear para o `amber-500` já em uso).
2. Adicionar variants correspondentes no `web/src/components/ui/badge.tsx` (ex: `variant="success"`, `variant="warning"`), já que o componente `Badge` shadcn já suporta variants — hoje o rascunho/gerando usa `variant="secondary"` sem cor própria, então o padrão de adicionar variant já existe no componente.
3. Substituir as ocorrências hardcoded nos 4 arquivos listados acima pelo novo `variant="success"` / `variant="warning"` (ou pela var CSS, se o uso não for em um `Badge`).
4. Não mexer no `--destructive` (erro) nem no cinza de `secondary` (rascunho) — já estão corretos.

**Não mexer:** o hex `#0a0a0a` no variant `cta` de `web/src/components/ui/button.tsx` é intencional (réplica do CTA da LP, exclusivo de telas de conversão de marketing) — não é bug, não precisa virar token.

## Critério de pronto

- [ ] Dashboard abre em tema claro por padrão para usuário novo (sem preferência salva)
- [ ] Landing (`(marketing)`) continua sempre em dark mode, independente do tema do app
- [ ] Toggle de dark mode ainda funciona dentro do dashboard, para quem preferir
- [ ] `emerald`/`amber` usados via token/variant nomeado nos 4 arquivos listados, sem hex/classe crua duplicada
- [ ] Nenhuma mudança na cor violet de marca (ela já está correta como está)
