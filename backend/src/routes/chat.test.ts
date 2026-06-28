import { describe, it, expect, vi } from 'vitest'
import { buildApp } from '../app.js'

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 'u1', email: 'chat@test.com', passwordHash: 'h',
        createdAt: new Date(), updatedAt: new Date(),
      }),
    },
    fiscalDocument: { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0), aggregate: vi.fn().mockResolvedValue({ _sum: {}, _count: { _all: 0 } }) },
    chatConversation: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'conv-1', title: 'test', createdAt: new Date(), updatedAt: new Date() }),
      update: vi.fn(),
      delete: vi.fn(),
    },
    chatMessage: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
    importBatch: { count: vi.fn().mockResolvedValue(0), findFirst: vi.fn().mockResolvedValue(null), create: vi.fn(), update: vi.fn() },
    importError: { count: vi.fn().mockResolvedValue(0), create: vi.fn() },
    fiscalParty: { create: vi.fn() },
    fiscalItem: { create: vi.fn(), groupBy: vi.fn().mockResolvedValue([]) },
    fiscalTax: { create: vi.fn() },
    $transaction: vi.fn(),
  })),
}))

async function getToken() {
  const app = await buildApp()
  await app.ready()
  const reg = await app.inject({
    method: 'POST', url: '/auth/register',
    payload: { email: 'chat@test.com', password: 'secret123' },
  })
  await app.close()
  return reg.json().token
}

describe('GET /chat/conversations', () => {
  it('requires authentication', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await app.inject({ method: 'GET', url: '/chat/conversations' })
    expect(res.statusCode).toBe(401)
    await app.close()
  })

  it('returns empty list when no conversations', async () => {
    const app = await buildApp()
    await app.ready()
    const token = (await app.inject({
      method: 'POST', url: '/auth/register',
      payload: { email: 'chat@test.com', password: 'secret123' },
    })).json().token

    const res = await app.inject({
      method: 'GET', url: '/chat/conversations',
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual([])
    await app.close()
  })
})

describe('DELETE /chat/conversations/:id', () => {
  it('returns 404 for unknown conversation', async () => {
    const token = await getToken()
    const app = await buildApp()
    await app.ready()
    const res = await app.inject({
      method: 'DELETE', url: '/chat/conversations/00000000-0000-0000-0000-000000000000',
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(404)
    await app.close()
  })
})
