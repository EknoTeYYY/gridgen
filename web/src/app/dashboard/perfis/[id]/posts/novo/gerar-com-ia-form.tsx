'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Folder, Instagram, Loader2, Moon, Palette, Plus, Proportions, Sparkles, Sun, Tag, Target, X } from 'lucide-react'
import {
  METODO_CONVERSAO_NOME,
  METODO_CONVERSAO_PADRAO,
  TIPOS,
  type EstiloVisual,
  type Formato,
  type MetodoConversao,
  type TipoConteudo,
} from '@gridgen/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { REDE_ICON, REDE_LABEL, type RedeSocial } from '@/components/redes-sociais-icons'
import { cn } from '@/lib/utils'
import { gerarPostComIA } from '../actions'

const TIPO_KEYS = Object.keys(TIPOS) as TipoConteudo[]
const METODO_KEYS = Object.keys(METODO_CONVERSAO_NOME) as MetodoConversao[]
const REDES_EXTRA: RedeSocial[] = ['linkedin', 'tiktok']

// Pílula minimalista de configuração (ícone fixo, sem borda) — o ícone
// identifica O CAMPO ("isto é o tipo de conteúdo"), não o valor escolhido,
// mesmo padrão de leitura da barra inferior da ElevenLabs (ícone de filme +
// nome do modelo, ícone de proporção + "16:9", etc.).
function PillTrigger({
  icon: Icon,
  label,
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger> & { icon: React.ElementType; label: string }) {
  return (
    <SelectTrigger
      size="sm"
      title={label}
      className={cn(
        'w-auto gap-1.5 rounded-full border-none bg-transparent px-2.5 text-xs text-foreground shadow-none hover:bg-accent data-[state=open]:bg-accent dark:bg-transparent dark:hover:bg-accent dark:data-[state=open]:bg-accent',
        className,
      )}
      {...props}
    >
      <Icon className="size-3.5 text-muted-foreground" />
      <SelectValue />
    </SelectTrigger>
  )
}

export function GerarComIaForm({ perfilId, pastasGaleria = [] }: { perfilId: string; pastasGaleria?: string[] }) {
  const router = useRouter()
  const [tipo, setTipo] = useState<TipoConteudo>('conexao')
  const [formato, setFormato] = useState<Formato>('feed')
  const [estilo, setEstilo] = useState<EstiloVisual>('padrao')
  const [fundoClaro, setFundoClaro] = useState(true)
  const [metodoConversao, setMetodoConversao] = useState<MetodoConversao>(METODO_CONVERSAO_PADRAO.conexao)
  const [nome, setNome] = useState('')
  const [briefing, setBriefing] = useState('')
  const [pastaReferencia, setPastaReferencia] = useState('')
  const [pastaAberta, setPastaAberta] = useState(false)
  const [redes, setRedes] = useState<RedeSocial[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [gerandoPostId, setGerandoPostId] = useState<string | null>(null)

  // Fica na própria tela "Novo post" enquanto o render roda (sem navegar pra
  // uma página intermediária) — só sai daqui quando o post fica pronto,
  // direto pro modal, ou se der erro/ficar em rascunho (raro), pra tela de
  // edição de sempre.
  useEffect(() => {
    if (!gerandoPostId) return
    const intervalo = setInterval(async () => {
      const res = await fetch(`/api/posts/${gerandoPostId}`, { cache: 'no-store' })
      if (!res.ok) return
      const atualizado = await res.json()
      if (atualizado.status === 'pronto') {
        router.push(`/dashboard/perfis/${perfilId}/posts?post=${gerandoPostId}`)
      } else if (atualizado.status === 'erro') {
        router.push(`/dashboard/perfis/${perfilId}/posts/${gerandoPostId}`)
      }
    }, 2000)
    return () => clearInterval(intervalo)
  }, [gerandoPostId, perfilId, router])

  // Interativo é sempre Stories, e ele + Prova Social são sempre estilo
  // Estático (enquete nativa e print real não fazem sentido como tweet/
  // gráfico fabricado) — trocado automaticamente, a api também recusa a
  // combinação errada.
  function mudarTipo(v: TipoConteudo) {
    setTipo(v)
    setMetodoConversao(METODO_CONVERSAO_PADRAO[v])
    if (v === 'interativo') setFormato('story')
    if (v === 'interativo' || v === 'prova_social') setEstilo('padrao')
  }

  // Tweet não existe em outra rede social — limpa tudo. Gráfico permite só
  // LinkedIn (infográfico reaproveitado, converte bem lá).
  function mudarEstilo(v: EstiloVisual) {
    setEstilo(v)
    if (v === 'tweet') setRedes([])
    else if (v === 'grafico') setRedes((atual) => atual.filter((r) => r === 'linkedin'))
  }

  function alternarRede(rede: RedeSocial) {
    setRedes((atual) => (atual.includes(rede) ? atual.filter((r) => r !== rede) : [...atual, rede]))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    const resultado = await gerarPostComIA(perfilId, {
      tipo,
      formato,
      nome: nome || undefined,
      briefing: briefing || undefined,
      redes: redes as ('linkedin' | 'tiktok')[],
      estilo,
      fundoClaro,
      metodoConversao,
      pastaReferencia: pastaReferencia || undefined,
    })
    if (resultado.erro) {
      setErro(resultado.erro)
      setEnviando(false)
      return
    }
    if (resultado.status === 'gerando' && resultado.postId) {
      setGerandoPostId(resultado.postId)
      return
    }
    // Render não disparou (raro: camposFaltando bloqueou) — cai na tela cheia
    // de edição, mesmo fallback de sempre.
    if (resultado.postId) router.push(`/dashboard/perfis/${perfilId}/posts/${resultado.postId}`)
  }

  const receita = TIPOS[tipo]
  const temCta = receita.receita.includes('cta')

  if (gerandoPostId) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 rounded-[28px] border border-border/60 bg-card p-16 text-center shadow-lg shadow-black/5">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="font-medium">Gerando seu post…</p>
        <p className="text-sm text-muted-foreground">Isso leva só alguns segundos — você já vai cair direto no resultado.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border/60 bg-card p-6 shadow-lg shadow-black/5">
        <Input
          placeholder="Nome do post (opcional)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={60}
          className="h-7 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <Textarea
          placeholder="Descreva o post..."
          className="min-h-32 resize-none border-0 bg-transparent p-0 text-lg shadow-none focus-visible:ring-0 dark:bg-transparent md:text-lg"
          value={briefing}
          onChange={(e) => setBriefing(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-1">
          {pastaReferencia ? (
            <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pr-1.5 pl-2.5 text-xs font-medium text-primary">
              <Folder className="size-3.5" />
              {pastaReferencia}
              <button
                type="button"
                onClick={() => setPastaReferencia('')}
                className="rounded-full p-0.5 hover:bg-primary/20"
                aria-label="Remover pasta de referência"
              >
                <X className="size-3" />
              </button>
            </span>
          ) : (
            <Popover open={pastaAberta} onOpenChange={setPastaAberta}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-1 rounded-full text-xs">
                  <Plus className="size-3.5" />
                  Pasta de referência
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-2">
                {pastasGaleria.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    Nenhuma pasta na Galeria ainda — crie uma na aba Galeria do perfil.
                  </p>
                ) : (
                  <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
                    {pastasGaleria.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPastaReferencia(p)
                          setPastaAberta(false)
                        }}
                        className="rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}

          <Select value={tipo} onValueChange={(v) => mudarTipo(v as TipoConteudo)}>
            <PillTrigger icon={Tag} label="Tipo de conteúdo" />
            <SelectContent>
              {TIPO_KEYS.map((k) => (
                <SelectItem key={k} value={k}>
                  {TIPOS[k].nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={formato} onValueChange={(v) => setFormato(v as Formato)} disabled={tipo === 'interativo'}>
            <PillTrigger icon={Proportions} label="Formato" />
            <SelectContent>
              <SelectItem value="feed">Feed</SelectItem>
              <SelectItem value="square">Quadrado</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={estilo}
            onValueChange={(v) => mudarEstilo(v as EstiloVisual)}
            disabled={tipo === 'interativo' || tipo === 'prova_social'}
          >
            <PillTrigger icon={Palette} label="Estilo do post" />
            <SelectContent>
              <SelectItem value="padrao">Estático</SelectItem>
              <SelectItem value="tweet">Tweet</SelectItem>
              <SelectItem value="grafico">Gráfico</SelectItem>
            </SelectContent>
          </Select>

          {(estilo === 'tweet' || estilo === 'grafico') && (
            <div className="flex items-center overflow-hidden rounded-full">
              <button
                type="button"
                onClick={() => setFundoClaro(true)}
                title="Fundo claro"
                className={cn(
                  'flex items-center justify-center rounded-full p-1.5 transition-colors',
                  fundoClaro ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent',
                )}
              >
                <Sun className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFundoClaro(false)}
                title="Fundo escuro"
                className={cn(
                  'flex items-center justify-center rounded-full p-1.5 transition-colors',
                  !fundoClaro ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent',
                )}
              >
                <Moon className="size-3.5" />
              </button>
            </div>
          )}

          <Select
            value={metodoConversao}
            onValueChange={(v) => setMetodoConversao(v as MetodoConversao)}
            disabled={estilo === 'tweet' || estilo === 'grafico' || !temCta}
          >
            <PillTrigger
              icon={Target}
              label={!temCta ? 'Conversão — este tipo/estilo não tem slide de fechamento' : 'Conversão'}
            />
            <SelectContent>
              {METODO_KEYS.map((m) => (
                <SelectItem key={m} value={m}>
                  {METODO_CONVERSAO_NOME[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-3 pl-2">
            <div className="flex items-center gap-1">
              <span
                className="flex items-center justify-center rounded-full bg-primary/10 p-1.5 text-primary"
                title="Instagram"
              >
                <Instagram className="size-3.5" />
              </span>
              {REDES_EXTRA.map((rede) => {
                const Icon = REDE_ICON[rede]
                const selecionada = redes.includes(rede)
                const desabilitada = estilo === 'tweet' || (estilo === 'grafico' && rede === 'tiktok')
                return (
                  <button
                    key={rede}
                    type="button"
                    disabled={desabilitada}
                    title={
                      desabilitada
                        ? estilo === 'tweet'
                          ? 'Tweet é um formato exclusivo do Instagram'
                          : 'TikTok não combina com o estilo Gráfico'
                        : REDE_LABEL[rede]
                    }
                    onClick={() => alternarRede(rede)}
                    className={cn(
                      'flex items-center justify-center rounded-full p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30',
                      selecionada ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="size-3.5" />
                  </button>
                )
              })}
            </div>

            <Button type="submit" disabled={enviando} className="rounded-full">
              {enviando ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {enviando ? 'Gerando…' : 'Gerar com IA'}
            </Button>
          </div>
        </div>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </form>
  )
}
