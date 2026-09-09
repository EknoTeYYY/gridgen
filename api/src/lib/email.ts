import { Resend } from 'resend'
import { env } from '../env.js'

let cliente: Resend | null = null

// Lazy: só exige a env var quando um convite de Conta é de fato enviado — o
// resto da api funciona sem RESEND_API_KEY.
function getResend(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY não configurada — defina no .env pra enviar e-mails (convites, avisos de publicação).')
  }
  if (!cliente) cliente = new Resend(env.RESEND_API_KEY)
  return cliente
}

export async function enviarConviteConta(params: { email: string; contaNome: string; link: string }): Promise<void> {
  const resend = getResend()
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.email,
    subject: `Você foi convidado pra acessar o Gridgen`,
    html: `
      <p>Você foi convidado a acessar a conta <strong>${params.contaNome}</strong> no Gridgen.</p>
      <p><a href="${params.link}">Clique aqui pra definir sua senha e entrar</a></p>
      <p>Esse link expira em ${env.INVITE_TOKEN_TTL_DAYS} dias.</p>
    `,
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
  const dataFormatada = params.agendadoPara.toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  })
  const redesLinha =
    params.redes.length > 0
      ? `<p>Marcado pra publicar em: <strong>${params.redes.join(', ')}</strong>.</p>`
      : ''
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.email,
    subject: `Hora de publicar: ${params.postSlug} (${params.perfilNome})`,
    html: `
      <p>O post <strong>${params.postSlug}</strong> de <strong>${params.perfilNome}</strong> estava agendado pra agora (${dataFormatada}).</p>
      ${redesLinha}
      <p><a href="${params.link}">Abra o post</a> pra baixar as imagens e copiar a legenda.</p>
    `,
  })
  if (error) throw new Error(`falha ao enviar e-mail via Resend: ${error.message}`)
}
