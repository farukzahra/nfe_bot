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

const typeColors: Record<string, string> = {
  feat: 'success',
  fix: 'error',
  chore: 'secondary',
  docs: 'info',
  refactor: 'warning',
  test: 'purple',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }
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
    if (name === 'about') loadCommits()
  },
  { immediate: true },
)
</script>

<template>
  <PageCard
    title="Sobre"
    subtitle="Histórico de commits — docs/commit-history.json"
  >
    <template #actions>
      <div class="d-flex align-center ga-3">
        <span v-if="lastUpdated" class="text-caption text-medium-emphasis">
          Atualizado às {{ lastUpdated.toLocaleTimeString('pt-BR') }}
        </span>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-refresh"
          size="small"
          :loading="loading"
          data-testid="about-refresh"
          @click="loadCommits"
        >
          Atualizar
        </v-btn>
      </div>
    </template>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      data-testid="about-error"
    >
      {{ error }}
    </v-alert>

    <div v-if="loading && !commits.length" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="commits.length" class="changelog-table-wrap" data-testid="commit-history-table">
      <v-table density="comfortable" class="changelog-table">
        <thead>
          <tr>
            <th class="col-date">Data / Hora</th>
            <th class="col-hash">Hash</th>
            <th class="col-type">Tipo</th>
            <th class="col-scope">Scope</th>
            <th class="col-message">Mensagem</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="commit in commits"
            :key="commit.hash"
            class="changelog-row"
          >
            <td class="col-date">
              <div class="text-caption font-weight-medium">{{ formatDate(commit.date).date }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatDate(commit.date).time }}</div>
            </td>
            <td class="col-hash">
              <code class="hash-code">{{ commit.hash }}</code>
            </td>
            <td class="col-type">
              <v-chip
                :color="typeColors[commit.type] ?? 'default'"
                size="x-small"
                variant="tonal"
                label
              >
                {{ commit.type }}
              </v-chip>
            </td>
            <td class="col-scope">
              <span class="text-caption text-medium-emphasis scope-text">{{ commit.scope }}</span>
            </td>
            <td class="col-message">
              <span class="text-body-2">{{ commit.message }}</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <div v-else class="text-center py-8 text-medium-emphasis">
      Nenhum commit encontrado.
    </div>
  </PageCard>
</template>

<style scoped>
.changelog-table-wrap {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.changelog-table {
  background: transparent;
}

.changelog-table thead th {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.changelog-row:not(:last-child) td {
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.5));
}

.changelog-row:hover td {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.col-hash  { width: 90px; white-space: nowrap; }
.col-type  { width: 80px; }
.col-scope { width: 100px; white-space: nowrap; }
.col-date  { width: 120px; white-space: nowrap; }
.col-message { min-width: 200px; }

.hash-code {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  opacity: 0.85;
  background: rgba(var(--v-theme-on-surface), 0.06);
  padding: 2px 6px;
  border-radius: 4px;
}

.scope-text {
  font-family: 'Roboto Mono', monospace;
}
</style>
