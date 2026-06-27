import type { PrismaClient } from '@prisma/client'
import AdmZip from 'adm-zip'
import { NFeParserService } from './nfe-parser.service.js'

export interface ImportFileResult {
  success: boolean
  fileName: string
  documentId?: string
  error?: string
}

export interface ImportBatchResult {
  batchId: string
  totalFiles: number
  successCount: number
  errorCount: number
  results: ImportFileResult[]
}

export class ImportService {
  private parserSvc = new NFeParserService()

  constructor(private prisma: PrismaClient) {}

  async importXml(userId: string, fileName: string, xmlContent: string): Promise<ImportBatchResult> {
    const batch = await this.prisma.importBatch.create({
      data: { userId, fileName, fileType: 'xml', totalFiles: 1, status: 'processing' },
    })

    const result = await this.processXml(userId, batch.id, fileName, xmlContent)

    await this.prisma.importBatch.update({
      where: { id: batch.id },
      data: {
        successCount: result.success ? 1 : 0,
        errorCount: result.success ? 0 : 1,
        status: 'completed',
      },
    })

    return {
      batchId: batch.id,
      totalFiles: 1,
      successCount: result.success ? 1 : 0,
      errorCount: result.success ? 0 : 1,
      results: [result],
    }
  }

  async importZip(userId: string, fileName: string, buffer: Buffer): Promise<ImportBatchResult> {
    const zip = new AdmZip(buffer)
    const entries = zip.getEntries().filter((e) => e.entryName.toLowerCase().endsWith('.xml'))

    const batch = await this.prisma.importBatch.create({
      data: { userId, fileName, fileType: 'zip', totalFiles: entries.length, status: 'processing' },
    })

    const results: ImportFileResult[] = []
    for (const entry of entries) {
      const xmlContent = entry.getData().toString('utf-8')
      results.push(await this.processXml(userId, batch.id, entry.entryName, xmlContent))
    }

    const successCount = results.filter((r) => r.success).length
    const errorCount = results.filter((r) => !r.success).length

    await this.prisma.importBatch.update({
      where: { id: batch.id },
      data: { successCount, errorCount, status: 'completed' },
    })

    return { batchId: batch.id, totalFiles: entries.length, successCount, errorCount, results }
  }

  private async processXml(
    userId: string,
    batchId: string,
    fileName: string,
    xmlContent: string,
  ): Promise<ImportFileResult> {
    try {
      const parsed = this.parserSvc.parse(xmlContent)

      const doc = await this.prisma.$transaction(async (tx) => {
        const document = await tx.fiscalDocument.create({
          data: {
            userId,
            accessKey: parsed.accessKey,
            documentNumber: parsed.documentNumber,
            series: parsed.series,
            model: parsed.model,
            direction: parsed.direction ?? undefined,
            operationType: parsed.operationType,
            issueDate: parsed.issueDate ?? undefined,
            totalAmount: parsed.totalAmount ?? undefined,
            productsAmount: parsed.productsAmount ?? undefined,
            discountAmount: parsed.discountAmount ?? undefined,
            freightAmount: parsed.freightAmount ?? undefined,
            taxAmount: parsed.taxAmount ?? undefined,
            status: parsed.status ?? undefined,
            rawXml: xmlContent,
            sourceFileName: fileName,
            importedAt: new Date(),
          },
        })

        // Parties
        const partiesData = [
          { partyType: 'issuer' as const, ...parsed.issuer },
          ...(parsed.recipient
            ? [{ partyType: 'recipient' as const, ...parsed.recipient }]
            : []),
        ]
        for (const p of partiesData) {
          await tx.fiscalParty.create({ data: { documentId: document.id, ...p } })
        }

        // Items + item-level taxes
        for (const item of parsed.items) {
          const { taxes: itemTaxes, ...itemData } = item
          const createdItem = await tx.fiscalItem.create({
            data: { documentId: document.id, ...itemData },
          })

          for (const tax of itemTaxes) {
            await tx.fiscalTax.create({
              data: { documentId: document.id, itemId: createdItem.id, ...tax },
            })
          }
        }

        // Document-level taxes (from ICMSTot)
        for (const tax of parsed.docTaxes) {
          await tx.fiscalTax.create({
            data: {
              documentId: document.id,
              taxType: tax.taxType,
              baseAmount: tax.baseAmount ?? undefined,
              taxAmount: tax.taxAmount ?? undefined,
            },
          })
        }

        return document
      })

      return { success: true, fileName, documentId: doc.id }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      await this.prisma.importError.create({
        data: { batchId, fileName, errorMessage, rawContent: xmlContent.slice(0, 5000) },
      })
      return { success: false, fileName, error: errorMessage }
    }
  }
}
