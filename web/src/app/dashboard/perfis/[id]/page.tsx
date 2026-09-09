import { ExternalLink, ImageIcon, Instagram, Linkedin, Mail, Music2, Phone } from 'lucide-react'
import Link from 'next/link'
import { maskDocumento } from '@/lib/mascaras'
import { serverFetch } from '@/lib/session'
import type { GaleriaItem, Perfil } from '@/lib/types'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TEMA_LABEL: Record<Perfil['temaPadrao'], string> = {
  ink: 'Escuro (ink)',
  brand: 'Marca (gradiente)',
  light: 'Claro',
  paper: 'Papel',
}

// Rótulo CPF/CNPJ segue a quantidade de dígitos guardados, não o tipo do
// Perfil — uma empresa pode ter só o CPF do dono cadastrado ainda.
function formatarDocumento(documento: string | null): { label: 'CPF' | 'CNPJ'; valor: string } | null {
  if (!documento) return null
  return { label: documento.length === 11 ? 'CPF' : 'CNPJ', valor: maskDocumento(documento) }
}

function linkRedeSocial(rede: 'instagram' | 'tiktok' | 'linkedin', valor: string): string {
  if (valor.startsWith('http')) return valor
  const handle = valor.replace(/^@/, '')
  if (rede === 'instagram') return `https://instagram.com/${handle}`
  if (rede === 'tiktok') return `https://tiktok.com/@${handle}`
  return valor
}

const CORES = (perfil: Perfil) =>
  [
    ['Primária', perfil.corPrimaria],
    ['Secundária', perfil.corSecundaria],
    ['Fundo', perfil.corFundo],
    ['Texto', perfil.corTexto],
  ] as const

export default async function VisaoGeralPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [perfil, galeria] = await Promise.all([
    serverFetch<Perfil>(`/perfis/${id}`),
    serverFetch<GaleriaItem[]>(`/perfis/${id}/galeria`),
  ])

  const documentoFormatado = formatarDocumento(perfil.documento)
  const temContato = Boolean(perfil.telefoneContato || perfil.emailContato || documentoFormatado)
  const temRedes = Boolean(perfil.instagramUrl || perfil.linkedinUrl || perfil.tiktokUrl)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">BrandKit</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex gap-4">
            {CORES(perfil).map(([label, cor]) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className="size-9 rounded-full ring-1 ring-border" style={{ background: cor }} />
                <span className="font-mono text-[10px] text-muted-foreground">{cor}</span>
              </div>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Tema padrão</dt>
              <dd>{TEMA_LABEL[perfil.temaPadrao]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tagline</dt>
              <dd>{perfil.lockupTag || <span className="text-muted-foreground">—</span>}</dd>
            </div>
            {perfil.url && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">URL</dt>
                <dd>
                  <a
                    href={perfil.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {perfil.url}
                    <ExternalLink className="size-3" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato</CardTitle>
        </CardHeader>
        <CardContent>
          {temContato ? (
            <div className="flex flex-col gap-3 text-sm">
              {perfil.telefoneContato && (
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  {perfil.telefoneContato}
                </div>
              )}
              {perfil.emailContato && (
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  {perfil.emailContato}
                </div>
              )}
              {documentoFormatado && (
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {documentoFormatado.label}
                  </span>
                  {documentoFormatado.valor}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma informação de contato cadastrada.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Redes sociais</CardTitle>
        </CardHeader>
        <CardContent>
          {temRedes ? (
            <div className="flex flex-col gap-3 text-sm">
              {perfil.instagramUrl && (
                <a
                  href={linkRedeSocial('instagram', perfil.instagramUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <Instagram className="size-4 text-muted-foreground" />
                  {perfil.instagramUrl}
                </a>
              )}
              {perfil.linkedinUrl && (
                <a
                  href={linkRedeSocial('linkedin', perfil.linkedinUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <Linkedin className="size-4 text-muted-foreground" />
                  {perfil.linkedinUrl}
                </a>
              )}
              {perfil.tiktokUrl && (
                <a
                  href={linkRedeSocial('tiktok', perfil.tiktokUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <Music2 className="size-4 text-muted-foreground" />
                  {perfil.tiktokUrl}
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma rede social cadastrada.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Galeria</CardTitle>
          <Link href={`/dashboard/perfis/${id}/galeria`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Ver tudo
          </Link>
        </CardHeader>
        <CardContent>
          {galeria.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {galeria.slice(0, 4).map((item) => (
                <div key={item.id} className="flex size-16 items-center justify-center overflow-hidden rounded-md border bg-muted p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.nome ?? item.pasta} className="size-full object-contain" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <ImageIcon className="size-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma imagem ainda. Organize por pastas na Galeria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
