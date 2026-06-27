import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js'

const SALT_ROUNDS = 10

export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    })

    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    })

    return user
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    })

    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash)

    if (!valid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    return user
  }
}
