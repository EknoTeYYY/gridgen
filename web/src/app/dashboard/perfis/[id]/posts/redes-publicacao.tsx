'use client'

import { useEffect, useState } from 'react'
import { Download, ImageIcon, Instagram, Loader2, Lock, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Post, SaidaEntrega } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  REDE_ICON,
  REDE_LABEL,
  redeAtivaResolvida,
  redesDoPost,
  redesParaAbas,
  type RedeSocial,
} from '@/components/redes-sociais-icons'
import { cn } from '@/lib/utils'
import { CarrosselImagens } from './post-pronto-detalhe'

// Instagram nunca é uma rede "extra" — é o formato principal do post (já
// vem pronto, sem precisar de "Adaptar conteúdo") e por isso nem aparece
// aqui como toggle, só como indicador fixo.
const REDES_TOGGLE: RedeSocial[] = ['linkedin', 'tiktok']

// Depois que uma rede já tem conteúdo de verdade (legenda adaptada ou
// imagem gerada), desmarcar destruiria trabalho real — trava até o usuário
// decidir de propósito (mesma regra aplicada no backend, esse é só o
// espelho pra desabilitar o botão antes mesmo da chamada de rede).
function temConteudo(saida: SaidaEntrega | undefined): boolean {
  return !!saida && (!!saida.caption || saida.imagemStatus === 'concluido')
}

