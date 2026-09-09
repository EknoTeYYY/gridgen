import type { PrismaClient } from '@prisma/client'
import { baixarComoDataUri, buscarFotos } from './pexels.js'

export interface ConsultaImagem {
  // Português — usada pra tentar casar com a Galeria do Perfil.
  descricao: string
  // Inglês, palavras-chave de banco de imagens — usada só no Pexels (que
  // indexa majoritariamente em inglês; a mesma busca em português costuma
  // voltar foto genérica/sem relação, confirmado na prática).
  pexels: string
}

// Resolve uma imagem de referência sozinho, sem o usuário precisar escolher:
// 1º tenta a Galeria do Perfil (o material que ele já subiu), 2º cai pro
// Pexels — nessa ordem, sempre. Falha de qualquer uma das duas etapas não
// derruba a geração (mesmo espírito de "foto é sempre opcional" já
// estabelecido no resto do produto) — só devolve `null`, e o slide fica sem
// foto, igual ficaria se o usuário não tivesse anexado nada manualmente.
export async function resolverImagemAutomatica(prisma: PrismaClient, perfilId: string, consulta: ConsultaImagem): Promise<string | null> {
  // 1. Galeria — busca por palavra-chave simples no nome/pasta do item (a
  // Galeria não tem descrição/tags, só esses dois campos de texto livre).
  const itens = await prisma.galeriaItem.findMany({ where: { perfilId } })
  const palavras = consulta.descricao
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p.length > 3)
  const match = itens.find((item) => {
    const alvo = `${item.pasta} ${item.nome ?? ''}`.toLowerCase()
    return palavras.some((palavra) => alvo.includes(palavra))
  })
  if (match) return match.url

  // 2. Pexels — fallback quando a Galeria não tem nada relevante (ou está
  // vazia). Chave ausente ou busca sem resultado só volta `null`.
  try {
    const fotos = await buscarFotos(consulta.pexels)
    if (fotos.length === 0) return null
    return await baixarComoDataUri(fotos[0].imagemUrl)
  } catch {
    return null
  }
}
