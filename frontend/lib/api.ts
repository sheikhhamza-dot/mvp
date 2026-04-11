import { createClient } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getToken(): Promise<string> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || ''
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

// ── Children ─────────────────────────────────────────────────────────────────

export const api = {
  children: {
    list: () => request<any[]>('/children'),
    get: (id: string) => request<any>(`/children/${id}`),
    create: (data: {
      name: string; age: number; grade: number
      native_language: string; proficiency_level: number
    }) => request<any>('/children', { method: 'POST', body: JSON.stringify(data) }),
  },

  // ── Sessions ───────────────────────────────────────────────────────────────
  sessions: {
    start: (child_id: string, topic: string) =>
      request<any>('/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ child_id, topic }),
      }),
    message: (session_id: string, content: string) =>
      request<any>(`/sessions/${session_id}/message`, {
        method: 'POST',
        body: JSON.stringify({ content, timestamp: new Date().toISOString() }),
      }),
    end: (session_id: string, reason = 'completed') =>
      request<any>(`/sessions/${session_id}/end`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    list: (child_id: string) => request<any[]>(`/sessions/${child_id}/list`),
    transcript: (session_id: string) => request<any>(`/sessions/${session_id}/transcript`),
    report: (session_id: string) => request<any>(`/sessions/${session_id}/report`),
  },

  // ── Vocabulary ─────────────────────────────────────────────────────────────
  vocabulary: {
    get: (child_id: string, sort = 'date', limit = 50, offset = 0) =>
      request<any>(`/vocabulary/${child_id}?sort=${sort}&limit=${limit}&offset=${offset}`),
  },

  // ── Progress ───────────────────────────────────────────────────────────────
  progress: {
    get: (child_id: string) => request<any>(`/progress/${child_id}`),
    weekly: (child_id: string, week?: string) =>
      request<any>(`/progress/${child_id}/weekly${week ? `?week=${week}` : ''}`),
  },

  // ── Goals ──────────────────────────────────────────────────────────────────
  goals: {
    list: (child_id: string) => request<any[]>(`/goals/${child_id}`),
    create: (child_id: string, type: string, target: number) =>
      request<any>('/goals', {
        method: 'POST',
        body: JSON.stringify({ child_id, type, target }),
      }),
  },
}
