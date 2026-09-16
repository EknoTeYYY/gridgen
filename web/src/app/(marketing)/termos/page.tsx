const ATUALIZADO_EM = '31 de agosto de 2026'

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{titulo}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-24 pb-16">
      <h1 className="text-3xl font-semibold tracking-tight">Termos de Uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: {ATUALIZADO_EM}</p>

      <p className="mt-6 rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Esta é uma minuta preparada durante o desenvolvimento do produto, ainda sujeita a revisão jurídica antes do
        lançamento público.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        <Secao titulo="1. Aceite">
          <p>
            Ao criar uma conta no Gridgen, produto operado pela eknotech, você concorda com estes Termos de Uso e com
            a nossa Política de Privacidade. Se não concordar, não utilize a plataforma.
          </p>
        </Secao>

        <Secao titulo="2. O que é o serviço">
          <p>
            O Gridgen é uma ferramenta de produção de conteúdo em massa para redes sociais: você configura uma ou
            mais marcas (Perfis) dentro da sua conta, gera posts com apoio de inteligência artificial e recebe os
            arquivos prontos pra publicar.
          </p>
        </Secao>

        <Secao titulo="3. Sua conta">
          <p>
            Você é responsável por manter suas credenciais de acesso em sigilo e por toda atividade realizada na sua
            conta. Uma conta pode gerenciar múltiplos Perfis (marcas/clientes), e usuários podem ser convidados pra
            colaborar nela.
          </p>
        </Secao>

        <Secao titulo="4. Conteúdo que você envia">
          <p>
            Ao enviar imagens, textos ou qualquer outro material pra plataforma (logo, fotos de produto, contexto de
            marca), você declara ter os direitos necessários sobre esse material. Não envie conteúdo que viole
            direitos de terceiros.
          </p>
        </Secao>

        <Secao titulo="5. Conteúdo gerado pela plataforma">
          <p>
            O conteúdo gerado a partir dos seus dados (textos, legendas, imagens renderizadas) é seu. Você pode
            usar, editar e publicar como quiser, sem custo de licenciamento adicional.
          </p>
          <p>
            O texto de posts pode ser escrito com apoio de inteligência artificial (a partir do contexto que você
            fornece sobre a marca). Ferramentas de IA podem produzir informação incorreta ou fora de contexto, então
            recomendamos revisar todo conteúdo antes de publicar. A plataforma sempre exige essa revisão antes de
            gerar as imagens finais.
          </p>
        </Secao>

        <Secao titulo="6. Integrações de terceiros">
          <p>
            O Gridgen pode se conectar a serviços de terceiros a seu pedido: geração de texto (Anthropic) e busca de
            imagem de referência (Pexels). O uso dessas integrações também está sujeito aos termos do respectivo
            serviço. Você pode desconectar qualquer integração a qualquer momento.
          </p>
        </Secao>

        <Secao titulo="7. Planos e cobrança">
          <p>
            O produto está em fase de desenvolvimento e ainda não possui cobrança ativa. Condições comerciais, como
            planos, preços e forma de pagamento, serão comunicadas antes de qualquer cobrança começar a valer, e
            exigirão aceite explícito.
          </p>
        </Secao>

        <Secao titulo="8. Cancelamento">
          <p>
            Você pode encerrar sua conta a qualquer momento pela própria plataforma. Ao encerrar, seus dados são
            tratados conforme descrito na nossa Política de Privacidade.
          </p>
        </Secao>

        <Secao titulo="9. Limitação de responsabilidade">
          <p>
            O Gridgen é fornecido "como está". Fazemos o possível pra manter o serviço disponível e o conteúdo gerado
            consistente, mas não garantimos resultado específico de marketing ou de conversão. O desempenho de
            qualquer conteúdo publicado depende de fatores fora do nosso controle.
          </p>
        </Secao>

        <Secao titulo="10. Alterações nestes termos">
          <p>
            Podemos atualizar estes termos conforme o produto evolui. Mudanças relevantes serão comunicadas na
            própria plataforma antes de entrarem em vigor.
          </p>
        </Secao>

        <Secao titulo="11. Lei aplicável">
          <p>
            Estes termos são regidos pelas leis do Brasil. Fica eleito o foro do domicílio da eknotech pra dirimir
            qualquer controvérsia, salvo disposição legal em contrário.
          </p>
        </Secao>

        <Secao titulo="12. Contato">
          <p>
            Dúvidas sobre estes termos podem ser enviadas pelos canais de contato da eknotech em{' '}
            <a href="https://eknotech.com.br" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              eknotech.com.br
            </a>
            .
          </p>
        </Secao>
      </div>
    </div>
  )
}
