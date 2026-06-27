import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DocumentService } from './document.service.js'
import type { PrismaClient } from '@prisma/client'

function makeDoc(overrides = {}) {
  return {
    id: 'doc-1',
    userId: 'user-1',
    accessKey: '12345',
    documentNumber: '1',
    series: '001',
    model: '55',
    direction: 'saida',
    status: 'autorizada',
    issueDate: new Date('2026-06-27'),
    totalAmount: 100,
    productsAmount: 100,
    discountAmount: 0,
    freightAmount: 0,
    taxAmount: 12,
    operationType: 'VENDA',
    rawXml: '<nfe/>',
    sourceFileName: '1.xml',
    importedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    parties: [],
    ...overrides,
  }
}

function makeMockPrisma() {
  return {
    fiscalDocument: {
      findMany: vi.fn().mockResolvedValue([makeDoc()]),
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue(makeDoc()),
      update: vi.fn().mockResolvedValue(makeDoc({ direction: 'entrada' })),
      delete: vi.fn().mockResolvedValue(makeDoc()),
    },
  } as unknown as PrismaClient
}

describe('DocumentService', () => {
  let mock: PrismaClient
  let svc: DocumentService

  beforeEach(() => {
    mock = makeMockPrisma()
    svc = new DocumentService(mock)
  })

  it('list retorna documentos paginados', async () => {
    const result = await svc.list('user-1', { page: 1, limit: 10 })
    expect(result.total).toBe(1)
    expect(result.documents).toHaveLength(1)
    expect(mock.fiscalDocument.findMany).toHaveBeenCalled()
  })

  it('list aplica filtro direction', async () => {
    await svc.list('user-1', { direction: 'saida' })
    expect(mock.fiscalDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ direction: 'saida' }) }),
    )
  })

  it('get retorna documento com relações', async () => {
    const doc = await svc.get('user-1', 'doc-1')
    expect(doc.id).toBe('doc-1')
  })

  it('get lança DOCUMENT_NOT_FOUND quando não existe', async () => {
    vi.mocked(mock.fiscalDocument.findFirst).mockResolvedValueOnce(null)
    await expect(svc.get('user-1', 'missing')).rejects.toThrow('DOCUMENT_NOT_FOUND')
  })

  it('updateDirection altera direção', async () => {
    const doc = await svc.updateDirection('user-1', 'doc-1', 'entrada')
    expect(doc.direction).toBe('entrada')
    expect(mock.fiscalDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { direction: 'entrada' } }),
    )
  })

  it('remove chama delete', async () => {
    await svc.remove('user-1', 'doc-1')
    expect(mock.fiscalDocument.delete).toHaveBeenCalledWith({ where: { id: 'doc-1' } })
  })

  it('remove lança erro quando não encontrado', async () => {
    vi.mocked(mock.fiscalDocument.findFirst).mockResolvedValueOnce(null)
    await expect(svc.remove('user-1', 'missing')).rejects.toThrow('DOCUMENT_NOT_FOUND')
  })
})
