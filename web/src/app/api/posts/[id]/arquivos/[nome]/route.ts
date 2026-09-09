import { serverFetchRaw } from '@/lib/session'

// O <img> do navegador não consegue mandar Authorization nem ler o cookie
// httpOnly — essa rota lê o cookie no servidor, chama a api com Bearer, e
// repassa o corpo/tipo da resposta pro navegador.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; nome: string }> }) {
  const { id, nome } = await params
  const res = await serverFetchRaw(`/posts/${id}/arquivos/${nome}`)

  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream' },
  })
}
