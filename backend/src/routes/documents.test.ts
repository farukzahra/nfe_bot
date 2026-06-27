import { describe, expect, it, vi } from 'vitest'
import { buildApp } from '../app.js'

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 'u1', email: 'doc@test.com', passwordHash: 'h',
        createdAt: new Date(), updatedAt: new Date(),
      }),
    },
    fiscalDocument: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      delete: vi.fn(),
    },
    importBatch: { create: vi.fn(), update: vi.fn() },
    importError: { create: vi.fn() },
    $transaction: vi.fn(),
    fiscalParty: { create: vi.fn() },
    fiscalItem: { create: vi.fn() },
    fiscalTax: { create: vi.fn() },
  })),
}))

describe('GET /documents', () => {
  it('requires authentication', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await app.inject({ method: 'GET', url: '/documents' })
    expect(res.statusCode).toBe(401)
    await app.close()
  })

  it('returns empty list when no documents', async () => {
    const app = await buildApp()
    await app.ready()

    const reg = await app.inject({
      method: 'POST', url: '/auth/register',
      payload: { email: 'doc@test.com', password: 'secret123' },
    })
    const { token } = reg.json()

    const res = await app.inject({
      method: 'GET', url: '/documents',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().total).toBe(0)
    expect(res.json().documents).toEqual([])
    await app.close()
  })
})

describe('DELETE /documents/:id', () => {
  it('requires authentication', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await app.inject({ method: 'DELETE', url: '/documents/abc' })
    expect(res.statusCode).toBe(401)
    await app.close()
  })
})

describe('GET /errors', () => {
  it('requires authentication', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await app.inject({ method: 'GET', url: '/errors' })
    expect(res.statusCode).toBe(401)
    await app.close()
  })
})
