const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('token') || ''
}

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getUser(): { id: string; name: string; email: string } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export function setUser(user: { id: string; name: string; email: string }) {
  localStorage.setItem('user', JSON.stringify(user))
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  auth: {
    signup: (data: { email: string; password: string; name: string; language?: string }) =>
      request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },

  children: {
    list: () => request<any[]>('/children'),
    get: (id: string) => request<any>(`/children/${id}`),
    create: (data: {
      name: string; age: number; grade: number
      native_language: string; proficiency_level: number
    }) => request<any>('/children', { method: 'POST', body: JSON.stringify(data) }),
  },

  sessions: {
    start: (child_id: string, topic: string) =>
      request<any>('/sessions/start', { method: 'POST', body: JSON.stringify({ child_id, topic }) }),
    message: (session_id: string, content: string) =>
      request<any>(`/sessions/${session_id}/message`, {
        method: 'POST',
        body: JSON.stringify({ content, timestamp: new Date().toISOString() }),
      }),
    end: (session_id: string, reason = 'completed') =>
      request<any>(`/sessions/${session_id}/end`, {
        method: 'POST', body: JSON.stringify({ reason }),
      }),
    list: (child_id: string) => request<any[]>(`/sessions/${child_id}/list`),
    transcript: (session_id: string) => request<any>(`/sessions/${session_id}/transcript`),
    report: (session_id: string) => request<any>(`/sessions/${session_id}/report`),
  },

  vocabulary: {
    get: (child_id: string, sort = 'date', limit = 50, offset = 0) =>
      request<any>(`/vocabulary/${child_id}?sort=${sort}&limit=${limit}&offset=${offset}`),
  },

  progress: {
    get: (child_id: string) => request<any>(`/progress/${child_id}`),
    weekly: (child_id: string, week?: string) =>
      request<any>(`/progress/${child_id}/weekly${week ? `?week=${week}` : ''}`),
  },

  goals: {
    list: (child_id: string) => request<any[]>(`/goals/${child_id}`),
    create: (child_id: string, type: string, target: number) =>
      request<any>('/goals', { method: 'POST', body: JSON.stringify({ child_id, type, target }) }),
  },
}
