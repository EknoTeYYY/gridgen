import { serverFetchRaw } from '@/lib/session'

// Mesmo motivo da rota-ponte de download do post principal: um link não
// consegue mandar Authorization nem ler o cookie httpOnly.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; canal: string }> }) {
  const { id, canal } = await params
  const res = await serverFetchRaw(`/posts/${id}/canais/${canal}/download`)

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
      ...(res.headers.get('Content-Disposition')
        ? { 'Content-Disposition': res.headers.get('Content-Disposition')! }
        : {}),
    },
  })
}
