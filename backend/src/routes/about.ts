import type { FastifyPluginAsync } from 'fastify'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const commitEntrySchema = z.object({
  hash: z.string(),
  type: z.string(),
  scope: z.string(),
  message: z.string(),
  date: z.string().datetime(),
  files: z.array(z.string()),
})

const commitHistorySchema = z.array(commitEntrySchema)

const commitHistoryPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../docs/commit-history.json',
)

export const aboutRoutes: FastifyPluginAsync = async (app) => {
  app.get('/commit-history', { preHandler: [app.authenticate] }, async (_request, reply) => {
    try {
      const raw = await readFile(commitHistoryPath, 'utf-8')
      const parsed = commitHistorySchema.parse(JSON.parse(raw))

      const sorted = [...parsed].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )

      reply.header('Cache-Control', 'no-store')
      return reply.send({ commits: sorted })
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ error: 'Failed to load commit history' })
    }
  })
}
