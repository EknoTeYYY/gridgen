import { serverFetchRaw } from '@/lib/session'

// Mesmo motivo da rota-ponte de arquivos: um link de download não consegue
// mandar Authorization nem ler o cookie httpOnly — essa rota lê no servidor,
// chama a api com Bearer, e repassa o zip (corpo + headers de download) pro
// navegador.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await serverFetchRaw(`/posts/${id}/download`)

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
