import type { Conta, PrismaClient } from '@prisma/client'
import { env } from '../../env.js'
import { enviarConviteConta } from '../../lib/email.js'
import { slugify } from '../../lib/slug.js'
import { gerarTokenOpaco, hashToken } from '../../lib/token.js'

function expiresAtConvite(): Date {
  return new Date(Date.now() + env.INVITE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export type StatusConvite = 'pendente' | 'aceito' | 'expirado' | 'revogado'

export interface ContaComStatus {
  id: string
  nome: string
  slug: string
  plano: string
  status: string
  createdAt: Date
  totalUsuarios: number
  totalPerfis: number
  statusConvite: StatusConvite | null
  conviteEmail: string | null
}

export async function listarContas(prisma: PrismaClient): Promise<ContaComStatus[]> {
  const contas = await prisma.conta.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { usuarios: true, perfis: true } },
      convites: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  return contas.map((conta) => {
    const ultimoConvite = conta.convites[0] ?? null
    let statusConvite: StatusConvite | null = null
    if (ultimoConvite) {
      if (ultimoConvite.aceitoEm) statusConvite = 'aceito'
      else if (ultimoConvite.revokedAt) statusConvite = 'revogado'
      else if (ultimoConvite.expiresAt < new Date()) statusConvite = 'expirado'
      else statusConvite = 'pendente'
    }

    return {
      id: conta.id,
      nome: conta.nome,
      slug: conta.slug,
      plano: conta.plano,
      status: conta.status,
      createdAt: conta.createdAt,
      totalUsuarios: conta._count.usuarios,
      totalPerfis: conta._count.perfis,
      statusConvite,
      conviteEmail: ultimoConvite?.email ?? null,
    }
  })
}

// Evita que um superadmin desative/exclua a própria conta (ou a de outro
// superadmin) por engano — a Eknotech é só a primeira Conta do sistema, sem
// tratamento especial no código, então essa checagem é o único jeito de não
// trancar o próprio acesso ao /admin sem querer.
async function contaTemSuperAdmin(prisma: PrismaClient, contaId: string): Promise<boolean> {
  const superAdmin = await prisma.user.findFirst({ where: { contaId, isSuperAdmin: true } })
  return superAdmin !== null
}

export async function alterarStatusConta(
  prisma: PrismaClient,
  contaId: string,
  status: 'ativa' | 'inativa',
): Promise<{ erro?: string }> {
  if (status === 'inativa' && (await contaTemSuperAdmin(prisma, contaId))) {
    return { erro: 'essa conta tem um administrador da plataforma — não pode ser desativada' }
  }

  await prisma.conta.update({ where: { id: contaId }, data: { status } })

  if (status === 'inativa') {
    // Corta sessões já abertas na próxima tentativa de refresh — o access
    // token de curta duração (15min) ainda vale até expirar naturalmente,
    // mesmo trade-off já aceito no resto da autenticação deste projeto.
    await prisma.refreshToken.updateMany({
      where: { user: { contaId }, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  return {}
}

export async function excluirConta(prisma: PrismaClient, contaId: string): Promise<{ erro?: string }> {
  if (await contaTemSuperAdmin(prisma, contaId)) {
    return { erro: 'essa conta tem um administrador da plataforma — não pode ser excluída' }
  }

  // Cascata do schema cuida do resto (usuários, perfis, posts, galeria,
  // convites, etc.) — mesmo comportamento já usado pra limpar contas de QA
  // ao longo deste projeto.
  await prisma.conta.delete({ where: { id: contaId } })
  return {}
}

export async function criarContaComConvite(
  prisma: PrismaClient,
  params: { nome: string; email: string; criadoPorUserId: string },
): Promise<{ conta: Conta; emailEnviado: boolean }> {
  const baseSlug = slugify(params.nome)
  let slug = baseSlug
  let sufixo = 1
  while (await prisma.conta.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++sufixo}`
  }

  const rawToken = gerarTokenOpaco()
  const conta = await prisma.$transaction(async (tx) => {
    const conta = await tx.conta.create({ data: { nome: params.nome, slug } })
    await tx.conviteConta.create({
      data: {
        contaId: conta.id,
        email: params.email,
        tokenHash: hashToken(rawToken),
        criadoPorUserId: params.criadoPorUserId,
        expiresAt: expiresAtConvite(),
      },
    })
    return conta
  })

  const emailEnviado = await tentarEnviarConvite({ email: params.email, contaNome: conta.nome, rawToken })
  return { conta, emailEnviado }
}

export async function reenviarConvite(
  prisma: PrismaClient,
  params: { contaId: string; email: string; criadoPorUserId: string },
): Promise<{ emailEnviado: boolean }> {
  await prisma.conviteConta.updateMany({
    where: { contaId: params.contaId, aceitoEm: null, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  const conta = await prisma.conta.findUniqueOrThrow({ where: { id: params.contaId } })
  const rawToken = gerarTokenOpaco()
  await prisma.conviteConta.create({
    data: {
      contaId: params.contaId,
      email: params.email,
      tokenHash: hashToken(rawToken),
      criadoPorUserId: params.criadoPorUserId,
      expiresAt: expiresAtConvite(),
    },
  })

  const emailEnviado = await tentarEnviarConvite({ email: params.email, contaNome: conta.nome, rawToken })
  return { emailEnviado }
}

// Nunca deixa uma falha no envio derrubar a criação/reenvio do convite — o
// token já está salvo no banco, então dá pra reenviar depois mesmo se o
// Resend falhar agora (chave ausente, domínio não verificado, etc.).
async function tentarEnviarConvite(params: { email: string; contaNome: string; rawToken: string }): Promise<boolean> {
  try {
    await enviarConviteConta({
      email: params.email,
      contaNome: params.contaNome,
      link: `${env.WEB_APP_URL}/convite/${params.rawToken}`,
    })
    return true
  } catch (err) {
    console.error('falha ao enviar e-mail de convite de Conta:', err)
    return false
  }
}
