import { describe, expect, it, vi } from 'vitest'
import { buildApp } from '../app.js'

vi.mock('@prisma/client', () => {
  const mockUser = {
    id: 'user-import-test',
    email: 'import@test.com',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuuiABCDEFGHIJKLMNOPQRSTUVWXYZ12',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      $connect: vi.fn(),
      $disconnect: vi.fn(),
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(mockUser),
      },
      importBatch: {
        create: vi.fn().mockResolvedValue({ id: 'batch-1' }),
        update: vi.fn().mockResolvedValue({ id: 'batch-1' }),
      },
      importError: { create: vi.fn().mockResolvedValue({ id: 'err-1' }) },
      $transaction: vi.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          fiscalDocument: { create: vi.fn().mockResolvedValue({ id: 'doc-1' }) },
          fiscalParty: { create: vi.fn().mockResolvedValue({ id: 'p-1' }) },
          fiscalItem: { create: vi.fn().mockResolvedValue({ id: 'i-1' }) },
          fiscalTax: { create: vi.fn().mockResolvedValue({ id: 't-1' }) },
        }),
      ),
    })),
  }
})

describe('POST /import/xml', () => {
  it('requires authentication', async () => {
    const app = await buildApp()
    await app.ready()

    const response = await app.inject({ method: 'POST', url: '/import/xml' })
    expect(response.statusCode).toBe(401)
    await app.close()
  })

  it('returns 400 when no file is sent', async () => {
    const app = await buildApp()
    await app.ready()

    const reg = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'import@test.com', password: 'secret123' },
    })
    const { token } = reg.json()

    const response = await app.inject({
      method: 'POST',
      url: '/import/xml',
      headers: { authorization: `Bearer ${token}` },
      // multipart sem arquivo
    })

    expect([400, 406, 415]).toContain(response.statusCode)
    await app.close()
  })
})

describe('POST /import/zip', () => {
  it('requires authentication', async () => {
    const app = await buildApp()
    await app.ready()

    const response = await app.inject({ method: 'POST', url: '/import/zip' })
    expect(response.statusCode).toBe(401)
    await app.close()
  })
})
