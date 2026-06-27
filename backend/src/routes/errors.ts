import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { ErrorsService } from '../services/errors.service.js'

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const errorsRoutes: FastifyPluginAsync = async (app) => {
  const svc = new ErrorsService(app.prisma)

  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const q = listQuerySchema.safeParse(request.query)
    if (!q.success) return reply.status(400).send({ error: 'Invalid query' })

    const result = await svc.list(request.user.sub, q.data.page, q.data.limit)
    return reply.send(result)
  })

  app.get('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      return reply.send(await svc.get(request.user.sub, id))
    } catch {
      return reply.status(404).send({ error: 'Error record not found' })
    }
  })

  app.post('/:id/reprocess', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const result = await svc.reprocess(request.user.sub, id)
      return reply.send(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reprocess failed'
      return reply.status(400).send({ error: msg })
    }
  })
}
