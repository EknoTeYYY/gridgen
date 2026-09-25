'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Folder, ImageIcon, ImagePlus, Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import type { GaleriaItem, GaleriaPasta, Perfil } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GaleriaAssetField } from '@/components/form/galeria-asset-field'
import { InfoTooltip } from '@/components/form/info-tooltip'
import { atualizarAssetMarca, type CampoAssetMarca } from '../../actions'
import { criarItemGaleria, criarPastaGaleria, excluirItemGaleria, renomearItemGaleria } from './actions'

const PASTA_LOGO_MARCA = 'Logo'
// "Prova Social" e "Produtos" já nascem criadas de verdade (não só
// sugeridas) pra Perfil novo — ver `POST /perfis` na api. Seguem aparecendo
// aqui também, cobrindo Perfis criados antes dessa mudança.
const PASTAS_SUGERIDAS = [PASTA_LOGO_MARCA, 'Prova Social', 'Produtos', 'Referências', 'Eventos']

// Orientação do doc editorial (§11): onde colocar cada tipo de material,
// pra não exigir que o cliente organize o acervo inteiro sozinho.
const DICA_PASTA: Record<string, string> = {
  'Prova Social': 'Prints de feedback real (WhatsApp, Instagram, Google) entram aqui — é o material do tipo Prova Social.',
  Produtos: 'Fotos dos produtos/itens de verdade entram aqui — usadas nos tipos Produtos e Serviços.',
}

function converterParaDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('falha ao ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

type AssetsDeMarca = Pick<Perfil, 'logoColorUrl' | 'logoBrancoUrl' | 'iconeColorUrl' | 'iconeBrancoUrl'>

export function GaleriaClient({
  perfilId,
  itens,
  pastasCustom,
  perfil,
}: {
  perfilId: string
  itens: GaleriaItem[]
  pastasCustom: GaleriaPasta[]
  perfil: AssetsDeMarca
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [assets, setAssets] = useState<AssetsDeMarca>(perfil)

  const [pastaAberta, setPastaAberta] = useState<string | null>(null)
  const [dialogPastaAberto, setDialogPastaAberto] = useState(false)
  const [dialogImagemAberto, setDialogImagemAberto] = useState(false)
  const [nomePastaForm, setNomePastaForm] = useState('')
  const [criandoPasta, setCriandoPasta] = useState(false)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pastaSobre, setPastaSobre] = useState<string | null>(null)
  const [pastaEnviandoDrop, setPastaEnviandoDrop] = useState<string | null>(null)
  const [itemExpandido, setItemExpandido] = useState<GaleriaItem | null>(null)
  const [nomeEditando, setNomeEditando] = useState('')
  const [salvandoNome, setSalvandoNome] = useState(false)

  // Sem isso, soltar um arquivo fora de uma pasta faz o navegador tentar
  // abrir/navegar pra ele, saindo da tela sem aviso nenhum.
  useEffect(() => {
    function bloquear(e: DragEvent) {
      e.preventDefault()
    }
    window.addEventListener('dragover', bloquear)
    window.addEventListener('drop', bloquear)
    return () => {
      window.removeEventListener('dragover', bloquear)
      window.removeEventListener('drop', bloquear)
    }
  }, [])

  const pastas = useMemo(() => {
    const nomes = new Set<string>(PASTAS_SUGERIDAS)
    for (const pasta of pastasCustom) nomes.add(pasta.nome)
    for (const item of itens) nomes.add(item.pasta)
    return [...nomes].map((nome) => ({ nome, itens: itens.filter((i) => i.pasta === nome) }))
  }, [itens, pastasCustom])

  const pastaAtual = pastaAberta ? pastas.find((p) => p.nome === pastaAberta) : undefined

  function abrirDialogPasta() {
    setNomePastaForm('')
    setErro(null)
    setDialogPastaAberto(true)
  }

  function abrirDialogImagem() {
    setErro(null)
    setDialogImagemAberto(true)
  }

  // Uma pasta normalmente só existe por ter ≥1 imagem — isso registra o nome
  // (sem imagem nenhuma ainda) pra não sumir num reload, e já leva o usuário
  // pra dentro dela, pronto pra clicar "Adicionar imagem".
  async function criarPasta(e: React.FormEvent) {
    e.preventDefault()
    const nome = nomePastaForm.trim()
    if (!nome) {
      setErro('digite o nome da pasta')
      return
    }
    setErro(null)
    setCriandoPasta(true)
    const resultado = await criarPastaGaleria(perfilId, nome)
    setCriandoPasta(false)
    if (resultado?.erro) {
      setErro(resultado.erro)
      toast.error(resultado.erro)
      return
    }
    setDialogPastaAberto(false)
    setPastaAberta(nome)
    toast.success('Pasta criada.')
    router.refresh()
  }

  // Papéis técnicos usados pelo motor de render (logo/ícone, cor e branco) —
  // atribuídos a partir de itens já presentes na própria pasta "Logo", sem
  // nenhuma seção de "Assets" fora da Galeria.
  async function atualizarAsset(campo: CampoAssetMarca, url: string) {
    const anterior = assets[campo]
    setAssets((atual) => ({ ...atual, [campo]: url }))
    const resultado = await atualizarAssetMarca(perfilId, campo, url)
    if (resultado?.erro) {
      toast.error(resultado.erro)
      setAssets((atual) => ({ ...atual, [campo]: anterior }))
      return
    }
    router.refresh()
  }

  function abrirLightbox(item: GaleriaItem) {
    setItemExpandido(item)
    setNomeEditando(item.nome ?? '')
  }

  async function salvarNomeImagem() {
    if (!itemExpandido) return
    setSalvandoNome(true)
    const nome = nomeEditando.trim()
    const resultado = await renomearItemGaleria(perfilId, itemExpandido.id, nome)
    setSalvandoNome(false)
    if (resultado?.erro) {
      toast.error(resultado.erro)
      return
    }
    toast.success('Nome atualizado.')
    setItemExpandido((atual) => (atual ? { ...atual, nome: nome || null } : atual))
    router.refresh()
  }

  // Selecionar mais de um arquivo de uma vez (o dialog não pede nome — nomear
  // é feito depois, abrindo a imagem — então não faz sentido travar em "anexa
  // um, nomeia, anexa outro"). Mesmo caminho de envio do drag-and-drop. Só é
  // chamado de dentro de uma pasta já aberta.
  async function onArquivosSelecionados(files: FileList | null) {
    if (!files || files.length === 0 || !pastaAberta) return
    setDialogImagemAberto(false)
    await enviarArquivosNaPasta(pastaAberta, [...files])
    if (inputRef.current) inputRef.current.value = ''
  }

  async function excluir(id: string) {
    setExcluindoId(id)
    try {
      const resultado = await excluirItemGaleria(perfilId, id)
      if (resultado?.erro) {
        toast.error(resultado.erro)
        return
      }
      router.refresh()
    } finally {
      setExcluindoId(null)
    }
  }

  async function enviarArquivosNaPasta(pasta: string, arquivos: File[]) {
    const imagens = arquivos.filter((f) => f.type.startsWith('image/'))
    if (imagens.length === 0) {
      toast.error('Solte só arquivos de imagem.')
      return
    }
    setPastaEnviandoDrop(pasta)
    let sucesso = 0
    for (const arquivo of imagens) {
      try {
        const url = await converterParaDataUri(arquivo)
        const resultado = await criarItemGaleria(perfilId, { pasta, url })
        if (resultado?.erro) {
          toast.error(resultado.erro)
        } else {
          sucesso++
        }
      } catch {
        toast.error(`não foi possível ler "${arquivo.name}"`)
      }
    }
    setPastaEnviandoDrop(null)
    if (sucesso > 0) {
      toast.success(sucesso === 1 ? 'Imagem adicionada.' : `${sucesso} imagens adicionadas.`)
      router.refresh()
    }
  }

  function dropzoneProps(pasta: string) {
    return {
      onDragOver: (e: React.DragEvent) => {
        if (!e.dataTransfer.types.includes('Files')) return
        e.preventDefault()
        e.stopPropagation()
        setPastaSobre(pasta)
      },
      onDragLeave: (e: React.DragEvent) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        setPastaSobre((atual) => (atual === pasta ? null : atual))
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setPastaSobre(null)
        enviarArquivosNaPasta(pasta, [...e.dataTransfer.files])
      },
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {pastaAtual ? (
        <>
          <button
            type="button"
            onClick={() => setPastaAberta(null)}
            className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Galeria
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">{pastaAtual.nome}</h1>
            <Button size="sm" onClick={abrirDialogImagem}>
              <Plus />
              Adicionar imagem
            </Button>
          </div>

          {pastaAtual.nome === PASTA_LOGO_MARCA && (
            <Card>
              <CardHeader>
                <CardTitle>Papéis de marca</CardTitle>
                <CardDescription>
                  Usados pelo motor de render em todo conteúdo deste perfil — escolha entre as imagens desta pasta.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <GaleriaAssetField
                  perfilId={perfilId}
                  pasta={PASTA_LOGO_MARCA}
                  label="Logo colorida"
                  value={assets.logoColorUrl ?? ''}
                  onChange={(url) => atualizarAsset('logoColorUrl', url)}
                />
                <GaleriaAssetField
                  perfilId={perfilId}
                  pasta={PASTA_LOGO_MARCA}
                  label="Logo branca"
                  value={assets.logoBrancoUrl ?? ''}
                  onChange={(url) => atualizarAsset('logoBrancoUrl', url)}
                />
                <GaleriaAssetField
                  perfilId={perfilId}
                  pasta={PASTA_LOGO_MARCA}
                  label="Ícone colorido"
                  value={assets.iconeColorUrl ?? ''}
                  onChange={(url) => atualizarAsset('iconeColorUrl', url)}
                />
                <GaleriaAssetField
                  perfilId={perfilId}
                  pasta={PASTA_LOGO_MARCA}
                  label="Ícone branco"
                  value={assets.iconeBrancoUrl ?? ''}
                  onChange={(url) => atualizarAsset('iconeBrancoUrl', url)}
                />
              </CardContent>
            </Card>
          )}

          <div className="relative rounded-lg" {...dropzoneProps(pastaAtual.nome)}>
            {(pastaSobre === pastaAtual.nome || pastaEnviandoDrop === pastaAtual.nome) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-primary bg-background/90 backdrop-blur-sm">
                {pastaEnviandoDrop === pastaAtual.nome ? (
                  <>
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Enviando…</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-6 text-primary" />
                    <span className="text-sm font-medium">Soltar pra adicionar em "{pastaAtual.nome}"</span>
                  </>
                )}
              </div>
            )}
            {pastaAtual.itens.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <ImageIcon className="size-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Nenhuma imagem ainda nessa pasta.</p>
                  <p className="text-sm text-muted-foreground">Arraste uma imagem aqui ou use o botão acima.</p>
                  <Button size="sm" variant="outline" onClick={abrirDialogImagem}>
                    <Plus />
                    Adicionar imagem
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pastaAtual.itens.map((item) => (
                  <Card key={item.id} className="relative gap-0 overflow-hidden py-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={excluindoId === item.id}
                          className="absolute top-2 right-2 z-10 bg-background/80 text-muted-foreground backdrop-blur-sm hover:bg-background hover:text-destructive dark:hover:bg-background"
                        >
                          {excluindoId === item.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          <span className="sr-only">Excluir imagem</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
                          <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.preventDefault()
                              excluir(item.id)
                            }}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <button
                      type="button"
                      onClick={() => abrirLightbox(item)}
                      className="flex aspect-square w-full items-center justify-center bg-muted p-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.nome ?? pastaAtual.nome} className="size-full object-contain" />
                    </button>
                    {item.nome && (
                      <CardContent className="p-3">
                        <p className="truncate text-sm font-medium">{item.nome}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Galeria</h1>
              <p className="text-sm text-muted-foreground">
                Imagens de referência, organizadas em pastas. Arraste uma imagem pra dentro de uma pasta pra
                adicionar direto.
              </p>
            </div>
            <Button size="sm" onClick={abrirDialogPasta}>
              <Plus />
              Criar pasta
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pastas.map((pasta) => {
              const capa = pasta.itens[0]
              const sobre = pastaSobre === pasta.nome
              const enviandoNessaPasta = pastaEnviandoDrop === pasta.nome
              return (
                <Card
                  key={pasta.nome}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'relative cursor-pointer gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md',
                    sobre && 'ring-2 ring-primary',
                  )}
                  onClick={() => setPastaAberta(pasta.nome)}
                  onKeyDown={(e) => e.key === 'Enter' && setPastaAberta(pasta.nome)}
                  {...dropzoneProps(pasta.nome)}
                >
                  {(sobre || enviandoNessaPasta) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-background/90 backdrop-blur-sm">
                      {enviandoNessaPasta ? (
                        <>
                          <Loader2 className="size-6 animate-spin text-primary" />
                          <span className="text-xs font-medium">Enviando…</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="size-6 text-primary" />
                          <span className="text-xs font-medium">Soltar aqui</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex aspect-square items-center justify-center bg-muted p-2">
                    {capa ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={capa.url} alt={pasta.nome} className="size-full object-contain" />
                    ) : (
                      <Folder className="size-10 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </div>
                  <CardContent className="flex items-center justify-between gap-2 p-3">
                    <span className="flex min-w-0 items-center gap-1">
                      <p className="truncate font-medium">{pasta.nome}</p>
                      {DICA_PASTA[pasta.nome] && (
                        <span onClick={(e) => e.stopPropagation()}>
                          <InfoTooltip texto={DICA_PASTA[pasta.nome]} />
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{pasta.itens.length}</span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <Dialog open={dialogPastaAberto} onOpenChange={setDialogPastaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar pasta</DialogTitle>
          </DialogHeader>
          <form onSubmit={criarPasta} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nomePasta">Nome da pasta</Label>
              <Input
                id="nomePasta"
                placeholder="ex.: Referências"
                value={nomePastaForm}
                onChange={(e) => setNomePastaForm(e.target.value)}
                autoFocus
              />
            </div>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <Button type="submit" disabled={criandoPasta} className="w-fit">
              {criandoPasta && <Loader2 className="animate-spin" />}
              Criar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogImagemAberto} onOpenChange={setDialogImagemAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar imagem</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">
                Pode escolher mais de uma de uma vez. Pra nomear, abra a imagem depois de adicionada.
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onArquivosSelecionados(e.target.files)}
              />
              <Button type="button" variant="outline" className="w-fit" onClick={() => inputRef.current?.click()}>
                <Upload />
                Escolher imagens
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={itemExpandido !== null} onOpenChange={(aberto) => !aberto && setItemExpandido(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{itemExpandido?.nome || 'Imagem sem nome'}</DialogTitle>
          </DialogHeader>
          {itemExpandido && (
            <div className="flex flex-col gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={itemExpandido.url}
                alt={itemExpandido.nome ?? ''}
                className="max-h-[65vh] w-full rounded-md bg-muted object-contain"
              />
              <div className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="nomeExpandido">Nome</Label>
                  <Input
                    id="nomeExpandido"
                    placeholder="Sem nome"
                    value={nomeEditando}
                    onChange={(e) => setNomeEditando(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={salvarNomeImagem}
                  disabled={salvandoNome || nomeEditando === (itemExpandido.nome ?? '')}
                >
                  {salvandoNome && <Loader2 className="animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
