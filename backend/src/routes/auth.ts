import type { FastifyPluginAsync } from 'fastify'
import { AuthService } from '../services/auth.service.js'
import { loginSchema, registerSchema } from '../schemas/auth.schema.js'

export const authRoutes: FastifyPluginAsync = async (app) => {
  const authService = new AuthService(app.prisma)

  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() })
    }

    try {
      const user = await authService.register(parsed.data)
      const token = app.jwt.sign({ sub: user.id, email: user.email })

      return reply.status(201).send({ user, token })
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
        return reply.status(409).send({ error: 'Email already registered' })
      }

      throw error
    }
  })

  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() })
    }

    try {
      const user = await authService.login(parsed.data)
      const token = app.jwt.sign({ sub: user.id, email: user.email })

      return reply.send({ user, token })
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        return reply.status(401).send({ error: 'Invalid email or password' })
      }

      throw error
    }
  })

  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      const user = await authService.getMe(request.user.sub)
      return reply.send({ user })
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return reply.status(404).send({ error: 'User not found' })
      }

      throw error
    }
  })
}
