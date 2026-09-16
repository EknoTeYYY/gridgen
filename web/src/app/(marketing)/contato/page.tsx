import { Card, CardContent } from '@/components/ui/card'
import { SectionBackground } from '@/components/marketing/section-background'
import { ContatoForm } from './contato-form'

export default function ContatoPage() {
  return (
    <div className="relative overflow-hidden">
      <SectionBackground />
      <div className="relative z-10 mx-auto max-w-xl px-6 pt-24 pb-20">
        <div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-balance">Fale com a gente</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Conta um pouco sobre sua agência ou marca e como pretende usar o Gridgen. A equipe da Eknotech entra em
            contato pra colocar sua conta no ar.
          </p>
        </div>

        <Card className="mt-10">
          <CardContent>
            <ContatoForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
