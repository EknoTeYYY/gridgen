'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Instagram, Linkedin, Music2, Save } from 'lucide-react'
import { Controller, useForm, type Control } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { BRAND_KIT_PADRAO, CONJUNTOS_FONTE, FONTES_CURADAS, fonteCurada, type ConjuntoFonte } from '@gridgen/shared'
import { maskDocumento, maskTelefone } from '@/lib/mascaras'
import type { Perfil, PerfilFormValues } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorPickerField } from '@/components/form/color-picker-field'
import { LabelComDica } from '@/components/form/info-tooltip'
import { atualizarPerfil, criarPerfil } from './actions'
import { ID_SLOT_SALVAR } from './[id]/perfil-header-actions'

const ID_FORM = 'perfil-form'

const corHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'cor precisa ser hex de 6 dígitos, ex. #8b5cf6')

const schema = z.object({
  nome: z.string().min(2, 'nome muito curto'),
  tipo: z.enum(['empresa', 'pessoal']),
  corPrimaria: corHex,
  corSecundaria: corHex,
  corFundo: corHex,
  corTexto: corHex,
  temaPadrao: z.enum(['ink', 'brand', 'light', 'paper']),
  fonte: z.enum(CONJUNTOS_FONTE),
  lockupTag: z.string(),
  url: z.string(),
  telefoneContato: z.string(),
  emailContato: z.string().refine((v) => v === '' || z.string().email().safeParse(v).success, 'e-mail inválido'),
  documento: z.string(),
  instagramUrl: z.string(),
  linkedinUrl: z.string(),
  tiktokUrl: z.string(),
})

function valoresPadrao(perfil?: Perfil): PerfilFormValues {
  if (!perfil) {
    return {
      nome: '',
      tipo: 'empresa',
      corPrimaria: BRAND_KIT_PADRAO.corPrimaria,
      corSecundaria: BRAND_KIT_PADRAO.corSecundaria,
      corFundo: BRAND_KIT_PADRAO.corFundo,
      corTexto: BRAND_KIT_PADRAO.corTexto,
      temaPadrao: BRAND_KIT_PADRAO.temaPadrao,
      fonte: BRAND_KIT_PADRAO.fonte,
      lockupTag: '',
      url: '',
      telefoneContato: '',
      emailContato: '',
      documento: '',
      instagramUrl: '',
      linkedinUrl: '',
      tiktokUrl: '',
    }
  }
  return {
    nome: perfil.nome,
    tipo: perfil.tipo,
    corPrimaria: perfil.corPrimaria,
    corSecundaria: perfil.corSecundaria,
    corFundo: perfil.corFundo,
    corTexto: perfil.corTexto,
    temaPadrao: perfil.temaPadrao,
    fonte: fonteCurada(perfil.fonte).id,
    lockupTag: perfil.lockupTag ?? '',
    url: perfil.url ?? '',
    telefoneContato: perfil.telefoneContato ?? '',
    emailContato: perfil.emailContato ?? '',
    documento: perfil.documento ?? '',
    instagramUrl: perfil.instagramUrl ?? '',
    linkedinUrl: perfil.linkedinUrl ?? '',
    tiktokUrl: perfil.tiktokUrl ?? '',
  }
}

function CampoCorControlado({
  name,
  label,
  control,
}: {
  name: 'corPrimaria' | 'corSecundaria' | 'corFundo' | 'corTexto'
  label: string
  control: Control<PerfilFormValues>
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <ColorPickerField id={name} label={label} value={field.value} onChange={field.onChange} />}
    />
  )
}

// Só pra prévia na tela: o render NÃO usa isto — embute os próprios arquivos
// (render/assets/fonts), então a peça não depende do Google Fonts no ar.
const FAMILIAS_PREVIA = [...new Set(FONTES_CURADAS.flatMap((f) => [f.titulo, f.texto]))]
const URL_FONTES_PREVIA = `https://fonts.googleapis.com/css2?${FAMILIAS_PREVIA.map(
  (f) => `family=${f.replace(/ /g, '+')}:wght@400;700;800`,
).join('&')}&display=swap`

