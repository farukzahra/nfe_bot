<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageCard from '@/components/PageCard.vue'
import {
  api,
  type FiscalDocumentSummary,
  type FiscalParty,
  type DocumentDirection,
} from '@/api/client'

const router = useRouter()

// ─── State ─────────────────────────────────────────────────────────────────
const tab = ref<'todos' | 'entrada' | 'saida'>('todos')
const search = ref('')
const filterStatus = ref<string | undefined>()
const filterDateFrom = ref('')
const filterDateTo = ref('')
const page = ref(1)
const total = ref(0)
const pages = ref(1)
const loading = ref(false)
const documents = ref<FiscalDocumentSummary[]>([])

const drawer = ref(false)
const selectedDoc = ref<FiscalDocumentSummary | null>(null)
const deleting = ref(false)
const directionDialog = ref(false)
const newDirection = ref<DocumentDirection>('entrada')

// ─── Computed ──────────────────────────────────────────────────────────────
const direction = computed(() => (tab.value === 'todos' ? undefined : tab.value))

const directionLabel: Record<string, string> = { entrada: 'Entrada', saida: 'Saída' }
const statusColor: Record<string, string> = {
  autorizada: 'success',
  cancelada: 'error',
  denegada: 'warning',
  inutilizada: 'grey',
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function issuer(doc: FiscalDocumentSummary): FiscalParty | undefined {
  return doc.parties.find((p) => p.partyType === 'issuer')
}
function recipient(doc: FiscalDocumentSummary): FiscalParty | undefined {
  return doc.parties.find((p) => p.partyType === 'recipient')
}
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}
function formatMoney(v: number | null): string {
  if (v === null || v === undefined) return '—'
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Load ──────────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const res = await api.listDocuments({
      direction: direction.value,
      status: filterStatus.value,
      search: search.value || undefined,
      dateFrom: filterDateFrom.value || undefined,
      dateTo: filterDateTo.value || undefined,
      page: page.value,
      limit: 15,
    })
    documents.value = res.documents
    total.value = res.total
    pages.value = res.pages
  } catch {
    documents.value = []
  } finally {
    loading.value = false
  }
}

function resetAndLoad() {
  page.value = 1
  load()
}

watch([tab, filterStatus], resetAndLoad, { immediate: true })

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(resetAndLoad, 400)
})
watch([filterDateFrom, filterDateTo], resetAndLoad)
watch(page, load)

// ─── Drawer actions ────────────────────────────────────────────────────────
function openDrawer(doc: FiscalDocumentSummary) {
  selectedDoc.value = doc
  drawer.value = true
}

function viewDetail() {
  if (selectedDoc.value) router.push(`/documents/${selectedDoc.value.id}`)
}

function openDirectionDialog() {
  newDirection.value = selectedDoc.value?.direction ?? 'entrada'
  directionDialog.value = true
}

async function confirmDirection() {
  if (!selectedDoc.value) return
  await api.updateDirection(selectedDoc.value.id, newDirection.value)
  directionDialog.value = false
  drawer.value = false
  load()
}

