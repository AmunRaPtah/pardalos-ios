// ── API client with configurable base URL ──

import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'pardalos_server_url'
const DEFAULT_URL = 'http://localhost:8001'

let _baseUrl: string | null = null

export async function getServerUrl(): Promise<string> {
  if (_baseUrl) return _baseUrl
  const stored = await AsyncStorage.getItem(STORAGE_KEY)
  _baseUrl = stored || DEFAULT_URL
  return _baseUrl
}

export async function setServerUrl(url: string): Promise<void> {
  const cleaned = url.replace(/\/+$/, '')
  _baseUrl = cleaned
  await AsyncStorage.setItem(STORAGE_KEY, cleaned)
}

export function clearCachedUrl(): void {
  _baseUrl = null
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = await getServerUrl()
  const url = `${base}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new ApiError(res.status, text || `${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

async function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

// ── Exported API object ──

export const api = {
  get,
  post,
  request,

  // Health check
  health: () => get<{ status: string }>('/api/health'),

  // GrantFinder endpoints
  grantfinder: {
    // Dashboard
    dashboard: () => get<any>('/api/grantfinder/dashboard'),
    stats: () => get<any>('/api/grantfinder/stats'),

    // Programs
    programs: (params?: string) =>
      get<any[]>(`/api/grantfinder/programs${params ? `?${params}` : ''}`),
    program: (id: string) => get<any>(`/api/grantfinder/program/${id}`),
    programDetail: (id: string) => get<any>(`/api/grantfinder/program/${id}/detail`),
    programChat: (id: string, question: string) =>
      post<any>(`/api/grantfinder/program/${id}/chat`, { question }),
    triggerPipeline: (id: string) =>
      post<any>(`/api/grantfinder/program/${id}/pipeline`),

    // Pipeline
    pipelineRunAll: () => post<any>('/api/grantfinder/pipeline/run-all'),

    // Notifications
    notifications: () => get<any[]>('/api/grantfinder/notifications'),
    markRead: (nid: number) => post<any>(`/api/grantfinder/notifications/${nid}/read`),
    markAllRead: () => post<any>('/api/grantfinder/notifications/read-all'),

    // Pending approvals
    pending: () => get<any[]>('/api/grantfinder/pending'),
    approve: (token: string) => post<any>(`/api/grantfinder/approve/${token}`),
    reject: (token: string) => post<any>(`/api/grantfinder/reject/${token}`),

    // Applications
    applications: () => get<any[]>('/api/grantfinder/applications'),

    // Growth
    growthReport: () => get<any>('/api/grantfinder/growth/report'),
    growthAnalysis: () => get<any>('/api/grantfinder/growth/analysis'),
    growthEnrich: (batch = 5) =>
      post<any>('/api/grantfinder/growth/enrich', { batch }),
    hygieneScan: () => post<any>('/api/grantfinder/growth/hygiene-scan'),
    hygieneReport: () => get<any>('/api/grantfinder/growth/hygiene-report'),
    scoutPrograms: () => get<any>('/api/grantfinder/growth/scout'),
    snapshot: () => post<any>('/api/grantfinder/growth/snapshot'),

    // Automation
    automationStatus: () => get<any>('/api/grantfinder/automation/status'),
    runAlert: () => post<any>('/api/grantfinder/automation/run-alert'),
    runPipeline: () => post<any>('/api/grantfinder/automation/run-pipeline'),
    sendDigest: () => post<any>('/api/grantfinder/automation/send-digest'),

    // Intel
    intelReport: () => get<any>('/api/grantfinder/growth/intel-report'),
    intelScan: () => post<any>('/api/grantfinder/growth/intel-scan'),
    probabilities: () => get<any>('/api/grantfinder/growth/probabilities'),

    // Tracker
    trackerStatus: () => get<any>('/api/grantfinder/tracker/status'),
    trackerStates: () => get<any>('/api/grantfinder/tracker/states'),
    scanInbox: (limit = 30) =>
      post<any>(`/api/grantfinder/tracker/scan-inbox?limit=${limit}`),
    updateStatus: (programId: string, newState: string) =>
      post<any>(`/api/grantfinder/tracker/update-status/${programId}/${newState}`),

    // Submissions
    submitPending: () => get<any>('/api/grantfinder/submit/pending'),
    submitStatus: (programId: string) =>
      get<any>(`/api/grantfinder/submit/status/${programId}`),
    submitScan: (programId: string) =>
      post<any>(`/api/grantfinder/submit/scan/${programId}`),
    submitPrepare: (programId: string) =>
      post<any>(`/api/grantfinder/submit/prepare/${programId}`),
    submitPreview: (programId: string) =>
      post<any>(`/api/grantfinder/submit/preview/${programId}`),
    submitExecute: (programId: string, overrides?: any) =>
      post<any>(`/api/grantfinder/submit/execute/${programId}`, { overrides }),
  },
}
