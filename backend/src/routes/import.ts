import type { FastifyPluginAsync } from 'fastify'
import { ImportService } from '../services/import.service.js'

export const importRoutes: FastifyPluginAsync = async (app) => {
  const importSvc = new ImportService(app.prisma)

  app.post('/xml', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ error: 'No file provided' })
    }

    const fileName = data.filename
    if (!fileName.toLowerCase().endsWith('.xml')) {
      await data.toBuffer()
      return reply.status(400).send({ error: 'File must have .xml extension' })
    }

    const buffer = await data.toBuffer()
    const xmlContent = buffer.toString('utf-8')

    const result = await importSvc.importXml(request.user.sub, fileName, xmlContent)
    return reply.status(201).send(result)
  })

  app.post('/zip', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ error: 'No file provided' })
    }

    const fileName = data.filename
    if (!fileName.toLowerCase().endsWith('.zip')) {
      await data.toBuffer()
      return reply.status(400).send({ error: 'File must have .zip extension' })
    }

    const buffer = await data.toBuffer()
    const result = await importSvc.importZip(request.user.sub, fileName, buffer)
    return reply.status(201).send(result)
  })
}
