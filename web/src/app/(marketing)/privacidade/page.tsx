const ATUALIZADO_EM = '31 de agosto de 2026'

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-bold tracking-tight">{titulo}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-24 pb-16">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: {ATUALIZADO_EM}</p>

      <p className="mt-6 rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Esta é uma minuta preparada durante o desenvolvimento do produto, ainda sujeita a revisão jurídica antes do
        lançamento público. Ela descreve, com a maior precisão possível, os dados que o produto de fato coleta e
        como usa cada um hoje.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        <Secao titulo="1. Quem somos">
          <p>
            O Gridgen é operado pela eknotech, responsável pelo tratamento dos dados descritos nesta política
            (controladora, nos termos da Lei Geral de Proteção de Dados, a LGPD).
          </p>
        </Secao>

        <Secao titulo="2. Dados que coletamos">
          <p>
            <b className="text-foreground">Dados de cadastro:</b> nome, e-mail e senha (armazenada com hash, nunca
            em texto puro) de quem cria uma conta.
          </p>
          <p>
            <b className="text-foreground">Dados de Perfil e marca:</b> nome, cores, fonte, logo, ícone, telefone,
            e-mail de contato, documento (CPF/CNPJ) e redes sociais que você cadastra pra cada marca gerenciada na
            conta.
          </p>
          <p>
            <b className="text-foreground">Contexto de marca:</b> o conteúdo das conversas usadas pra construir o
            contexto que orienta a geração de posts: o que você conta sobre a marca, o público e o tom de voz.
          </p>
          <p>
            <b className="text-foreground">Conteúdo gerado:</b> os posts criados (texto, legendas, imagens enviadas
            ou geradas) e o histórico de status de cada um (rascunho, gerando, pronto).
          </p>
          <p>
            <b className="text-foreground">Dados técnicos:</b> cookies estritamente necessários pra manter sua
            sessão autenticada. Não usamos cookies de rastreamento ou publicidade.
          </p>
        </Secao>

        <Secao titulo="3. Como usamos esses dados">
          <p>Usamos os dados coletados exclusivamente para:</p>
          <ul className="ml-4 list-disc [&>li]:mt-1.5">
            <li>Operar sua conta e autenticar seu acesso;</li>
            <li>Gerar conteúdo de acordo com o contexto de marca que você fornece;</li>
            <li>Manter a identidade visual de cada Perfil consistente nas imagens geradas;</li>
            <li>Diagnosticar falhas técnicas e manter o serviço no ar.</li>
          </ul>
          <p>Não vendemos dados pessoais a terceiros, sob nenhuma circunstância.</p>
        </Secao>

        <Secao titulo="4. Compartilhamento com terceiros">
          <p>Alguns dados são enviados a serviços de terceiros, estritamente pra viabilizar funcionalidades que você aciona:</p>
          <ul className="ml-4 list-disc [&>li]:mt-1.5">
            <li>
              <b className="text-foreground">Anthropic (Claude):</b> o contexto de marca e o pedido de geração são
              enviados pra escrever o texto do post, quando você usa a geração por IA.
            </li>
            <li>
              <b className="text-foreground">Pexels:</b> termos de busca, quando você procura uma imagem de
              referência em vez de enviar uma foto própria.
            </li>
          </ul>
        </Secao>

        <Secao titulo="5. Segurança e armazenamento">
          <p>
            Senhas são armazenadas com hash (nunca em texto puro). Tokens de acesso a integrações de terceiros são
            cifrados em repouso. Os dados ficam hospedados em infraestrutura própria do produto, isolada de outros
            sistemas.
          </p>
        </Secao>

        <Secao titulo="6. Seus direitos">
          <p>Nos termos da LGPD, você pode a qualquer momento solicitar:</p>
          <ul className="ml-4 list-disc [&>li]:mt-1.5">
            <li>Confirmação de que tratamos seus dados, e acesso a eles;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Exclusão dos dados tratados com seu consentimento;</li>
            <li>Portabilidade dos dados a outro fornecedor de serviço.</li>
          </ul>
          <p>Você também pode excluir Perfis, posts e a própria conta diretamente pela plataforma, a qualquer momento.</p>
        </Secao>

        <Secao titulo="7. Retenção">
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir a conta, os dados associados são
            removidos, exceto quando a lei exigir retenção por período diferente.
          </p>
        </Secao>

        <Secao titulo="8. Alterações nesta política">
          <p>
            Podemos atualizar esta política conforme o produto evolui. Mudanças relevantes serão comunicadas na
            própria plataforma antes de entrarem em vigor.
          </p>
        </Secao>

        <Secao titulo="9. Contato">
          <p>
            Dúvidas sobre esta política ou sobre o tratamento dos seus dados podem ser enviadas pelos canais de
            contato da eknotech em{' '}
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
