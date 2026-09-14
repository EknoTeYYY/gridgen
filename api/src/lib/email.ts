import { Resend } from 'resend'
import { env } from '../env.js'

let cliente: Resend | null = null

// Lazy: só exige a env var quando um e-mail é de fato enviado — o resto da api
// funciona sem RESEND_API_KEY.
function getResend(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY não configurada — defina no .env pra enviar e-mails (convites, avisos de publicação).')
  }
  if (!cliente) cliente = new Resend(env.RESEND_API_KEY)
  return cliente
}

// ============================================================
// Template base dos e-mails — HTML "à prova de cliente de e-mail":
// layout em tabela, CSS 100% inline, botão com cor de fundo direta (funciona
// até no Outlook, que ignora border-radius mas mantém o bgcolor). O cabeçalho
// usa bgcolor sólido como fallback do gradiente.
// ============================================================
const MARCA = '#7C3AED' // violet-600 — cor da marca do Gridgen (ver web/globals.css)
const MARCA_ESCURA = '#6D28D9' // violet-700
const FUNDO = '#f4f4f7'
const TEXTO = '#1f2937'
const SECUNDARIO = '#6b7280'
const WORDMARK = 'https://gridgen.com.br/gridgen-wordmark-branco.png'
const FONTE = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif"

// Escapa dados de usuário (nome de conta/perfil, slug) antes de interpolar no
// HTML — evita que um nome com "<" ou aspas quebre o layout do e-mail.
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface LayoutEmail {
  preheader: string
  titulo: string
  corpoHtml: string
  ctaTexto?: string
  ctaLink?: string
  rodape?: string
}

function montarEmail(o: LayoutEmail): string {
  const botao =
    o.ctaTexto && o.ctaLink
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px 0;"><tr><td align="center">
           <a href="${o.ctaLink}" target="_blank" style="display:inline-block;padding:14px 32px;background-color:${MARCA};color:#ffffff;font-family:${FONTE};font-size:16px;font-weight:bold;text-decoration:none;border-radius:8px;">${o.ctaTexto}</a>
         </td></tr></table>`
      : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background-color:${FUNDO};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${o.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${FUNDO};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;">
        <tr><td align="center" bgcolor="${MARCA}" style="background:linear-gradient(135deg,${MARCA},${MARCA_ESCURA});padding:28px 24px;">
          <img src="${WORDMARK}" alt="Gridgen" width="150" style="display:block;border:0;height:auto;max-width:150px;">
        </td></tr>
        <tr><td style="padding:36px 40px 4px 40px;font-family:${FONTE};color:${TEXTO};">
          <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.35;font-weight:700;color:${TEXTO};">${o.titulo}</h1>
          <div style="font-size:16px;line-height:1.6;color:${TEXTO};">${o.corpoHtml}</div>
          ${botao}
        </td></tr>
        <tr><td style="padding:20px 40px 32px 40px;font-family:${FONTE};">
          <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 16px 0;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:${SECUNDARIO};">${o.rodape ?? 'Você recebeu este e-mail do Gridgen.'}</p>
          <p style="margin:10px 0 0 0;font-size:12px;color:#9ca3af;">Gridgen — gestão de conteúdo</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function enviarConviteConta(params: { email: string; contaNome: string; link: string }): Promise<void> {
  const resend = getResend()
  const conta = esc(params.contaNome)
  const html = montarEmail({
    preheader: `Convite pra acessar ${conta} no Gridgen`,
    titulo: 'Você foi convidado pro Gridgen',
    corpoHtml: `<p style="margin:0 0 12px 0;">Você foi convidado a acessar a conta <strong>${conta}</strong> no Gridgen.</p><p style="margin:0;">Clique no botão abaixo pra definir sua senha e entrar.</p>`,
    ctaTexto: 'Aceitar convite',
    ctaLink: params.link,
    rodape: `Este convite expira em ${env.INVITE_TOKEN_TTL_DAYS} dias. Se você não esperava este e-mail, pode ignorá-lo.`,
  })
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.email,
    subject: 'Você foi convidado pra acessar o Gridgen',
    html,
    text: `Você foi convidado a acessar a conta ${params.contaNome} no Gridgen.\nDefina sua senha e entre: ${params.link}\nO link expira em ${env.INVITE_TOKEN_TTL_DAYS} dias.`,
  })
  if (error) throw new Error(`falha ao enviar e-mail via Resend: ${error.message}`)
}

// Publicação em si é manual (decisão de produto — ver comentário de
// `Post.agendadoPara`): este e-mail é o "empurrão" na hora certa pra alguém
// abrir o post, baixar as imagens e copiar a legenda. `agendadoPara` nasce de
// um `<input datetime-local>` sem conversão de fuso (ver `calendario-mensal.tsx`)
// — assume-se horário de Brasília aqui, mesmo público-alvo do resto do produto.
export async function enviarAvisoPublicacao(params: {
  email: string
  perfilNome: string
  postSlug: string
  agendadoPara: Date
  redes: string[]
  link: string
}): Promise<void> {
  const resend = getResend()
  const perfil = esc(params.perfilNome)
  const slug = esc(params.postSlug)
  const dataFormatada = params.agendadoPara.toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  })
  const redesLinha =
    params.redes.length > 0
      ? `<p style="margin:0 0 12px 0;">Marcado pra publicar em: <strong>${esc(params.redes.join(', '))}</strong>.</p>`
      : ''
  const html = montarEmail({
    preheader: `Hora de publicar: ${slug}`,
    titulo: 'Hora de publicar',
    corpoHtml: `<p style="margin:0 0 12px 0;">O post <strong>${slug}</strong> de <strong>${perfil}</strong> estava agendado pra agora (${dataFormatada}).</p>${redesLinha}<p style="margin:0;">Abra o post pra baixar as imagens e copiar a legenda.</p>`,
    ctaTexto: 'Abrir o post',
    ctaLink: params.link,
    rodape: 'Aviso automático de agendamento do Gridgen.',
  })
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.email,
    subject: `Hora de publicar: ${params.postSlug} (${params.perfilNome})`,
    html,
    text: `O post ${params.postSlug} de ${params.perfilNome} estava agendado pra agora (${dataFormatada}).\nAbra o post pra baixar as imagens e copiar a legenda: ${params.link}`,
  })
  if (error) throw new Error(`falha ao enviar e-mail via Resend: ${error.message}`)
}
