import type { PrismaClient } from '@prisma/client'

export class ChatService {
  constructor(private prisma: PrismaClient) {}

  async listConversations(userId: string) {
    return this.prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    })
  }

  async getOrCreateConversation(userId: string, conversationId?: string, firstMessage?: string) {
    if (conversationId) {
      const conv = await this.prisma.chatConversation.findFirst({ where: { id: conversationId, userId } })
      if (!conv) throw new Error('CONVERSATION_NOT_FOUND')
      return conv
    }

    const title = firstMessage ? firstMessage.slice(0, 60) : 'Nova conversa'
    return this.prisma.chatConversation.create({
      data: { userId, title },
    })
  }

  async getMessages(userId: string, conversationId: string) {
    const conv = await this.prisma.chatConversation.findFirst({ where: { id: conversationId, userId } })
    if (!conv) throw new Error('CONVERSATION_NOT_FOUND')
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async saveMessages(conversationId: string, userContent: string, assistantContent: string) {
    await this.prisma.chatMessage.createMany({
      data: [
        { conversationId, role: 'user', content: userContent },
        { conversationId, role: 'assistant', content: assistantContent },
      ],
    })
    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conv = await this.prisma.chatConversation.findFirst({ where: { id: conversationId, userId } })
    if (!conv) throw new Error('CONVERSATION_NOT_FOUND')
    await this.prisma.chatConversation.delete({ where: { id: conversationId } })
  }
}
