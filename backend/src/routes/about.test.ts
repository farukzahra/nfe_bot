import { describe, expect, it, vi, beforeEach } from 'vitest'
import { readFile } from 'node:fs/promises'
import { buildApp } from '../app.js'

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('@prisma/client', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'about@test.com',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvuPfakeHashForTestingPurposes1234567',
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
    })),
  }
})

const sampleHistory = [
  {
    hash: 'abc1234',
    type: 'feat',
    scope: 'auth',
    message: 'feat(auth): add login',
    date: '2026-06-27T22:30:00.000Z',
    files: ['backend/src/routes/auth.ts'],
  },
]

describe('GET /about/commit-history', () => {
  beforeEach(() => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleHistory))
  })

  it('requires authentication', async () => {
    const app = await buildApp()
    await app.ready()

    const response = await app.inject({
      method: 'GET',
      url: '/about/commit-history',
    })

    expect(response.statusCode).toBe(401)
    await app.close()
  })

  it('returns commit history sorted by date for authenticated user', async () => {
    const app = await buildApp()
    await app.ready()

    const register = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'about@test.com', password: 'secret123' },
    })

    const { token } = register.json()
    expect(token).toBeDefined()

    const response = await app.inject({
      method: 'GET',
      url: '/about/commit-history',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.commits).toHaveLength(1)
    expect(body.commits[0].hash).toBe('abc1234')
    expect(body.commits[0].date).toBe('2026-06-27T22:30:00.000Z')
    await app.close()
  })
})
