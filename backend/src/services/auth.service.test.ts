import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthService } from './auth.service.js'
import type { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
} as unknown as PrismaClient

describe('AuthService', () => {
  const authService = new AuthService(mockPrisma)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('creates user with hashed password', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const user = await authService.register({
        email: 'User@Example.com',
        password: 'secret123',
      })

      expect(user.email).toBe('user@example.com')
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'user@example.com',
            passwordHash: expect.any(String),
          }),
        }),
      )
    })

    it('throws when email already exists', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'existing',
        email: 'user@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(
        authService.register({ email: 'user@example.com', password: 'secret123' }),
      ).rejects.toThrow('EMAIL_ALREADY_EXISTS')
    })
  })

  describe('login', () => {
    it('returns user when credentials are valid', async () => {
      const passwordHash = await bcrypt.hash('secret123', 10)

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const user = await authService.login({
        email: 'user@example.com',
        password: 'secret123',
      })

      expect(user.id).toBe('user-1')
    })

    it('throws when user not found', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null)

      await expect(
        authService.login({ email: 'user@example.com', password: 'secret123' }),
      ).rejects.toThrow('INVALID_CREDENTIALS')
    })

    it('throws when password is wrong', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('other', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await expect(
        authService.login({ email: 'user@example.com', password: 'secret123' }),
      ).rejects.toThrow('INVALID_CREDENTIALS')
    })
  })

  describe('getMe', () => {
    it('returns user by id', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        createdAt: new Date(),
      })

      const user = await authService.getMe('user-1')

      expect(user.email).toBe('user@example.com')
    })

    it('throws when user not found', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null)

      await expect(authService.getMe('missing')).rejects.toThrow('USER_NOT_FOUND')
    })
  })
})
