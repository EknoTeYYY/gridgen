// Sem `'use client'` de propósito — precisa ser chamável tanto de Server
// Components (`page.tsx` da Visão Geral e, futuramente, de qualquer outra
// página que precise da mesma conta) quanto renderizado dentro do Client
// Component `PropostaMensal`. Um export de dentro de um arquivo `'use
// client'` não pode ser INVOCADO no servidor (só renderizado como
// Componente) — por isso essa função não pode viver dentro de
// `proposta-mensal.tsx`, mesmo sendo pura.
export function proximoMesAno(): { ano: number; mes: number } {
  const hoje = new Date()
  const mes = hoje.getMonth() + 2 // +1 pra 1-based, +1 pro mês seguinte
  return mes > 12 ? { ano: hoje.getFullYear() + 1, mes: mes - 12 } : { ano: hoje.getFullYear(), mes }
}
