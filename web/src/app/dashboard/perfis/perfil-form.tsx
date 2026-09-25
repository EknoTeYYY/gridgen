'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Instagram, Linkedin, Music2 } from 'lucide-react'
import { Controller, useForm, type Control } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { BRAND_KIT_PADRAO } from '@gridgen/shared'
import { maskDocumento, maskTelefone } from '@/lib/mascaras'
import type { Perfil, PerfilFormValues } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ColorPickerField } from '@/components/form/color-picker-field'
import { LabelComDica } from '@/components/form/info-tooltip'
import { atualizarPerfil, criarPerfil } from './actions'

const corHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'cor precisa ser hex de 6 dígitos, ex. #8b5cf6')

const schema = z.object({
  nome: z.string().min(2, 'nome muito curto'),
  tipo: z.enum(['empresa', 'pessoal']),
  corPrimaria: corHex,
  corSecundaria: corHex,
  corFundo: corHex,
  corTexto: corHex,
  temaPadrao: z.enum(['ink', 'brand', 'light', 'paper']),
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Informações básicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
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
          <CardDescription>Dados de quem esse Perfil representa — não aparece no conteúdo gerado.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
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
          <CardDescription>Cores e tema usados pelo motor de render em todo conteúdo deste perfil.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <CampoCorControlado name="corPrimaria" label="Cor primária" control={control} />
            <CampoCorControlado name="corSecundaria" label="Cor secundária" control={control} />
            <CampoCorControlado name="corFundo" label="Fundo (tema escuro)" control={control} />
            <CampoCorControlado name="corTexto" label="Texto (tema escuro)" control={control} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <LabelComDica
                htmlFor="temaPadrao"
                texto='Tema visual padrão de cada slide quando o post não especificar outro: "Escuro" usa o fundo/texto acima, "Marca" é o gradiente sólido da cor primária→secundária, "Claro"/"Papel" são fundos brancos com texto escuro.'
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="ex. https://exemplo.com.br" {...register('url')} />
          </div>
        </CardContent>
      </Card>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : perfilExistente ? 'Salvar alterações' : 'Criar perfil'}
        </Button>
      </div>
    </form>
  )
}
