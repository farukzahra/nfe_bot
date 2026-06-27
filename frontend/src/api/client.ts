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

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data as T
}

export const api = {
  register(email: string, password: string) {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  me() {
    return request<{ user: AuthUser }>('/auth/me')
  },

  commitHistory() {
    return request<{ commits: CommitEntry[] }>('/about/commit-history')
  },

  async importFile(file: File): Promise<ImportBatchResult> {
    const formData = new FormData()
    formData.append('file', file)

    const isZip = file.name.toLowerCase().endsWith('.zip')
    const endpoint = isZip ? '/import/zip' : '/import/xml'

    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Import failed')
    return data as ImportBatchResult
  },
}

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
