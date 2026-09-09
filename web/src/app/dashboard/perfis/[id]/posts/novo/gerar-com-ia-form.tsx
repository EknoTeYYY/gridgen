'use client'

import { useState } from 'react'
import { Instagram, Loader2, Sparkles } from 'lucide-react'
import { TIPOS, type Formato, type TipoConteudo } from '@studio/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { REDE_ICON, REDE_LABEL, type RedeSocial } from '@/components/redes-sociais-icons'
import { cn } from '@/lib/utils'
import { gerarPostComIA } from '../actions'

const TIPO_KEYS = Object.keys(TIPOS) as TipoConteudo[]
const REDES_EXTRA: RedeSocial[] = ['linkedin', 'tiktok']

export function GerarComIaForm({ perfilId }: { perfilId: string }) {
  const [tipo, setTipo] = useState<TipoConteudo>('dor')
  const [formato, setFormato] = useState<Formato>('feed')
  const [estilo, setEstilo] = useState<'padrao' | 'tweet'>('padrao')
  const [fundoClaro, setFundoClaro] = useState(true)
  const [nome, setNome] = useState('')
  const [briefing, setBriefing] = useState('')
  const [redes, setRedes] = useState<RedeSocial[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function alternarRede(rede: RedeSocial) {
    setRedes((atual) => (atual.includes(rede) ? atual.filter((r) => r !== rede) : [...atual, rede]))
  }

  // Tweet é um card só pro Instagram (não existe em outra rede social) — ao
  // trocar pra esse estilo, limpa qualquer rede extra já marcada, em vez de
  // deixar uma combinação que nunca deveria existir.
  function mudarEstilo(v: 'padrao' | 'tweet') {
    setEstilo(v)
    if (v === 'tweet') setRedes([])
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      const resultado = await gerarPostComIA(perfilId, {
        tipo,
        formato,
        nome: nome || undefined,
        briefing: briefing || undefined,
        redes: redes as ('linkedin' | 'tiktok')[],
        estilo,
        fundoClaro,
      })
      if (resultado?.erro) setErro(resultado.erro)
    } finally {
      setEnviando(false)
    }
  }

  const receita = TIPOS[tipo]

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Nome do post (opcional)</Label>
        <Input
          placeholder="ex.: Vaga backend sênior — deixe em branco pra IA sugerir um nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={60}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Tipo de conteúdo</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as TipoConteudo)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPO_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {TIPOS[k].nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{receita.objetivo}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Formato</Label>
          <Select value={formato} onValueChange={(v) => setFormato(v as Formato)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feed">Feed / Carrossel</SelectItem>
              <SelectItem value="square">Quadrado</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Estilo do post</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={estilo} onValueChange={(v) => mudarEstilo(v as 'padrao' | 'tweet')}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="padrao">Estático</SelectItem>
              <SelectItem value="tweet">Tweet</SelectItem>
            </SelectContent>
          </Select>
          {estilo === 'tweet' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFundoClaro(true)}
                className={cn(
                  'rounded-md border px-2.5 py-1.5 text-sm transition-colors',
                  fundoClaro ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Fundo claro
              </button>
              <button
                type="button"
                onClick={() => setFundoClaro(false)}
                className={cn(
                  'rounded-md border px-2.5 py-1.5 text-sm transition-colors',
                  !fundoClaro ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Fundo escuro
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Pedido específico (opcional)</Label>
        <Textarea
          placeholder="ex.: fale sobre o lançamento X, foco em quem procura investimento"
          className="min-h-24"
          value={briefing}
          onChange={(e) => setBriefing(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Também publicar em</Label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5 text-sm text-muted-foreground">
              <Instagram className="size-3.5" />
              Instagram
            </span>
            {/* Tweet é um card exclusivo do Instagram — não existe em outra rede,
                então trocar pra esse estilo desabilita as redes extras (o estado
                já é limpo em `mudarEstilo`, isso só impede marcar de novo). */}
            {REDES_EXTRA.map((rede) => {
              const Icon = REDE_ICON[rede]
              const selecionada = redes.includes(rede)
              const desabilitada = estilo === 'tweet'
              return (
                <button
                  key={rede}
                  type="button"
                  disabled={desabilitada}
                  title={desabilitada ? 'Tweet é um formato exclusivo do Instagram' : undefined}
                  onClick={() => alternarRede(rede)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    selecionada ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
                  {REDE_LABEL[rede]}
                </button>
              )
            })}
          </div>
          <Button type="submit" disabled={enviando}>
            {enviando ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {enviando ? 'Gerando…' : 'Gerar com IA'}
          </Button>
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
      </div>
    </form>
  )
}
