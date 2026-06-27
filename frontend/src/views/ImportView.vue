<script setup lang="ts">
import { ref } from 'vue'
import PageCard from '@/components/PageCard.vue'
import { api, type ImportBatchResult } from '@/api/client'

const files = ref<File[]>([])
const loading = ref(false)
const result = ref<ImportBatchResult | null>(null)
const error = ref<string | null>(null)
const dragOver = ref(false)

const ACCEPT = '.xml,.zip'

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}
function onDragLeave() {
  dragOver.value = false
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const dropped = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
    f.name.match(/\.(xml|zip)$/i),
  )
  if (dropped.length) files.value = dropped
}

function onFileChange(newFiles: File[]) {
  files.value = newFiles ?? []
}

function reset() {
  files.value = []
  result.value = null
  error.value = null
}

async function upload() {
  if (!files.value.length) return

  // Validação client-side de extensão
  const invalid = files.value.filter((f) => !f.name.match(/\.(xml|zip)$/i))
  if (invalid.length) {
    error.value = `Arquivo(s) inválido(s): ${invalid.map((f) => f.name).join(', ')}. Apenas .xml e .zip são aceitos.`
    return
  }

  loading.value = true
  result.value = null
  error.value = null

  try {
    // Upload sequencial para manter resultado por arquivo
    const combined: ImportBatchResult = {
      batchId: '',
      totalFiles: 0,
      successCount: 0,
      errorCount: 0,
      results: [],
    }

    for (const file of files.value) {
      const res = await api.importFile(file)
      combined.batchId = res.batchId
      combined.totalFiles += res.totalFiles
      combined.successCount += res.successCount
      combined.errorCount += res.errorCount
      combined.results.push(...res.results)
    }

    result.value = combined
    files.value = []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao importar'
  } finally {
    loading.value = false
  }
}

const resultHeaders = [
  { title: 'Arquivo', key: 'fileName' },
  { title: 'Status', key: 'success', width: '100px' },
  { title: 'Detalhe', key: 'error' },
]
</script>

<template>
  <PageCard title="Importar NF-e / NFC-e" subtitle="Importe arquivos XML ou ZIP com XMLs fiscais">
    <!-- Drop zone -->
    <div
      class="drop-zone rounded-lg mb-5"
      :class="{ 'drop-zone--active': dragOver }"
      data-testid="drop-zone"
      @dragover.prevent="onDragEnter"
      @dragenter.prevent="onDragEnter"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <v-icon size="48" color="primary" class="mb-3">mdi-cloud-upload-outline</v-icon>
      <div class="text-h6 mb-1">Arraste seus arquivos aqui</div>
      <div class="text-body-2 text-medium-emphasis mb-4">ou use o botão abaixo</div>

      <v-file-input
        v-model="files"
        :accept="ACCEPT"
        label="Selecionar XML ou ZIP"
        prepend-icon=""
        prepend-inner-icon="mdi-file-xml-box"
        variant="outlined"
        density="comfortable"
        multiple
        hide-details
        class="drop-zone__input"
        data-testid="file-input"
        @update:model-value="onFileChange"
      />
    </div>

    <!-- Selected files chips -->
    <div v-if="files.length" class="mb-4 d-flex flex-wrap ga-2">
      <v-chip
        v-for="f in files"
        :key="f.name"
        closable
        prepend-icon="mdi-file-xml-box"
        @click:close="files = files.filter((x) => x.name !== f.name)"
      >
        {{ f.name }}
      </v-chip>
    </div>

    <!-- Actions -->
    <div class="d-flex ga-3 mb-6">
      <v-btn
        color="primary"
        prepend-icon="mdi-upload"
        :loading="loading"
        :disabled="!files.length"
        data-testid="upload-btn"
        @click="upload"
      >
        Importar
      </v-btn>
      <v-btn variant="text" :disabled="loading" @click="reset">Limpar</v-btn>
    </div>

    <!-- Error banner -->
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable data-testid="import-error" @click:close="error = null">
      {{ error }}
    </v-alert>

    <!-- Result summary -->
    <template v-if="result">
      <div class="d-flex ga-4 mb-4 flex-wrap">
        <v-card variant="tonal" color="primary" class="pa-4 flex-grow-1 text-center">
          <div class="text-h4 font-weight-bold">{{ result.totalFiles }}</div>
          <div class="text-caption text-medium-emphasis">Total</div>
        </v-card>
        <v-card variant="tonal" color="success" class="pa-4 flex-grow-1 text-center" data-testid="success-count">
          <div class="text-h4 font-weight-bold">{{ result.successCount }}</div>
          <div class="text-caption text-medium-emphasis">Importados</div>
        </v-card>
        <v-card variant="tonal" color="error" class="pa-4 flex-grow-1 text-center">
          <div class="text-h4 font-weight-bold">{{ result.errorCount }}</div>
          <div class="text-caption text-medium-emphasis">Erros</div>
        </v-card>
      </div>

      <v-data-table
        :headers="resultHeaders"
        :items="result.results"
        item-key="fileName"
        density="comfortable"
        data-testid="result-table"
      >
        <template #item.fileName="{ item }">
          <code class="text-caption">{{ item.fileName }}</code>
        </template>

        <template #item.success="{ item }">
          <v-chip
            :color="item.success ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.success ? 'OK' : 'Erro' }}
          </v-chip>
        </template>

        <template #item.error="{ item }">
          <span v-if="item.error" class="text-caption text-error">{{ item.error }}</span>
          <span v-else class="text-caption text-medium-emphasis">—</span>
        </template>
      </v-data-table>
    </template>
  </PageCard>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  padding: 2rem;
  text-align: center;
  transition: border-color 0.2s, background-color 0.2s;
  cursor: pointer;
}

.drop-zone--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.drop-zone__input {
  max-width: 360px;
  margin: 0 auto;
}

code {
  font-family: monospace;
}
</style>
