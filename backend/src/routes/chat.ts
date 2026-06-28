import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { ChatService } from '../services/chat.service.js'
import { createChatTools } from '../services/chat-tools.service.js'

const SYSTEM_PROMPT = `Você é um assistente fiscal especializado em análise de Notas Fiscais Eletrônicas (NF-e e NFC-e) do Brasil.

Você tem acesso às seguintes ferramentas para consultar os dados do usuário:
- getFinancialSummary: resumo financeiro (vendas, compras, saldo)
- getTopProducts: produtos mais vendidos ou comprados
- getTopParties: maiores clientes ou fornecedores
- getDocuments: buscar notas fiscais específicas
- getImportStats: estatísticas de importação

Regras:
1. Sempre responda em português brasileiro
2. Use as ferramentas para buscar dados reais antes de responder sobre números
3. Formate valores monetários como R$ 1.234,56
4. Use markdown para formatar tabelas e listas quando for útil
5. Seja objetivo e direto
6. Se não tiver dados suficientes, diga claramente
7. Nunca invente dados — use apenas o que as ferramentas retornam

Exemplos do que você pode responder:
- "Quanto vendi este mês?"
- "Quais são meus 5 maiores clientes?"
- "Qual produto eu mais vendo?"
- "Quanto gastei em compras em junho?"
- "Qual meu principal fornecedor?"
- "Quantas notas importei?"
`

const sendBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ).min(1),
  conversationId: z.string().uuid().optional(),
})

export const chatRoutes: FastifyPluginAsync = async (app) => {
  const svc = new ChatService(app.prisma)

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '',
  })

  // ─── Streaming send ────────────────────────────────────────────────────────
  app.post('/send', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = sendBodySchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid body' })

    const userId = request.user.sub
    const { messages, conversationId: incomingConvId } = parsed.data
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

    let convId: string
    try {
      const conv = await svc.getOrCreateConversation(userId, incomingConvId, lastUserMessage)
      convId = conv.id
    } catch {
      return reply.status(404).send({ error: 'Conversation not found' })
    }

    const tools = createChatTools(userId, app.prisma)

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      tools,
      maxSteps: 5,
      onFinish: async ({ text }) => {
        if (text) {
          await svc.saveMessages(convId, lastUserMessage, text)
        }
      },
    })

    // Stream manually — compatible with all AI SDK versions
    reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    reply.raw.setHeader('Transfer-Encoding', 'chunked')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('X-Conversation-Id', convId)
    reply.hijack()

    try {
      for await (const chunk of result.textStream) {
        reply.raw.write(`0:${JSON.stringify(chunk)}\n`)
      }
    } catch (err) {
      app.log.error(err, 'chat stream error')
    } finally {
      reply.raw.write('d:{}\n')
      reply.raw.end()
    }
  })

  // ─── Conversations ─────────────────────────────────────────────────────────
  app.get('/conversations', { preHandler: [app.authenticate] }, async (request, reply) => {
    const list = await svc.listConversations(request.user.sub)
    return reply.send(list)
  })

  app.get('/conversations/:id/messages', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const msgs = await svc.getMessages(request.user.sub, id)
      return reply.send(msgs)
    } catch {
      return reply.status(404).send({ error: 'Conversation not found' })
    }
  })

  app.delete('/conversations/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await svc.deleteConversation(request.user.sub, id)
      return reply.status(204).send()
    } catch {
      return reply.status(404).send({ error: 'Conversation not found' })
    }
  })
}
