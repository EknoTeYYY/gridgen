import { Mail } from 'lucide-react'
import { serverFetch } from '@/lib/session'
import type { LeadContato } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
}

export default async function AdminLeadsPage() {
  const leads = await serverFetch<LeadContato[]>('/admin/leads')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">Quem preencheu "Fale com a gente" na LP do Gridgen.</p>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Mail className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium">Nenhum lead recebido ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-medium">{lead.nome}</p>
                  <span className="text-xs text-muted-foreground">{formatarData(lead.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <a href={`mailto:${lead.email}`} className="hover:text-foreground hover:underline">
                    {lead.email}
                  </a>
                  {lead.telefone ? ` · ${lead.telefone}` : ''}
                  {lead.empresa ? ` · ${lead.empresa}` : ''}
                </p>
                {lead.mensagem && <p className="text-sm whitespace-pre-wrap">{lead.mensagem}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
