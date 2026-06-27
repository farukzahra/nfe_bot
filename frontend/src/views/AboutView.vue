<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageCard from '@/components/PageCard.vue'
import { api, type CommitEntry } from '@/api/client'

const route = useRoute()
const commits = ref<CommitEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastUpdated = ref<Date | null>(null)

const headers = [
  { title: 'Hash', key: 'hash', width: '90px' },
  { title: 'Tipo', key: 'type', width: '90px' },
  { title: 'Scope', key: 'scope', width: '110px' },
  { title: 'Mensagem', key: 'message' },
  { title: 'Data', key: 'date', width: '170px' },
  { title: 'Arquivos', key: 'files', sortable: false },
]

const typeColors: Record<string, string> = {
  feat: 'success',
  fix: 'error',
  chore: 'grey',
  docs: 'info',
  refactor: 'warning',
  test: 'purple',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return `${date} ${time}`
}

async function loadCommits() {
  loading.value = true
  error.value = null

  try {
    const { commits: data } = await api.commitHistory()
    commits.value = data
    lastUpdated.value = new Date()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar histórico'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.name,
  (name) => {
    if (name === 'about') {
      loadCommits()
    }
  },
  { immediate: true },
)
</script>

<template>
  <PageCard
    title="Sobre"
    subtitle="Histórico de commits — lido dinamicamente de docs/commit-history.json"
  >
    <template #actions>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="loading"
        data-testid="about-refresh"
        @click="loadCommits"
      >
        Atualizar
      </v-btn>
    </template>

    <v-alert type="info" variant="tonal" class="mb-4">
      Os dados vêm do arquivo <code>docs/commit-history.json</code> via API.
      Sempre que o JSON for atualizado, basta abrir esta tela ou clicar em Atualizar.
      <span v-if="lastUpdated" class="d-block mt-2 text-caption">
        Última leitura: {{ lastUpdated.toLocaleString('pt-BR') }}
      </span>
    </v-alert>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      data-testid="about-error"
    >
      {{ error }}
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="commits"
      :loading="loading"
      item-key="hash"
      class="commit-table"
      data-testid="commit-history-table"
    >
      <template #item.hash="{ item }">
        <code>{{ item.hash }}</code>
      </template>

      <template #item.type="{ item }">
        <v-chip
          size="small"
          :color="typeColors[item.type] ?? 'default'"
          variant="tonal"
        >
          {{ item.type }}
        </v-chip>
      </template>

      <template #item.date="{ item }">
        <div class="text-caption">
          <div>{{ formatDate(item.date).split(' ')[0] }}</div>
          <div class="text-medium-emphasis">{{ formatDate(item.date).split(' ')[1] }}</div>
        </div>
      </template>

      <template #item.message="{ item }">
        <span class="text-body-2">{{ item.message }}</span>
      </template>

      <template #item.files="{ item }">
        <div class="d-flex flex-wrap ga-1 py-1">
          <v-chip
            v-for="file in item.files"
            :key="file"
            size="x-small"
            variant="outlined"
            class="file-chip"
          >
            {{ file }}
          </v-chip>
        </div>
      </template>
    </v-data-table>
  </PageCard>
</template>

<style scoped>
.commit-table code {
  font-family: monospace;
  font-size: 0.8125rem;
}

.file-chip {
  font-family: monospace;
  font-size: 0.6875rem;
}

code {
  font-family: monospace;
  font-size: 0.875rem;
}
</style>
