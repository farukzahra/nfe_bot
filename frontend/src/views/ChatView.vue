<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { marked } from 'marked'
import { api, type Conversation } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || '/api'

interface Msg { id: string; role: 'user' | 'assistant'; content: string }

// ─── Conversations sidebar ──────────────────────────────────────────────────
const conversations = ref<Conversation[]>([])
const activeConvId = ref<string | null>(null)
const loadingConvs = ref(false)
const deleting = ref<string | null>(null)

async function loadConversations() {
  loadingConvs.value = true
  try { conversations.value = await api.listConversations() } catch { conversations.value = [] }
  finally { loadingConvs.value = false }
}

loadConversations()

async function deleteConv(id: string, e: Event) {
  e.stopPropagation()
  deleting.value = id
  try {
    await api.deleteConversation(id)
    if (activeConvId.value === id) newConversation()
    await loadConversations()
  } finally { deleting.value = null }
}

// ─── Chat state ─────────────────────────────────────────────────────────────
const messages = ref<Msg[]>([])
const input = ref('')
const isLoading = ref(false)
const messagesEnd = ref<HTMLElement | null>(null)
const currentConvId = ref<string | undefined>(undefined)

function scrollToBottom() {
  nextTick(() => messagesEnd.value?.scrollIntoView({ behavior: 'smooth' }))
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || isLoading.value) return

  input.value = ''
  isLoading.value = true

  const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: text }
  messages.value.push(userMsg)
  scrollToBottom()

  const assistantMsg: Msg = { id: crypto.randomUUID(), role: 'assistant', content: '' }
  messages.value.push(assistantMsg)
  const idx = messages.value.length - 1

  try {
    const resp = await fetch(`${API_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        messages: messages.value.slice(0, idx).map((m) => ({ role: m.role, content: m.content })),
        conversationId: currentConvId.value,
      }),
    })

    const newId = resp.headers.get('X-Conversation-Id')
    if (newId && !currentConvId.value) {
      currentConvId.value = newId
      activeConvId.value = newId
    }

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (line.startsWith('0:')) {
          try {
            const txt: string = JSON.parse(line.slice(2))
            messages.value[idx].content += txt
            scrollToBottom()
          } catch { /* skip malformed */ }
        }
      }
    }

    await loadConversations()
  } catch (err) {
    messages.value[idx].content = `Erro ao conectar com o assistente. Verifique a API key e tente novamente.`
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

async function selectConversation(conv: Conversation) {
  if (activeConvId.value === conv.id) return
  activeConvId.value = conv.id
  currentConvId.value = conv.id

  const history = await api.getConversationMessages(conv.id)
  messages.value = history.map((m) => ({ id: m.id, role: m.role, content: m.content }))
  scrollToBottom()
}

function newConversation() {
  activeConvId.value = null
  currentConvId.value = undefined
  messages.value = []
}

// ─── Markdown ───────────────────────────────────────────────────────────────
marked.setOptions({ breaks: true })
function renderMarkdown(text: string): string {
  return marked.parse(text) as string
}

// ─── Suggestions ────────────────────────────────────────────────────────────
const suggestions = [
  'Quanto vendi este mês?',
  'Quais são meus 5 maiores clientes?',
  'Qual produto eu mais vendi?',
  'Quanto gastei em compras em junho?',
  'Qual meu principal fornecedor?',
  'Quantas notas já importei?',
]

function useSuggestion(s: string) {
  input.value = s
}
</script>

<template>
  <div class="chat-layout">
    <!-- ─── Sidebar ─────────────────────────────────────────────────── -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <span class="text-caption text-medium-emphasis font-weight-bold text-uppercase">Conversas</span>
        <v-btn icon="mdi-plus" size="x-small" variant="text" color="primary" title="Nova conversa" @click="newConversation" />
      </div>

      <div v-if="loadingConvs" class="d-flex justify-center py-4">
        <v-progress-circular indeterminate size="18" color="primary" />
      </div>
      <div v-else-if="!conversations.length" class="text-caption text-medium-emphasis px-3 py-2">
        Nenhuma conversa ainda
      </div>

      <div
        v-for="conv in conversations"
        v-else
        :key="conv.id"
        class="conv-item"
        :class="{ active: conv.id === activeConvId }"
        @click="selectConversation(conv)"
      >
        <v-icon size="14" class="mr-2 flex-shrink-0 text-medium-emphasis">mdi-chat-outline</v-icon>
        <span class="conv-title">{{ conv.title || 'Sem título' }}</span>
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          class="conv-delete"
          :loading="deleting === conv.id"
          @click="deleteConv(conv.id, $event)"
        />
      </div>
    </div>

    <!-- ─── Main ──────────────────────────────────────────────────────── -->
    <div class="chat-main">
      <!-- Empty state -->
      <div v-if="!messages.length" class="chat-empty">
        <v-icon size="48" color="primary" class="mb-3">mdi-robot-happy-outline</v-icon>
        <div class="text-h6 mb-1">Assistente Fiscal</div>
        <div class="text-body-2 text-medium-emphasis mb-6">Pergunte sobre seus dados fiscais em linguagem natural</div>
        <div class="suggestions-grid">
          <v-btn
            v-for="s in suggestions"
            :key="s"
            variant="outlined"
            size="small"
            class="suggestion-btn"
            @click="useSuggestion(s)"
          >{{ s }}</v-btn>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="messages-container">
        <div v-for="msg in messages" :key="msg.id" class="message-row" :class="msg.role">
          <div v-if="msg.role === 'assistant'" class="message-avatar">
            <v-icon size="18" color="primary">mdi-robot-outline</v-icon>
          </div>
          <div class="message-bubble" :class="msg.role">
            <!-- eslint-disable vue/no-v-html -->
            <div v-if="msg.role === 'assistant'" class="markdown-body" v-html="renderMarkdown(msg.content || '…')" />
            <span v-else>{{ msg.content }}</span>
          </div>
          <div v-if="msg.role === 'user'" class="message-avatar user-avatar">
            <v-icon size="16" color="white">mdi-account</v-icon>
          </div>
        </div>

        <!-- Typing dots while waiting first chunk -->
        <div v-if="isLoading && messages[messages.length - 1]?.content === ''" class="message-row assistant">
          <div class="message-avatar"><v-icon size="18" color="primary">mdi-robot-outline</v-icon></div>
          <div class="message-bubble assistant typing-bubble">
            <span class="dot" /><span class="dot" /><span class="dot" />
          </div>
        </div>

        <div ref="messagesEnd" />
      </div>

      <!-- Input area -->
      <div class="chat-input-area">
        <form class="d-flex ga-2 align-end" @submit.prevent="sendMessage">
          <v-textarea
            v-model="input"
            placeholder="Pergunte sobre vendas, compras, produtos…"
            variant="outlined"
            density="compact"
            rows="1"
            auto-grow
            max-rows="4"
            hide-details
            :disabled="isLoading"
            class="flex-grow-1"
            data-testid="chat-input"
            @keydown.enter.exact.prevent="sendMessage"
          />
          <v-btn
            type="submit"
            icon="mdi-send"
            color="primary"
            variant="flat"
            size="default"
            :loading="isLoading"
            :disabled="!input.trim()"
            data-testid="chat-send"
          />
        </form>
        <div class="text-caption text-medium-emphasis mt-1 px-1">Enter para enviar · Shift+Enter para nova linha</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  height: calc(100vh - 80px);
  overflow: hidden;
}

.chat-sidebar {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: rgba(var(--v-theme-surface), 1);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.5));
}

.conv-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
  min-height: 38px;
}
.conv-item:hover { background: rgba(var(--v-theme-on-surface), 0.05); }
.conv-item.active { background: rgba(var(--v-theme-primary), 0.12); }
.conv-item.active .conv-title { color: rgb(var(--v-theme-primary)); }

.conv-title {
  flex: 1;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-delete { opacity: 0; margin-left: 4px; }
.conv-item:hover .conv-delete { opacity: 1; }

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 560px;
}

.suggestion-btn {
  text-transform: none;
  font-size: 0.8rem;
  letter-spacing: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.message-row.user { flex-direction: row-reverse; }

.message-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(var(--v-theme-primary), 0.12);
  margin-top: 2px;
}
.user-avatar { background: rgb(var(--v-theme-primary)); }

.message-bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.88rem;
  line-height: 1.55;
}
.message-bubble.user {
  background: rgb(var(--v-theme-primary));
  color: white;
  border-bottom-right-radius: 4px;
}
.message-bubble.assistant {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-bottom-left-radius: 4px;
}

:deep(.markdown-body) { line-height: 1.6; }
:deep(.markdown-body p) { margin: 0 0 8px; }
:deep(.markdown-body p:last-child) { margin-bottom: 0; }
:deep(.markdown-body ul), :deep(.markdown-body ol) { padding-left: 20px; margin: 6px 0; }
:deep(.markdown-body li) { margin-bottom: 3px; }
:deep(.markdown-body strong) { font-weight: 600; }
:deep(.markdown-body table) { border-collapse: collapse; width: 100%; font-size: 0.83rem; margin: 8px 0; }
:deep(.markdown-body th), :deep(.markdown-body td) { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); padding: 5px 10px; text-align: left; }
:deep(.markdown-body th) { background: rgba(var(--v-theme-on-surface), 0.06); font-weight: 600; }
:deep(.markdown-body code) { background: rgba(var(--v-theme-on-surface), 0.08); padding: 1px 5px; border-radius: 3px; font-size: 0.82rem; font-family: 'Roboto Mono', monospace; }

.typing-bubble { display: flex; gap: 5px; align-items: center; padding: 12px 16px; }
.dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.4);
  animation: bounce 1.2s infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-5px); }
}

.chat-input-area {
  padding: 12px 24px 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-background));
}
</style>
