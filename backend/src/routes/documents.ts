import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { DocumentService } from '../services/document.service.js'

const listQuerySchema = z.object({
  direction: z.enum(['entrada', 'saida']).optional(),
  status: z.enum(['autorizada', 'cancelada', 'denegada', 'inutilizada']).optional(),
  search: z.string().max(100).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

const directionBodySchema = z.object({
  direction: z.enum(['entrada', 'saida']),
})

export const documentRoutes: FastifyPluginAsync = async (app) => {
  const svc = new DocumentService(app.prisma)

  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query)
    if (!query.success) return reply.status(400).send({ error: 'Invalid query parameters' })

    const result = await svc.list(request.user.sub, query.data)
    return reply.send(result)
  })

  app.get('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const doc = await svc.get(request.user.sub, id)
      return reply.send(doc)
    } catch {
      return reply.status(404).send({ error: 'Document not found' })
    }
  })

  app.patch('/:id/direction', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = directionBodySchema.safeParse(request.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid direction' })

    try {
      const doc = await svc.updateDirection(request.user.sub, id, body.data.direction)
      return reply.send(doc)
    } catch {
      return reply.status(404).send({ error: 'Document not found' })
    }
  })

  app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await svc.remove(request.user.sub, id)
      return reply.status(204).send()
    } catch {
      return reply.status(404).send({ error: 'Document not found' })
    }
  })
}
