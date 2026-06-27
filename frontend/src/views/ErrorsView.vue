<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageCard from '@/components/PageCard.vue'
import { api, type ImportErrorDetail } from '@/api/client'

const errors = ref<ImportErrorDetail[]>([])
const total = ref(0)
const pages = ref(1)
const page = ref(1)
const loading = ref(false)
const reprocessing = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const selectedError = ref<ImportErrorDetail | null>(null)
const modal = ref(false)

async function load() {
  loading.value = true
  successMsg.value = null
  try {
    const res = await api.listErrors(page.value)
    errors.value = res.errors
    total.value = res.total
    pages.value = res.pages
  } catch {
    errors.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openModal(err: ImportErrorDetail) {
  selectedError.value = err
  modal.value = true
}

async function reprocess(err: ImportErrorDetail) {
  reprocessing.value = err.id
  successMsg.value = null
  try {
    const res = await api.reprocessError(err.id)
    if (res.successCount > 0) {
      successMsg.value = `"${err.fileName}" reprocessado com sucesso!`
      modal.value = false
      load()
    }
  } catch {
    // error handled by API
  } finally {
    reprocessing.value = null
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <PageCard
    title="Erros de Importação"
    subtitle="Arquivos que não puderam ser processados"
  >
    <template #actions>
      <v-btn variant="text" prepend-icon="mdi-refresh" size="small" :loading="loading" @click="load">
        Atualizar
      </v-btn>
    </template>

    <v-alert v-if="successMsg" type="success" variant="tonal" class="mb-4" closable @click:close="successMsg = null">
      {{ successMsg }}
    </v-alert>

    <div v-if="loading && !errors.length" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-empty-state
      v-else-if="!errors.length && !loading"
      icon="mdi-check-circle-outline"
      title="Nenhum erro registrado"
      text="Quando uma importação falhar, os detalhes aparecerão aqui."
    />

    <template v-else>
      <div class="table-wrap">
        <v-table density="comfortable" data-testid="errors-table">
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Erro</th>
              <th>Lote (batch)</th>
              <th>Data</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="err in errors"
              :key="err.id"
              class="error-row"
              data-testid="error-row"
            >
              <td>
                <code class="text-caption">{{ err.fileName }}</code>
              </td>
              <td>
                <span class="text-caption text-error">{{ err.errorMessage }}</span>
              </td>
              <td class="text-caption text-medium-emphasis">{{ err.batch?.fileName }}</td>
              <td class="text-caption text-medium-emphasis">{{ formatDate(err.createdAt) }}</td>
              <td class="text-center">
                <div class="d-flex justify-center ga-1">
                  <v-btn
                    size="x-small"
                    variant="text"
                    prepend-icon="mdi-information-outline"
                    @click="openModal(err)"
                  >
                    Detalhes
                  </v-btn>
                  <v-btn
                    v-if="err.rawContent"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    prepend-icon="mdi-refresh"
                    :loading="reprocessing === err.id"
                    @click="reprocess(err)"
                  >
                    Reprocessar
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div v-if="pages > 1" class="d-flex justify-center mt-4">
        <v-pagination v-model="page" :length="pages" density="compact" @update:model-value="load" />
      </div>
    </template>
  </PageCard>

  <!-- Error Detail Modal -->
  <v-dialog v-model="modal" max-width="680" scrollable>
    <v-card v-if="selectedError" :title="`Erro — ${selectedError.fileName}`">
      <v-card-text>
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ selectedError.errorMessage }}
        </v-alert>

        <div class="text-caption text-medium-emphasis mb-1">Conteúdo (primeiros 2000 chars):</div>
        <pre class="raw-pre pa-3 rounded">{{ selectedError.rawContent?.slice(0, 2000) ?? 'Sem conteúdo disponível' }}</pre>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="modal = false">Fechar</v-btn>
        <v-btn
          v-if="selectedError.rawContent"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="reprocessing === selectedError.id"
          @click="reprocess(selectedError)"
        >
          Reprocessar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.table-wrap {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}
.error-row:hover td {
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.raw-pre {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.72rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  background: rgba(var(--v-theme-on-surface), 0.04);
  max-height: 320px;
  overflow-y: auto;
}
</style>
