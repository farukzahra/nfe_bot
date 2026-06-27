import type { PrismaClient, DocumentDirection, DocumentStatus } from '@prisma/client'

export interface DocumentFilters {
  direction?: string
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export class DocumentService {
  constructor(private prisma: PrismaClient) {}

  async list(userId: string, filters: DocumentFilters = {}) {
    const page = Math.max(1, filters.page ?? 1)
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20))
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId }

    if (filters.direction) where.direction = filters.direction as DocumentDirection
    if (filters.status) where.status = filters.status as DocumentStatus
    if (filters.dateFrom || filters.dateTo) {
      where.issueDate = {}
      if (filters.dateFrom) where.issueDate.gte = new Date(filters.dateFrom)
      if (filters.dateTo) {
        const to = new Date(filters.dateTo)
        to.setHours(23, 59, 59, 999)
        where.issueDate.lte = to
      }
    }
    if (filters.search) {
      const s = filters.search.trim()
      where.OR = [
        { accessKey: { contains: s } },
        { documentNumber: { contains: s } },
        { parties: { some: { legalName: { contains: s, mode: 'insensitive' } } } },
        { parties: { some: { documentNumber: { contains: s } } } },
      ]
    }

    const [total, documents] = await Promise.all([
      this.prisma.fiscalDocument.count({ where }),
      this.prisma.fiscalDocument.findMany({
        where,
        include: { parties: true },
        orderBy: { issueDate: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return { total, page, limit, pages: Math.ceil(total / limit), documents }
  }

  async get(userId: string, id: string) {
    const doc = await this.prisma.fiscalDocument.findFirst({
      where: { id, userId },
      include: {
        parties: true,
        items: {
          orderBy: { id: 'asc' },
          include: { taxes: true },
        },
        taxes: { where: { itemId: null } },
      },
    })
    if (!doc) throw new Error('DOCUMENT_NOT_FOUND')
    return doc
  }

  async updateDirection(userId: string, id: string, direction: DocumentDirection) {
    const existing = await this.prisma.fiscalDocument.findFirst({ where: { id, userId } })
    if (!existing) throw new Error('DOCUMENT_NOT_FOUND')
    return this.prisma.fiscalDocument.update({ where: { id }, data: { direction } })
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.fiscalDocument.findFirst({ where: { id, userId } })
    if (!existing) throw new Error('DOCUMENT_NOT_FOUND')
    await this.prisma.fiscalDocument.delete({ where: { id } })
  }
}