// Toggle de redes + card da rede ATIVA (legenda/hashtags/imagem própria) —
// só uma por vez, com abas pra trocar, em vez de empilhar todos os cards
// marcados na mesma tela (achado real do usuário: com 2+ redes marcadas, a
// tela virava um scroll enorme misturando tudo). Compartilhado entre a
// página cheia de edição (`post-status.tsx`, rascunho ainda não renderizado)
// e a visão de post pronto (`post-pronto-detalhe.tsx`).
//
// `redeAtiva`/`onRedeAtivaChange` são controlados de fora: a tela que
// envolve esse componente também precisa saber qual aba está ativa, pra
// decidir o que mostrar ao lado — o formulário de edição do Instagram
// (legenda + slides) só faz sentido quando a aba Instagram é a ativa, senão
// duplicava o mesmo conteúdo em dois lugares na tela (achado real do
// usuário: "os cards estão duplicados").
export function RedesPublicacao({
  post,
  onPostChange,
  redeAtiva,
  onRedeAtivaChange,
}: {
  post: Post
  onPostChange: (post: Post) => void
  redeAtiva: RedeSocial | null
  onRedeAtivaChange: (rede: RedeSocial | null) => void
}) {
  const [alternandoRede, setAlternandoRede] = useState<RedeSocial | null>(null)
  const [adaptando, setAdaptando] = useState<RedeSocial | null>(null)
  const [gerandoImagem, setGerandoImagem] = useState<RedeSocial | null>(null)

  const abas = redesParaAbas(post.saidas)
  const redeExibida = redeAtivaResolvida(post.saidas, redeAtiva)
  const ehInstagram = redeExibida === 'instagram'
  const saida = !ehInstagram ? post.saidas?.find((s) => s.canal === redeExibida) : undefined
  const IconAtiva = REDE_ICON[redeExibida]

  // Enquanto alguma rede está processando (texto sendo adaptado ou imagem
  // sendo renderizada), reconsulta o post a cada 2s — mesmo padrão de
  // polling já usado pelo post principal em `post-status.tsx`.
  useEffect(() => {
    const emProcesso = post.saidas?.some((s) => s.imagemStatus === 'processando')
    if (!emProcesso) return
    const intervalo = setInterval(async () => {
      const res = await fetch(`/api/posts/${post.id}`, { cache: 'no-store' })
      if (res.ok) onPostChange(await res.json())
    }, 2000)
    return () => clearInterval(intervalo)
  }, [post.saidas, post.id, onPostChange])

  async function alternarRede(rede: RedeSocial) {
    if (post.estiloVisual === 'tweet') {
      toast.error('O estilo Tweet é exclusivo do Instagram — não dá pra marcar redes extras.')
      return
    }
    const saidaAtual = post.saidas?.find((s) => s.canal === rede)
    const selecionada = redesDoPost(post.saidas).includes(rede)
    if (selecionada && temConteudo(saidaAtual)) {
      toast.error(`${REDE_LABEL[rede]} já tem conteúdo gerado, não dá pra desmarcar.`)
      return
    }
    setAlternandoRede(rede)
    try {
      const res = await fetch(`/api/posts/${post.id}/canais/${rede}`, { method: selecionada ? 'DELETE' : 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.erro || 'falha ao atualizar a rede')
        return
      }
      // Marcar/desmarcar no toggle não deve trocar qual aba está ativa —
      // são duas ações independentes. E desmarcar limpa a "lembrança" de
      // aba ativa pra essa rede: sem isso, `redeAtiva` continuava apontando
      // pra ela em memória, e remarcar mais tarde ressuscitava a seleção
      // sozinho (achado real do usuário: desmarcar LinkedIn, marcar de
      // novo, "já vem selecionado").
      if (selecionada && redeAtiva === rede) onRedeAtivaChange(null)
      // Sem router.refresh() aqui de propósito: marcar/desmarcar rede não
      // muda nada que dependa de refetch do servidor nesta tela (status do
      // post e contador de Aprovações não dependem de `saidas`) — e chamar
      // isso tinha uma causa raiz real: o refresh assíncrono podia terminar
      // bem depois do clique, resetando estado local (`redeAtiva`) no meio
      // de outra interação (achado real do usuário: trocar de rede logo
      // depois de marcar/desmarcar "esquecia" a aba escolhida).
      const atualizado = await fetch(`/api/posts/${post.id}`, { cache: 'no-store' })
      if (atualizado.ok) onPostChange(await atualizado.json())
    } finally {
      setAlternandoRede(null)
    }
  }

  async function adaptarPara(rede: RedeSocial) {
    setAdaptando(rede)
    try {
      const res = await fetch(`/api/posts/${post.id}/canais/${rede}/adaptar`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.erro || 'falha ao adaptar o conteúdo')
        return
      }
      const atualizado = await fetch(`/api/posts/${post.id}`, { cache: 'no-store' })
      if (atualizado.ok) onPostChange(await atualizado.json())
      toast.success(`Conteúdo adaptado pro ${REDE_LABEL[rede]}.`)
    } finally {
      setAdaptando(null)
    }
  }

  async function gerarImagemPara(rede: RedeSocial) {
    setGerandoImagem(rede)
    try {
      const res = await fetch(`/api/posts/${post.id}/canais/${rede}/gerar`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.erro || 'falha ao gerar a imagem')
        return
      }
      const atualizado = await fetch(`/api/posts/${post.id}`, { cache: 'no-store' })
      if (atualizado.ok) onPostChange(await atualizado.json())
    } finally {
      setGerandoImagem(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Publicar em:</span>
        <span
          title="Instagram é sempre o formato principal do post"
          className="flex size-7 items-center justify-center rounded-md border border-primary bg-primary/10 text-primary"
        >
          <Instagram className="size-3.5" />
        </span>
        {REDES_TOGGLE.map((rede) => {
          const Icon = REDE_ICON[rede]
          const saidaRede = post.saidas?.find((s) => s.canal === rede)
          const selecionada = redesDoPost(post.saidas).includes(rede)
          const ehTweet = post.estiloVisual === 'tweet'
          const travada = (selecionada && temConteudo(saidaRede)) || ehTweet
          return (
            <button
              key={rede}
              type="button"
              title={
                ehTweet
                  ? 'O estilo Tweet é exclusivo do Instagram — não dá pra marcar redes extras'
                  : selecionada && temConteudo(saidaRede)
                    ? `${REDE_LABEL[rede]} já tem conteúdo gerado — não dá pra desmarcar`
                    : selecionada
                      ? `Remover de ${REDE_LABEL[rede]}`
                      : `Marcar pra ${REDE_LABEL[rede]}`
              }
              disabled={alternandoRede === rede || travada}
              onClick={() => alternarRede(rede)}
              className={cn(
                'flex size-7 items-center justify-center rounded-md border transition-colors',
                selecionada ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                travada && 'cursor-not-allowed disabled:opacity-40',
              )}
            >
              {alternandoRede === rede ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : ehTweet ? (
                <Lock className="size-3" />
              ) : selecionada && temConteudo(saidaRede) ? (
                <Lock className="size-3" />
              ) : (
                <Icon className="size-3.5" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        {/* Sempre pelo menos 1 aba (Instagram) — moldura de aba consistente
            mesmo sem nenhuma rede extra marcada. Sem ícone de cadeado aqui
            de propósito: a trava só aparece em "Publicar em:". */}
        <div className="-mb-1 flex items-center gap-1 border-b">
          {abas.map((rede) => {
            const Icon = REDE_ICON[rede]
            return (
              <button
                key={rede}
                type="button"
                onClick={() => onRedeAtivaChange(rede)}
                className={cn(
                  '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  rede === redeExibida
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {REDE_LABEL[rede]}
              </button>
            )
          })}
        </div>

        {/* Instagram não tem card aqui — o conteúdo dele (legenda/slides,
            editável ou já pronto) já aparece na própria tela, fora deste
            componente. Duplicar seria mostrar a mesma coisa duas vezes
            (achado real do usuário). */}
        {!ehInstagram && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <IconAtiva className="size-4" />
                {REDE_LABEL[redeExibida]}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => adaptarPara(redeExibida)}
                disabled={adaptando === redeExibida || saida?.imagemStatus === 'processando'}
              >
                {adaptando === redeExibida ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {adaptando === redeExibida ? 'Adaptando…' : saida?.caption ? 'Readaptar' : 'Adaptar conteúdo'}
              </Button>
            </CardHeader>
            {!saida?.caption && saida?.imagemStatus === 'processando' ? (
              <CardContent>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Preparando o texto pro {REDE_LABEL[redeExibida]} automaticamente…
                </p>
              </CardContent>
            ) : !saida?.caption && saida?.imagemStatus === 'erro' ? (
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-destructive">Falha ao preparar o conteúdo pro {REDE_LABEL[redeExibida]} automaticamente.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adaptarPara(redeExibida)}
                  disabled={adaptando === redeExibida}
                  className="self-start"
                >
                  {adaptando === redeExibida ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  Tentar de novo
                </Button>
              </CardContent>
            ) : saida?.caption ? (
              <CardContent className="flex flex-col gap-3">
                <div>
                  <p className="text-sm whitespace-pre-wrap">{saida.caption}</p>
                  {saida.hashtags && <p className="text-sm text-primary">{saida.hashtags}</p>}
                </div>
                <div className="flex flex-col gap-2 border-t pt-3">
                  {saida.imagemStatus === 'concluido' && saida.arquivos.length > 0 ? (
                    <>
                      <CarrosselImagens
                        postId={post.id}
                        canal={redeExibida}
                        imagens={saida.arquivos.filter((nome) => nome.endsWith('.png'))}
                      />
                      <Button size="sm" variant="outline" asChild className="self-start">
                        <a href={`/api/posts/${post.id}/canais/${redeExibida}/download`} download>
                          <Download />
                          Baixar imagem do {REDE_LABEL[redeExibida]}
                        </a>
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={gerandoImagem === redeExibida || saida.imagemStatus === 'processando'}
                        onClick={() => gerarImagemPara(redeExibida)}
                      >
                        {gerandoImagem === redeExibida || saida.imagemStatus === 'processando' ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <ImageIcon />
                        )}
                        {saida.imagemStatus === 'processando'
                          ? 'Gerando imagem…'
                          : saida.imagemStatus === 'erro'
                            ? 'Tentar gerar de novo'
                            : 'Gerar imagem'}
                      </Button>
                      {saida.imagemStatus === 'erro' && <p className="text-xs text-destructive">Falha ao gerar a imagem.</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ainda não adaptado — hoje usa a legenda e hashtags gerais do post. O {REDE_LABEL[redeExibida]}{' '}
                  converte diferente, então vale gerar uma versão própria pra ele.
                </p>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