async function deleteDocument() {
  if (!selectedDoc.value) return
  deleting.value = true
  try {
    await api.deleteDocument(selectedDoc.value.id)
    drawer.value = false
    load()
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <PageCard title="Documentos Fiscais" subtitle="Entradas, saídas e histórico de importações">
    <!-- Tabs -->
    <v-tabs v-model="tab" class="mb-4" density="compact" color="primary">
      <v-tab value="todos">Todos</v-tab>
      <v-tab value="entrada">Entradas</v-tab>
      <v-tab value="saida">Saídas</v-tab>
    </v-tabs>

    <!-- Filters -->
    <div class="d-flex ga-3 mb-4 flex-wrap align-center">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Buscar emitente, CNPJ, chave…"
        density="compact"
        variant="outlined"
        clearable
        hide-details
        style="max-width: 340px;"
        data-testid="search-input"
      />
      <v-select
        v-model="filterStatus"
        :items="[
          { title: 'Todos os status', value: undefined },
          { title: 'Autorizada', value: 'autorizada' },
          { title: 'Cancelada', value: 'cancelada' },
          { title: 'Denegada', value: 'denegada' },
        ]"
        label="Status"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        style="max-width: 180px;"
      />
      <v-text-field
        v-model="filterDateFrom"
        label="Data início"
        type="date"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 160px;"
      />
      <v-text-field
        v-model="filterDateTo"
        label="Data fim"
        type="date"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 160px;"
      />
      <v-btn icon="mdi-refresh" variant="text" size="small" :loading="loading" @click="load" />
    </div>

    <!-- Table -->
    <div class="doc-table-wrap">
      <v-table density="comfortable" hover data-testid="documents-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Emitente</th>
            <th>Destinatário</th>
            <th>Nº</th>
            <th class="text-right">Valor Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-6">
              <v-progress-circular indeterminate size="24" color="primary" />
            </td>
          </tr>
          <tr v-else-if="!documents.length">
            <td colspan="7" class="text-center py-8 text-medium-emphasis">
              Nenhum documento encontrado.
              <router-link to="/import" class="text-primary">Importar agora</router-link>
            </td>
          </tr>
          <tr
            v-for="doc in documents"
            v-else
            :key="doc.id"
            class="doc-row"
            style="cursor: pointer"
            data-testid="doc-row"
            @click="openDrawer(doc)"
          >
            <td class="text-caption">{{ formatDate(doc.issueDate) }}</td>
            <td>
              <v-chip
                :color="doc.direction === 'entrada' ? 'info' : 'success'"
                size="x-small"
                variant="tonal"
                label
              >
                {{ directionLabel[doc.direction ?? ''] ?? '—' }}
              </v-chip>
            </td>
            <td>
              <div class="text-body-2 font-weight-medium">{{ issuer(doc)?.legalName ?? '—' }}</div>
              <div class="text-caption text-medium-emphasis">{{ issuer(doc)?.documentNumber ?? '' }}</div>
            </td>
            <td>
              <div class="text-body-2">{{ recipient(doc)?.legalName ?? '—' }}</div>
            </td>
            <td class="text-caption text-medium-emphasis">{{ doc.documentNumber }}</td>
            <td class="text-right font-weight-medium">{{ formatMoney(doc.totalAmount) }}</td>
            <td>
              <v-chip
                :color="statusColor[doc.status ?? ''] ?? 'grey'"
                size="x-small"
                variant="tonal"
              >
                {{ doc.status ?? '—' }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Pagination -->
    <div v-if="pages > 1" class="d-flex justify-center mt-4">
      <v-pagination v-model="page" :length="pages" density="compact" />
    </div>
  </PageCard>

  <!-- ─── Drawer ──────────────────────────────────────────────────────────── -->
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    width="380"
    temporary
    data-testid="doc-drawer"
  >
    <template v-if="selectedDoc">
      <div class="pa-4 border-b">
        <div class="d-flex align-center justify-space-between mb-2">
          <v-chip
            :color="selectedDoc.direction === 'entrada' ? 'info' : 'success'"
            variant="tonal"
            size="small"
            label
          >
            {{ directionLabel[selectedDoc.direction ?? ''] ?? 'Sem direção' }}
          </v-chip>
          <v-chip
            :color="statusColor[selectedDoc.status ?? ''] ?? 'grey'"
            variant="tonal"
            size="small"
          >
            {{ selectedDoc.status ?? '—' }}
          </v-chip>
          <v-btn icon="mdi-close" variant="text" size="small" @click="drawer = false" />
        </div>
        <div class="text-caption text-medium-emphasis font-weight-mono">
          {{ selectedDoc.accessKey ?? 'Sem chave de acesso' }}
        </div>
      </div>

      <v-list density="compact" class="pa-2">
        <v-list-item>
          <template #prepend><v-icon size="18" class="mr-2">mdi-calendar</v-icon></template>
          <v-list-item-title class="text-caption text-medium-emphasis">Data emissão</v-list-item-title>
          <v-list-item-subtitle>{{ formatDate(selectedDoc.issueDate) }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <template #prepend><v-icon size="18" class="mr-2">mdi-file-document</v-icon></template>
          <v-list-item-title class="text-caption text-medium-emphasis">NF-e</v-list-item-title>
          <v-list-item-subtitle>Nº {{ selectedDoc.documentNumber }} — Série {{ selectedDoc.series }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <template #prepend><v-icon size="18" class="mr-2">mdi-domain</v-icon></template>
          <v-list-item-title class="text-caption text-medium-emphasis">Emitente</v-list-item-title>
          <v-list-item-subtitle>
            {{ issuer(selectedDoc)?.legalName ?? '—' }}<br>
            <span class="text-caption">{{ issuer(selectedDoc)?.documentNumber ?? '' }}</span>
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="recipient(selectedDoc)">
          <template #prepend><v-icon size="18" class="mr-2">mdi-account</v-icon></template>
          <v-list-item-title class="text-caption text-medium-emphasis">Destinatário</v-list-item-title>
          <v-list-item-subtitle>
            {{ recipient(selectedDoc)?.legalName ?? '—' }}<br>
            <span class="text-caption">{{ recipient(selectedDoc)?.documentNumber ?? '' }}</span>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider />

      <div class="pa-4">
        <div class="d-flex justify-space-between text-body-2 mb-1">
          <span class="text-medium-emphasis">Produtos</span>
          <span>{{ formatMoney(selectedDoc.productsAmount) }}</span>
        </div>
        <div class="d-flex justify-space-between text-body-2 mb-1">
          <span class="text-medium-emphasis">Desconto</span>
          <span class="text-error">-{{ formatMoney(selectedDoc.discountAmount) }}</span>
        </div>
        <div class="d-flex justify-space-between text-body-2 mb-1">
          <span class="text-medium-emphasis">Frete</span>
          <span>{{ formatMoney(selectedDoc.freightAmount) }}</span>
        </div>
        <div class="d-flex justify-space-between text-body-2 mb-1">
          <span class="text-medium-emphasis">Impostos</span>
          <span>{{ formatMoney(selectedDoc.taxAmount) }}</span>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex justify-space-between font-weight-bold">
          <span>Total</span>
          <span>{{ formatMoney(selectedDoc.totalAmount) }}</span>
        </div>
      </div>

      <v-divider />

      <div class="pa-4 d-flex flex-column ga-2">
        <v-btn
          block
          prepend-icon="mdi-open-in-new"
          variant="tonal"
          color="primary"
          data-testid="btn-view-detail"
          @click="viewDetail"
        >
          Ver detalhes completos
        </v-btn>
        <v-btn
          block
          prepend-icon="mdi-swap-horizontal"
          variant="tonal"
          @click="openDirectionDialog"
        >
          Alterar entrada/saída
        </v-btn>
        <v-btn
          block
          prepend-icon="mdi-delete-outline"
          variant="tonal"
          color="error"
          :loading="deleting"
          data-testid="btn-delete"
          @click="deleteDocument"
        >
          Excluir
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <!-- Direction dialog -->
  <v-dialog v-model="directionDialog" max-width="360">
    <v-card title="Alterar Direção">
      <v-card-text>
        <v-radio-group v-model="newDirection" inline>
          <v-radio label="Entrada" value="entrada" color="info" />
          <v-radio label="Saída" value="saida" color="success" />
        </v-radio-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="directionDialog = false">Cancelar</v-btn>
        <v-btn color="primary" @click="confirmDirection">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.doc-table-wrap {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}
.doc-row:hover td {
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.font-weight-mono {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.72rem;
  word-break: break-all;
}
</style>
