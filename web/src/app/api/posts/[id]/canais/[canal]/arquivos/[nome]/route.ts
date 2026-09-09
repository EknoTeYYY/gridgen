import { serverFetchRaw } from '@/lib/session'

// Mesmo motivo da rota-ponte de arquivos do post principal: o <img> do
// navegador não consegue mandar Authorization nem ler o cookie httpOnly.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; canal: string; nome: string }> }) {
  const { id, canal, nome } = await params
  const res = await serverFetchRaw(`/posts/${id}/canais/${canal}/arquivos/${nome}`)

  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream' },
  })
}