const ABA_EMPILHADA = 'col-start-1 row-start-1 data-[state=inactive]:invisible'

function CampoFonte({ value, onChange }: { value: ConjuntoFonte; onChange: (v: ConjuntoFonte) => void }) {
  const atual = fonteCurada(value)
  return (
    <div className="flex flex-col gap-4">
      <link rel="stylesheet" href={URL_FONTES_PREVIA} />
      <div className="flex flex-col gap-1.5">
        <LabelComDica
          htmlFor="fonte"
          texto="Par de fontes aplicado aos textos de todos os posts deste perfil: a primeira nos títulos e manchetes, a segunda nos parágrafos e listas."
        >
          Fonte título | Fonte texto
        </LabelComDica>
        <Select value={value} onValueChange={(v) => onChange(v as ConjuntoFonte)}>
          <SelectTrigger id="fonte" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTES_CURADAS.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                <span style={{ fontFamily: `'${f.titulo}'`, fontWeight: 700 }}>{f.titulo}</span>
                <span className="text-muted-foreground">|</span>
                <span style={{ fontFamily: `'${f.texto}'` }}>{f.texto}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <p className="text-2xl leading-tight" style={{ fontFamily: `'${atual.titulo}'`, fontWeight: 800 }}>
          O mês ainda nem começou e o calendário já tá fechado.
        </p>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: `'${atual.texto}'` }}>
          Primeiro a gente vê datas, lançamentos e rotina do negócio: o que faz sentido comunicar em cada semana.
        </p>
      </div>
    </div>
  )
}

