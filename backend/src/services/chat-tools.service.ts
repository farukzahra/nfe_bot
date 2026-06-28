import { tool } from 'ai'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'

function dateFilter(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return {}
  const issueDate: { gte?: Date; lte?: Date } = {}
  if (dateFrom) issueDate.gte = new Date(dateFrom)
  if (dateTo) {
    const d = new Date(dateTo)
    d.setHours(23, 59, 59, 999)
    issueDate.lte = d
  }
  return { issueDate }
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function createChatTools(userId: string, prisma: PrismaClient) {
  return {
    getFinancialSummary: tool({
      description:
        'Retorna resumo financeiro: total de vendas (saídas), total de compras (entradas) e saldo líquido do período.',
      parameters: z.object({
        dateFrom: z.string().optional().describe('Data início no formato YYYY-MM-DD'),
        dateTo: z.string().optional().describe('Data fim no formato YYYY-MM-DD'),
      }),
      execute: async ({ dateFrom, dateTo }) => {
        const base = { userId, status: 'autorizada' as const, ...dateFilter(dateFrom, dateTo) }
        const [sales, purchases] = await Promise.all([
          prisma.fiscalDocument.aggregate({
            where: { ...base, direction: 'saida' },
            _sum: { totalAmount: true },
            _count: { _all: true },
          }),
          prisma.fiscalDocument.aggregate({
            where: { ...base, direction: 'entrada' },
            _sum: { totalAmount: true },
            _count: { _all: true },
          }),
        ])
        const s = Number(sales._sum.totalAmount ?? 0)
        const p = Number(purchases._sum.totalAmount ?? 0)
        return {
          period: dateFrom || dateTo ? `${dateFrom ?? 'início'} → ${dateTo ?? 'hoje'}` : 'todo o período',
          sales: { total: s, formatted: fmt(s), count: sales._count._all },
          purchases: { total: p, formatted: fmt(p), count: purchases._count._all },
          balance: { total: s - p, formatted: fmt(s - p) },
        }
      },
    }),

    getTopProducts: tool({
      description: 'Lista os produtos mais vendidos ou mais comprados, ordenados por valor total.',
      parameters: z.object({
        direction: z.enum(['saida', 'entrada']).describe('saida=vendas, entrada=compras'),
        limit: z.number().int().min(1).max(20).default(5).describe('Quantos produtos retornar'),
        dateFrom: z.string().optional().describe('Data início YYYY-MM-DD'),
        dateTo: z.string().optional().describe('Data fim YYYY-MM-DD'),
      }),
      execute: async ({ direction, limit, dateFrom, dateTo }) => {
        const df = dateFilter(dateFrom, dateTo)
        const rows = await prisma.fiscalItem.groupBy({
          by: ['description'],
          where: {
            document: { userId, direction, status: 'autorizada', ...df },
            description: { not: null },
          },
          _sum: { totalPrice: true, quantity: true },
          _count: { _all: true },
          orderBy: { _sum: { totalPrice: 'desc' } },
          take: limit,
        })
        return {
          direction: direction === 'saida' ? 'vendas' : 'compras',
          products: rows.map((r, i) => ({
            rank: i + 1,
            description: r.description,
            totalValue: fmt(Number(r._sum.totalPrice ?? 0)),
            totalQty: Number(r._sum.quantity ?? 0),
            occurrences: r._count._all,
          })),
        }
      },
    }),

    getTopParties: tool({
      description: 'Lista os maiores clientes (destinatários nas saídas) ou maiores fornecedores (emitentes nas entradas).',
      parameters: z.object({
        type: z.enum(['customers', 'suppliers']).describe('customers=clientes, suppliers=fornecedores'),
        limit: z.number().int().min(1).max(20).default(5),
        dateFrom: z.string().optional().describe('Data início YYYY-MM-DD'),
        dateTo: z.string().optional().describe('Data fim YYYY-MM-DD'),
      }),
      execute: async ({ type, limit, dateFrom, dateTo }) => {
        const direction = type === 'customers' ? 'saida' : 'entrada'
        const partyType = type === 'customers' ? 'recipient' : 'issuer'
        const df = dateFilter(dateFrom, dateTo)

        const rows = await prisma.fiscalParty.groupBy({
          by: ['legalName', 'documentNumber'],
          where: {
            partyType,
            legalName: { not: null },
            document: { userId, direction, status: 'autorizada', ...df },
          },
          _sum: {},
          _count: { _all: true },
          orderBy: { _count: { _all: 'desc' } },
          take: limit,
        })

        const withTotals = await Promise.all(
          rows.map(async (r) => {
            const agg = await prisma.fiscalDocument.aggregate({
              where: {
                userId,
                direction,
                status: 'autorizada',
                parties: { some: { partyType, legalName: r.legalName } },
                ...df,
              },
              _sum: { totalAmount: true },
            })
            return {
              name: r.legalName,
              document: r.documentNumber,
              totalValue: fmt(Number(agg._sum.totalAmount ?? 0)),
              noteCount: r._count._all,
            }
          }),
        )

        return {
          type: type === 'customers' ? 'Clientes' : 'Fornecedores',
          list: withTotals.sort((a, b) => b.noteCount - a.noteCount).map((x, i) => ({ rank: i + 1, ...x })),
        }
      },
    }),

    getDocuments: tool({
      description: 'Busca documentos fiscais com filtros. Use para responder perguntas sobre notas específicas.',
      parameters: z.object({
        direction: z.enum(['entrada', 'saida']).optional().describe('Tipo de nota'),
        search: z.string().optional().describe('Busca por nome de empresa ou chave'),
        dateFrom: z.string().optional().describe('Data início YYYY-MM-DD'),
        dateTo: z.string().optional().describe('Data fim YYYY-MM-DD'),
        limit: z.number().int().min(1).max(20).default(5),
      }),
      execute: async ({ direction, search, dateFrom, dateTo, limit }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { userId, status: 'autorizada', ...dateFilter(dateFrom, dateTo) }
        if (direction) where.direction = direction
        if (search) {
          where.OR = [
            { accessKey: { contains: search } },
            { parties: { some: { legalName: { contains: search, mode: 'insensitive' } } } },
          ]
        }
        const docs = await prisma.fiscalDocument.findMany({
          where,
          include: { parties: true },
          orderBy: { issueDate: 'desc' },
          take: limit,
        })
        return docs.map((d) => {
          const issuer = d.parties.find((p) => p.partyType === 'issuer')
          const recipient = d.parties.find((p) => p.partyType === 'recipient')
          return {
            number: d.documentNumber,
            direction: d.direction,
            date: d.issueDate?.toLocaleDateString('pt-BR'),
            total: fmt(Number(d.totalAmount ?? 0)),
            issuer: issuer?.legalName,
            recipient: recipient?.legalName,
            status: d.status,
          }
        })
      },
    }),

    getImportStats: tool({
      description: 'Retorna estatísticas das importações: total de lotes, notas importadas e erros.',
      parameters: z.object({}),
      execute: async () => {
        const [batches, docs, errors] = await Promise.all([
          prisma.importBatch.count({ where: { userId } }),
          prisma.fiscalDocument.count({ where: { userId } }),
          prisma.importError.count({ where: { batch: { userId } } }),
        ])
        const last = await prisma.importBatch.findFirst({
          where: { userId },
          orderBy: { importedAt: 'desc' },
          select: { importedAt: true, fileName: true },
        })
        return {
          totalBatches: batches,
          totalDocuments: docs,
          totalErrors: errors,
          lastImport: last
            ? { file: last.fileName, date: last.importedAt.toLocaleDateString('pt-BR') }
            : null,
        }
      },
    }),
  }
}
