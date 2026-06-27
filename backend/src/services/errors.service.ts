import type { PrismaClient } from '@prisma/client'
import { ImportService } from './import.service.js'

export class ErrorsService {
  private importSvc: ImportService

  constructor(private prisma: PrismaClient) {
    this.importSvc = new ImportService(prisma)
  }

  async list(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    const where = { batch: { userId } }

    const [total, errors] = await Promise.all([
      this.prisma.importError.count({ where }),
      this.prisma.importError.findMany({
        where,
        include: {
          batch: { select: { id: true, fileName: true, importedAt: true, fileType: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return { total, page, limit, pages: Math.ceil(total / limit), errors }
  }

  async get(userId: string, errorId: string) {
    const error = await this.prisma.importError.findFirst({
      where: { id: errorId, batch: { userId } },
      include: {
        batch: { select: { id: true, fileName: true, importedAt: true } },
      },
    })
    if (!error) throw new Error('ERROR_NOT_FOUND')
    return error
  }

  async reprocess(userId: string, errorId: string) {
    const err = await this.prisma.importError.findFirst({
      where: { id: errorId, batch: { userId } },
    })
    if (!err) throw new Error('ERROR_NOT_FOUND')
    if (!err.rawContent) throw new Error('NO_RAW_CONTENT')

    const result = await this.importSvc.importXml(userId, err.fileName, err.rawContent)

    if (result.results[0]?.success) {
      await this.prisma.importError.delete({ where: { id: errorId } })
    }

    return result
  }
}
