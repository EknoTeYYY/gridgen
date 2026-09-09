'use client'

import { useMemo, useState } from 'react'
import { Check, Circle, Loader2, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SECOES_CONTEXTO, secoesPendentes } from '@gridgen/shared'
import type { ContextoPerfil, MensagemContexto } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InfoTooltip } from '@/components/form/info-tooltip'
import { Textarea } from '@/components/ui/textarea'

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

export function ContextoChat({
  perfilId,
  perfilNome,
  contextoInicial,
}: {
  perfilId: string
  perfilNome: string
  contextoInicial: ContextoPerfil
}) {
  const [mensagens, setMensagens] = useState<MensagemContexto[]>(contextoInicial.mensagens)
  const [markdown, setMarkdown] = useState(contextoInicial.conteudoMarkdown)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

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
    } catch {
      setErro('falha de rede ao conversar com a IA')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Progresso do contexto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {SECOES_CONTEXTO.map((secao) => {
            const pendente = pendentes.has(secao.titulo)
            return (
              <div
                key={secao.titulo}
                className={cn(
                  'flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs font-medium',
                  pendente ? 'text-muted-foreground' : 'border-primary/30 bg-primary/5 text-foreground',
                )}
              >
                {pendente ? (
                  <Circle className="size-3.5 shrink-0" />
                ) : (
                  <Check className="size-3.5 shrink-0 text-primary" />
                )}
                <span className="flex-1">{secao.titulo}</span>
                <InfoTooltip texto={secao.porque} />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex h-[32rem] flex-col">
          <CardHeader>
            <CardTitle className="text-sm">Conversa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {mensagensExibidas.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="text-xs">{m.role === 'user' ? 'V' : 'IA'}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
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

            <div className="flex gap-2">
              <Textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    enviar()
                  }
                }}
                placeholder="Escreva sua mensagem…"
                className="min-h-10 resize-none"
                disabled={enviando}
              />
              <Button size="icon" onClick={enviar} disabled={enviando || !texto.trim()}>
                <Send />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-[32rem] flex-col">
          <CardHeader>
            <CardTitle className="text-sm">Contexto de marca (markdown)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {markdown ? (
              <div className="markdown-preview text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda não há contexto registrado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