export function PerfilForm({ perfilExistente }: { perfilExistente?: Perfil }) {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresPadrao(perfilExistente),
  })

  async function onSubmit(valores: PerfilFormValues) {
    setErro(null)
    const resultado = perfilExistente
      ? await atualizarPerfil(perfilExistente.id, valores)
      : await criarPerfil(valores)
    if (resultado?.erro) {
      setErro(resultado.erro)
      toast.error(resultado.erro)
      return
    }
    if (perfilExistente) {
      toast.success('Perfil atualizado.')
      router.push(`/dashboard/perfis/${perfilExistente.id}`)
    }
    router.refresh()
  }

  const [slotSalvar, setSlotSalvar] = useState<HTMLElement | null>(null)
  useEffect(() => {
    if (perfilExistente) setSlotSalvar(document.getElementById(ID_SLOT_SALVAR))
  }, [perfilExistente])

  const botaoSalvar = (
    <Button type="submit" form={ID_FORM} size={slotSalvar ? 'sm' : 'default'} disabled={isSubmitting}>
      <Save />
      {isSubmitting ? 'Salvando…' : perfilExistente ? 'Salvar alterações' : 'Criar perfil'}
    </Button>
  )

  return (
    <form id={ID_FORM} onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Informações básicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register('nome')} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">Tipo</Label>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="tipo" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empresa">Empresa</SelectItem>
                    <SelectItem value="pessoal">Pessoal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
          <CardDescription>
            Telefone e site entram no convite final dos posts, conforme o canal de conversão do perfil. E-mail e
            CPF/CNPJ não aparecem no conteúdo gerado.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefoneContato">Telefone</Label>
            <Controller
              control={control}
              name="telefoneContato"
              render={({ field }) => (
                <Input
                  id="telefoneContato"
                  placeholder="(48) 99999-9999"
                  value={field.value}
                  onChange={(e) => field.onChange(maskTelefone(e.target.value))}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">Site</Label>
            <Input id="url" placeholder="ex. https://exemplo.com.br" {...register('url')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emailContato">E-mail</Label>
            <Input id="emailContato" type="email" {...register('emailContato')} />
            {errors.emailContato && <p className="text-xs text-destructive">{errors.emailContato.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="documento">CPF/CNPJ</Label>
            <Controller
              control={control}
              name="documento"
              render={({ field }) => (
                <Input
                  id="documento"
                  value={field.value}
                  onChange={(e) => field.onChange(maskDocumento(e.target.value))}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes sociais</CardTitle>
          <CardDescription>Pra onde este Perfil publica hoje — usado nas integrações de publicação.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instagramUrl" className="flex items-center gap-1.5">
              <Instagram className="size-3.5" /> Instagram
            </Label>
            <Input id="instagramUrl" placeholder="@perfil ou URL" {...register('instagramUrl')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkedinUrl" className="flex items-center gap-1.5">
              <Linkedin className="size-3.5" /> LinkedIn
            </Label>
            <Input id="linkedinUrl" placeholder="URL da página" {...register('linkedinUrl')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tiktokUrl" className="flex items-center gap-1.5">
              <Music2 className="size-3.5" /> TikTok
            </Label>
            <Input id="tiktokUrl" placeholder="@perfil ou URL" {...register('tiktokUrl')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>BrandKit</CardTitle>
          <CardDescription>Cores, fonte e tema usados pelo motor de render em todo conteúdo deste perfil.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs defaultValue="cores">
            <TabsList>
              <TabsTrigger value="cores">Cores</TabsTrigger>
              <TabsTrigger value="fonte">Fonte</TabsTrigger>
              <TabsTrigger value="temas">Temas</TabsTrigger>
            </TabsList>
            {/* As 3 abas ficam montadas e empilhadas na mesma célula do grid; a
                inativa só fica invisível. Assim o card tem sempre a altura da
                aba mais alta (Fonte) e o botão de salvar não pula ao trocar de
                aba — e os campos continuam registrados no formulário. */}
            <div className="grid">
              <TabsContent value="cores" forceMount className={ABA_EMPILHADA}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <CampoCorControlado name="corPrimaria" label="Cor primária" control={control} />
                  <CampoCorControlado name="corSecundaria" label="Cor secundária" control={control} />
                  <CampoCorControlado name="corFundo" label="Fundo (tema escuro)" control={control} />
                  <CampoCorControlado name="corTexto" label="Texto (tema escuro)" control={control} />
                </div>
              </TabsContent>
              <TabsContent value="fonte" forceMount className={ABA_EMPILHADA}>
                <Controller
                  control={control}
                  name="fonte"
                  render={({ field }) => <CampoFonte value={field.value} onChange={field.onChange} />}
                />
              </TabsContent>
              <TabsContent value="temas" forceMount className={ABA_EMPILHADA}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <LabelComDica
                      htmlFor="temaPadrao"
                      texto='Tema visual padrão de cada slide quando o post não especificar outro: "Escuro" usa o fundo e o texto definidos na aba Cores, "Marca" é o gradiente sólido da cor primária→secundária, "Claro"/"Papel" são fundos brancos com texto escuro.'
                    >
                      Tema padrão
                    </LabelComDica>
                    <Controller
                      control={control}
                      name="temaPadrao"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="temaPadrao" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ink">Escuro (ink)</SelectItem>
                            <SelectItem value="brand">Marca (gradiente)</SelectItem>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="paper">Papel</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <LabelComDica
                      htmlFor="lockupTag"
                      texto='Texto curto que acompanha a logo no rodapé de cada slide (o "lockup" da marca) — ex.: um segmento ou slogan curto, como "marketing imobiliário".'
                    >
                      Tagline do lockup
                    </LabelComDica>
                    <Input id="lockupTag" placeholder="ex. marketing imobiliário" {...register('lockupTag')} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {/* Na edição, o botão vai pro canto superior direito do cabeçalho do
          Perfil (fora do <form> no DOM, por isso o atributo `form`); na
          criação não existe esse cabeçalho e ele fica aqui embaixo. */}
      {slotSalvar ? (
        createPortal(botaoSalvar, slotSalvar)
      ) : (
        <div className="flex gap-3">{botaoSalvar}</div>
      )}
    </form>
  )
}
