'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend,
} from 'recharts'

interface SessionData {
  week: string
  sessions: number
  minutes: number
  words: number
}

interface Props {
  data: SessionData[]
  type?: 'sessions' | 'minutes' | 'words'
}

const COLORS = {
  sessions: '#3b82f6',
  minutes: '#8b5cf6',
  words: '#10b981',
}

const LABELS = {
  sessions: 'Sessions',
  minutes: 'Speaking (min)',
  words: 'New Words',
}

export default function ProgressChart({ data, type = 'sessions' }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl text-gray-400 text-sm">
        No data yet. Complete sessions to see progress!
      </div>
    )
  }

  const dataKey = type
  const color = COLORS[type]
  const label = LABELS[type]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value: any) => [value, label]}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LevelProgressChart({ history }: { history: { level: number; reached_at: string }[] }) {
  if (!history || history.length === 0) return null
  const data = history.map(h => ({
    date: h.reached_at,
    level: h.level,
  }))
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: any) => [`Level ${v}`, 'Level']} />
        <Line type="stepAfter" dataKey="level" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
