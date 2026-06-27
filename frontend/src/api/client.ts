const API_URL = import.meta.env.VITE_API_URL || '/api'

export interface AuthUser {
  id: string
  email: string
  createdAt: string
}

interface AuthResponse {
  user: AuthUser
  token: string
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = localStorage.getItem('token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data as T
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request<{ user: AuthUser }>('/auth/me'),

  commitHistory: () => request<{ commits: CommitEntry[] }>('/about/commit-history'),

  async importFile(file: File): Promise<ImportBatchResult> {
    const formData = new FormData()
    formData.append('file', file)
    const isZip = file.name.toLowerCase().endsWith('.zip')
    const endpoint = isZip ? '/import/zip' : '/import/xml'
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const response = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers, body: formData })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Import failed')
    return data as ImportBatchResult
  },

  listDocuments: (params?: DocumentListParams) => {
    const q = new URLSearchParams()
    if (params?.direction) q.set('direction', params.direction)
    if (params?.status) q.set('status', params.status)
    if (params?.search) q.set('search', params.search)
    if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
    if (params?.dateTo) q.set('dateTo', params.dateTo)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return request<DocumentListResponse>(`/documents?${q}`)
  },

  getDocument: (id: string) => request<DocumentDetail>(`/documents/${id}`),

  updateDirection: (id: string, direction: 'entrada' | 'saida') =>
    request<FiscalDocumentSummary>(`/documents/${id}/direction`, {
      method: 'PATCH',
      body: JSON.stringify({ direction }),
    }),

  deleteDocument: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'Delete failed')
    }
  },

  listErrors: (page = 1, limit = 20) =>
    request<ErrorListResponse>(`/errors?page=${page}&limit=${limit}`),

  getError: (id: string) => request<ImportErrorDetail>(`/errors/${id}`),

  reprocessError: (id: string) => request<ImportBatchResult>(`/errors/${id}/reprocess`, { method: 'POST' }),
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CommitEntry {
  hash: string
  type: string
  scope: string
  message: string
  date: string
  files: string[]
}

export interface ImportFileResult {
  success: boolean
  fileName: string
  documentId?: string
  error?: string
}

export interface ImportBatchResult {
  batchId: string
  totalFiles: number
  successCount: number
  errorCount: number
  results: ImportFileResult[]
}

export type DocumentDirection = 'entrada' | 'saida'
export type DocumentStatus = 'autorizada' | 'cancelada' | 'denegada' | 'inutilizada'

export interface FiscalParty {
  id: string
  partyType: 'issuer' | 'recipient'
  documentNumber: string | null
  legalName: string | null
  tradeName: string | null
  stateRegistration: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

export interface FiscalTax {
  id: string
  taxType: string
  cst: string | null
  csosn: string | null
  baseAmount: number | null
  rate: number | null
  taxAmount: number | null
}

export interface FiscalItem {
  id: string
  productCode: string | null
  ean: string | null
  description: string | null
  ncm: string | null
  cfop: string | null
  unit: string | null
  quantity: number | null
  unitPrice: number | null
  totalPrice: number | null
  discountAmount: number | null
  freightAmount: number | null
  taxAmount: number | null
  taxes: FiscalTax[]
}

export interface FiscalDocumentSummary {
  id: string
  accessKey: string | null
  documentNumber: string | null
  series: string | null
  model: string | null
  direction: DocumentDirection | null
  status: DocumentStatus | null
  issueDate: string | null
  totalAmount: number | null
  productsAmount: number | null
  discountAmount: number | null
  freightAmount: number | null
  taxAmount: number | null
  operationType: string | null
  sourceFileName: string | null
  importedAt: string | null
  parties: FiscalParty[]
}

export interface DocumentDetail extends FiscalDocumentSummary {
  rawXml: string | null
  items: FiscalItem[]
  taxes: FiscalTax[]
}

export interface DocumentListParams {
  direction?: string
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface DocumentListResponse {
  total: number
  page: number
  limit: number
  pages: number
  documents: FiscalDocumentSummary[]
}

export interface ImportErrorDetail {
  id: string
  batchId: string
  fileName: string
  errorMessage: string
  rawContent: string | null
  createdAt: string
  batch: {
    id: string
    fileName: string
    fileType: string
    importedAt: string
  }
}

export interface ErrorListResponse {
  total: number
  page: number
  limit: number
  pages: number
  errors: ImportErrorDetail[]
}
