<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api, type DocumentDetail, type FiscalParty, type DocumentDirection } from '@/api/client'

const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const tab = ref('dados')
const doc = ref<DocumentDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref(false)
const directionDialog = ref(false)
const newDirection = ref<DocumentDirection>('entrada')

async function load() {
  loading.value = true
  error.value = null
  try {
    doc.value = await api.getDocument(id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar documento'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function issuer(): FiscalParty | undefined {
  return doc.value?.parties.find((p) => p.partyType === 'issuer')
}
function recipient(): FiscalParty | undefined {
  return doc.value?.parties.find((p) => p.partyType === 'recipient')
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}
function formatMoney(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function openDirectionDialog() {
  newDirection.value = doc.value?.direction ?? 'entrada'
  directionDialog.value = true
}
async function confirmDirection() {
  if (!doc.value) return
  await api.updateDirection(doc.value.id, newDirection.value)
  directionDialog.value = false
  load()
}

async function deleteDocument() {
  if (!doc.value) return
  deleting.value = true
  try {
    await api.deleteDocument(doc.value.id)
    router.push('/documents')
  } finally {
    deleting.value = false
  }
}

const statusColor: Record<string, string> = {
  autorizada: 'success', cancelada: 'error', denegada: 'warning', inutilizada: 'grey',
}
const directionColor: Record<string, string> = { entrada: 'info', saida: 'success' }
</script>

<template>
  <div class="pa-4 pa-md-6">
    <!-- Header -->
    <div class="d-flex align-center gap-2 mb-4 flex-wrap">
      <v-btn
        prepend-icon="mdi-arrow-left"
        variant="text"
        size="small"
        @click="router.push('/documents')"
      >
        Documentos
      </v-btn>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <template v-if="doc">
      <!-- Page header -->
      <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-4">
        <div>
          <div class="d-flex align-center ga-2 mb-1">
            <v-chip
              :color="directionColor[doc.direction ?? ''] ?? 'grey'"
              variant="tonal"
              size="small"
              label
            >
              {{ doc.direction === 'entrada' ? 'Entrada' : 'Saída' }}
            </v-chip>
            <v-chip
              :color="statusColor[doc.status ?? ''] ?? 'grey'"
              variant="tonal"
              size="small"
            >
              {{ doc.status ?? '—' }}
            </v-chip>
          </div>
          <div class="text-h6">NF-e Nº {{ doc.documentNumber }} — Série {{ doc.series }}</div>
          <div class="text-caption text-medium-emphasis font-mono">
            Chave: {{ doc.accessKey ?? 'N/A' }}
          </div>
        </div>
        <div class="d-flex ga-2">
          <v-btn prepend-icon="mdi-swap-horizontal" variant="tonal" size="small" @click="openDirectionDialog">
            Alterar direção
          </v-btn>
          <v-btn
            prepend-icon="mdi-delete-outline"
            variant="tonal"
            color="error"
            size="small"
            :loading="deleting"
            @click="deleteDocument"
          >
            Excluir
          </v-btn>
        </div>
      </div>

      <!-- Tabs -->
      <v-tabs v-model="tab" density="compact" color="primary" class="mb-4">
        <v-tab value="dados">Dados</v-tab>
        <v-tab value="itens">Itens ({{ doc.items.length }})</v-tab>
        <v-tab value="impostos">Impostos</v-tab>
        <v-tab value="xml">XML</v-tab>
      </v-tabs>

      <!-- Tab: Dados -->
      <v-window v-model="tab">
        <v-window-item value="dados">
          <div class="d-flex flex-wrap ga-4">
            <!-- Document info -->
            <v-card variant="outlined" class="flex-grow-1" style="min-width: 260px">
              <v-card-title class="text-body-1">Identificação</v-card-title>
              <v-list density="compact">
                <v-list-item title="Modelo" :subtitle="doc.model ?? '—'" />
                <v-list-item title="Natureza da operação" :subtitle="doc.operationType ?? '—'" />
                <v-list-item title="Data de emissão" :subtitle="formatDate(doc.issueDate)" />
                <v-list-item title="Arquivo origem" :subtitle="doc.sourceFileName ?? '—'" />
                <v-list-item title="Importado em" :subtitle="formatDate(doc.importedAt)" />
              </v-list>
            </v-card>

            <!-- Totals -->
            <v-card variant="outlined" class="flex-grow-1" style="min-width: 220px">
              <v-card-title class="text-body-1">Valores</v-card-title>
              <div class="pa-3">
                <div class="d-flex justify-space-between text-body-2 mb-1">
                  <span class="text-medium-emphasis">Produtos</span><span>{{ formatMoney(doc.productsAmount) }}</span>
                </div>
                <div class="d-flex justify-space-between text-body-2 mb-1">
                  <span class="text-medium-emphasis">Desconto</span><span class="text-error">-{{ formatMoney(doc.discountAmount) }}</span>
                </div>
                <div class="d-flex justify-space-between text-body-2 mb-1">
                  <span class="text-medium-emphasis">Frete</span><span>{{ formatMoney(doc.freightAmount) }}</span>
                </div>
                <div class="d-flex justify-space-between text-body-2 mb-1">
                  <span class="text-medium-emphasis">Impostos</span><span>{{ formatMoney(doc.taxAmount) }}</span>
                </div>
                <v-divider class="my-2" />
                <div class="d-flex justify-space-between font-weight-bold">
                  <span>Total</span><span>{{ formatMoney(doc.totalAmount) }}</span>
                </div>
              </div>
            </v-card>

            <!-- Issuer -->
            <v-card v-if="issuer()" variant="outlined" class="flex-grow-1" style="min-width: 240px">
              <v-card-title class="text-body-1">Emitente</v-card-title>
              <v-list density="compact">
                <v-list-item title="Razão Social" :subtitle="issuer()?.legalName ?? '—'" />
                <v-list-item title="Nome fantasia" :subtitle="issuer()?.tradeName ?? '—'" />
                <v-list-item title="CNPJ/CPF" :subtitle="issuer()?.documentNumber ?? '—'" />
                <v-list-item title="IE" :subtitle="issuer()?.stateRegistration ?? '—'" />
                <v-list-item title="Endereço" :subtitle="issuer()?.address ?? '—'" />
                <v-list-item title="Cidade/UF" :subtitle="`${issuer()?.city ?? '—'} / ${issuer()?.state ?? '—'}`" />
              </v-list>
            </v-card>

            <!-- Recipient -->
            <v-card v-if="recipient()" variant="outlined" class="flex-grow-1" style="min-width: 240px">
              <v-card-title class="text-body-1">Destinatário</v-card-title>
              <v-list density="compact">
                <v-list-item title="Razão Social / Nome" :subtitle="recipient()?.legalName ?? '—'" />
                <v-list-item title="CNPJ/CPF" :subtitle="recipient()?.documentNumber ?? '—'" />
                <v-list-item title="IE" :subtitle="recipient()?.stateRegistration ?? '—'" />
                <v-list-item title="Endereço" :subtitle="recipient()?.address ?? '—'" />
                <v-list-item title="Cidade/UF" :subtitle="`${recipient()?.city ?? '—'} / ${recipient()?.state ?? '—'}`" />
              </v-list>
            </v-card>
          </div>
        </v-window-item>

        <!-- Tab: Itens -->
        <v-window-item value="itens">
          <div class="table-wrap">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Cód.</th>
                  <th>Descrição</th>
                  <th>NCM</th>
                  <th>CFOP</th>
                  <th class="text-right">Qtd</th>
                  <th class="text-right">Vl. Unit.</th>
                  <th class="text-right">Total</th>
                  <th class="text-right">Desconto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in doc.items" :key="item.id">
                  <td class="text-caption">{{ item.productCode ?? '—' }}</td>
                  <td class="text-body-2">{{ item.description ?? '—' }}</td>
                  <td class="text-caption">{{ item.ncm ?? '—' }}</td>
                  <td class="text-caption">{{ item.cfop ?? '—' }}</td>
                  <td class="text-right text-caption">{{ item.quantity }} {{ item.unit }}</td>
                  <td class="text-right text-caption">{{ formatMoney(item.unitPrice) }}</td>
                  <td class="text-right font-weight-medium">{{ formatMoney(item.totalPrice) }}</td>
                  <td class="text-right text-caption text-error">{{ item.discountAmount ? formatMoney(item.discountAmount) : '—' }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-window-item>

        <!-- Tab: Impostos -->
        <v-window-item value="impostos">
          <div class="table-wrap">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Tributo</th>
                  <th>CST/CSOSN</th>
                  <th class="text-right">Base de Cálculo</th>
                  <th class="text-right">Alíquota</th>
                  <th class="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tax in doc.taxes" :key="tax.id">
                  <td><v-chip size="x-small" variant="tonal" color="primary">{{ tax.taxType }}</v-chip></td>
                  <td class="text-caption">{{ tax.cst ?? tax.csosn ?? '—' }}</td>
                  <td class="text-right text-caption">{{ formatMoney(tax.baseAmount) }}</td>
                  <td class="text-right text-caption">{{ tax.rate != null ? `${Number(tax.rate).toFixed(2)}%` : '—' }}</td>
                  <td class="text-right font-weight-medium">{{ formatMoney(tax.taxAmount) }}</td>
                </tr>
                <tr v-if="!doc.taxes.length">
                  <td colspan="5" class="text-center text-medium-emphasis py-4">Nenhum imposto registrado.</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-window-item>

        <!-- Tab: XML -->
        <v-window-item value="xml">
          <v-card variant="outlined">
            <v-card-actions class="pa-2">
              <v-btn
                prepend-icon="mdi-content-copy"
                variant="text"
                size="small"
                @click="navigator.clipboard.writeText(doc.rawXml ?? '')"
              >
                Copiar
              </v-btn>
            </v-card-actions>
            <v-divider />
            <pre class="xml-pre pa-4">{{ doc.rawXml ?? 'XML não disponível' }}</pre>
          </v-card>
        </v-window-item>
      </v-window>
    </template>

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
  </div>
</template>

<style scoped>
.font-mono {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  word-break: break-all;
}
.table-wrap {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}
.xml-pre {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 60vh;
  overflow-y: auto;
}
</style>
