'use client'

import { useMemo, useState } from 'react'
import { Check, Circle, Copy, FileText, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SECOES_CONTEXTO, secoesPendentes } from '@gridgen/shared'
import type { ContextoPerfil, MensagemContexto } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { InfoTooltip } from '@/components/form/info-tooltip'
import { Textarea } from '@/components/ui/textarea'

const LIMITE_MENSAGEM = 1000

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success('Copiado.')
  } catch {
    toast.error('não foi possível copiar')
  }
}

// Mensagem de abertura só de exibição (nunca enviada nem salva) — antes a
// tela ficava com um placeholder genérico ("comece contando sobre a marca")
// e as pessoas travavam na primeira vez, sem saber por onde começar. Agora a
// própria IA já entra fazendo a primeira pergunta focada, explicando o
// porquê — o mesmo padrão que o resto da entrevista (`contexto.service.ts`,
// api) segue a partir da segunda mensagem em diante.
function mensagemDeAbertura(perfilNome: string): string {
  const primeira = SECOES_CONTEXTO[0]
  return `Oi! Pra montar um contexto de marca que realmente ajude a IA a escrever com personalidade, vou te fazer algumas perguntas focadas, uma de cada vez — sempre explicando por que tô perguntando aquilo. Pra começar, o mais concreto: o que a ${perfilNome} vende ou oferece, e pra quem? (${primeira.porque})`
}

// Item minimalista do progresso — mesmo espírito das pílulas de "Novo post"
// (ícone fixo, sem caixa/borda de fundo, só o check muda de cor).
function ItemProgresso({ feito, titulo, porque }: { feito: boolean; titulo: string; porque: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium">
      {feito ? <Check className="size-3.5 shrink-0 text-primary" /> : <Circle className="size-3.5 shrink-0 text-muted-foreground" />}
      <span className={feito ? 'text-foreground' : 'text-muted-foreground'}>{titulo}</span>
      <InfoTooltip texto={porque} />
    </span>
  )
}

export function ContextoChat({
  perfilId,
  perfilNome,
  contextoInicial,
  canalConfirmadoInicial,
}: {
  perfilId: string
  perfilNome: string
  contextoInicial: ContextoPerfil
  canalConfirmadoInicial: boolean
}) {
  const [mensagens, setMensagens] = useState<MensagemContexto[]>(contextoInicial.mensagens)
  const [markdown, setMarkdown] = useState(contextoInicial.conteudoMarkdown)
  const [canalConfirmado, setCanalConfirmado] = useState(canalConfirmadoInicial)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [markdownAberto, setMarkdownAberto] = useState(false)

  const pendentes = useMemo(() => new Set(secoesPendentes(markdown)), [markdown])

  const mensagensExibidas: MensagemContexto[] =
    mensagens.length === 0
      ? [{ id: 'abertura', role: 'assistant', conteudo: mensagemDeAbertura(perfilNome), createdAt: '' }]
      : mensagens

  async function enviar() {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    setErro(null)
    setEnviando(true)
    setTexto('')
    setMensagens((atual) => [
      ...atual,
      { id: `local-${Date.now()}`, role: 'user', conteudo, createdAt: new Date().toISOString() },
    ])

    try {
      const res = await fetch(`/api/perfis/${perfilId}/contexto/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: conteudo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro || 'falha ao conversar com a IA')
        return
      }
      setMensagens((atual) => [
        ...atual,
        { id: `local-${Date.now()}-r`, role: 'assistant', conteudo: data.resposta, createdAt: new Date().toISOString() },
      ])
      setMarkdown(data.markdown)
      if (data.canalConversaoConfirmado) setCanalConfirmado(true)
    } catch {
      setErro('falha de rede ao conversar com a IA')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex h-[34rem] flex-col gap-4 rounded-[28px] border border-border/60 bg-card p-6 shadow-lg shadow-black/5">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {mensagensExibidas.map((m) => (
            <div key={m.id} className={cn('flex gap-2', m.role === 'user' && 'flex-row-reverse')}>
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="text-xs">{m.role === 'user' ? 'V' : 'IA'}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'max-w-xl rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap',
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                )}
              >
                {m.conteudo}
              </div>
            </div>
          ))}
          {enviando && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              pensando…
            </div>
          )}
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2 rounded-3xl border border-border/60 bg-background/40 py-1.5 pr-1.5 pl-4">
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, LIMITE_MENSAGEM))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
              placeholder="Escreva sua mensagem…"
              maxLength={LIMITE_MENSAGEM}
              className="max-h-32 min-h-9 min-w-0 resize-none overflow-y-auto border-0 bg-transparent px-0 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
              disabled={enviando}
            />
            <Button size="icon" className="shrink-0 rounded-full" onClick={enviar} disabled={enviando || !texto.trim()}>
              <Send />
            </Button>
          </div>
          <span
            className={cn(
              'self-end px-3 text-xs',
              texto.length >= LIMITE_MENSAGEM ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {texto.length} / {LIMITE_MENSAGEM}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {SECOES_CONTEXTO.map((secao) => (
            <ItemProgresso key={secao.titulo} feito={!pendentes.has(secao.titulo)} titulo={secao.titulo} porque={secao.porque} />
          ))}
          {/* Canal de conversão não é uma das 5 seções de markdown (é dado
              estruturado, gravado direto no Perfil) — por isso não vem de
              `SECOES_CONTEXTO`/`pendentes`, mas mostra o mesmo tratamento
              visual pra ficar claro que faz parte da mesma entrevista. */}
          <ItemProgresso
            feito={canalConfirmado}
            titulo="Canal de conversão"
            porque="como os pedidos/contatos chegam de verdade — vira o destino real do convite em cada post gerado."
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 rounded-full text-xs"
            onClick={() => setMarkdownAberto(true)}
          >
            <FileText className="size-3.5" />
            Ver contexto da marca
          </Button>
        </div>
      </div>

      <Dialog open={markdownAberto} onOpenChange={setMarkdownAberto}>
        <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-2xl">
          <DialogTitle>Contexto de marca (markdown)</DialogTitle>
          {markdown && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-12"
              onClick={() => copiar(markdown)}
              title="Copiar"
            >
              <Copy className="size-4" />
            </Button>
          )}
          <div className="overflow-y-auto">
            {markdown ? (
              <div className="markdown-preview text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda não há contexto registrado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
