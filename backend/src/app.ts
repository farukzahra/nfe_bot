import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { prismaPlugin } from './plugins/prisma.js'
import { authPlugin } from './plugins/auth.js'
import { authRoutes } from './routes/auth.js'
import { healthRoutes } from './routes/health.js'
import { aboutRoutes } from './routes/about.js'

export async function buildApp(options: { logger?: boolean } = {}) {
  const app = Fastify({
    logger: options.logger ?? false,
  })

  await app.register(helmet)
  await app.register(cors, {
    origin: true,
    credentials: true,
  })
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })
  await app.register(prismaPlugin)
  await app.register(authPlugin)

  await app.register(healthRoutes)
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(aboutRoutes, { prefix: '/about' })

  return app
}
