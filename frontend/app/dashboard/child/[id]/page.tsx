'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Child, Progress, WeeklyProgress, SessionSummary } from '@/lib/types'
import Navbar from '@/components/Navbar'
import StreakCounter from '@/components/StreakCounter'
import VocabularyJournal from '@/components/VocabularyJournal'
import ProgressChart, { LevelProgressChart } from '@/components/ProgressChart'
import { formatDuration, levelLabel, topicLabel, formatDate } from '@/lib/utils'

type Tab = 'overview' | 'sessions' | 'vocabulary' | 'goals'

export default function ChildProgressPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [child, setChild] = useState<Child | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [weekly, setWeekly] = useState<WeeklyProgress | null>(null)
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [vocabData, setVocabData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login')
    }
    Promise.all([
      api.children.get(id),
      api.progress.get(id),
      api.progress.weekly(id),
      api.sessions.list(id),
      api.vocabulary.get(id),
    ]).then(([c, p, w, s, v]) => {
      setChild(c); setProgress(p); setWeekly(w); setSessions(s); setVocabData(v)
    }).catch(console.error).finally(() => setLoading(false))
  }, [id, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">Loading...</div>
  if (!child) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Back */}
        <Link href="/dashboard" className="text-sm text-blue-500 hover:underline mb-4 block">← Dashboard</Link>

        {/* Child header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {child.name[0]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{child.name}</h1>
                <p className="text-sm text-gray-400">Grade {child.grade} · {levelLabel(child.proficiency_level)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StreakCounter streak={child.streak_current} />
              <Link href={`/session/${child.id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                Start Session
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{child.total_sessions}</p>
              <p className="text-xs text-gray-400">Total Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{child.total_vocab_count}</p>
              <p className="text-xs text-gray-400">Words Learned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{formatDuration(child.total_speaking_minutes)}</p>
              <p className="text-xs text-gray-400">Speaking Time</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
          {(['overview', 'sessions', 'vocabulary', 'goals'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && progress && (
          <div className="flex flex-col gap-4">
            {weekly && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-3">This Week</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center bg-blue-50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-blue-600">{weekly.sessions_count}</p>
                    <p className="text-xs text-gray-400">Sessions</p>
                  </div>
                  <div className="text-center bg-purple-50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-purple-600">{Math.round(weekly.speaking_minutes)}m</p>
                    <p className="text-xs text-gray-400">Speaking</p>
                  </div>
                  <div className="text-center bg-green-50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-green-600">{weekly.new_vocab_count}</p>
                    <p className="text-xs text-gray-400">New Words</p>
                  </div>
                </div>
                {weekly.summary && <p className="text-sm text-gray-500 leading-relaxed">{weekly.summary}</p>}
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Level Progress</h3>
              <LevelProgressChart history={progress.level_history} />
            </div>
          </div>
        )}

        {/* Sessions tab */}
        {tab === 'sessions' && (
          <div className="flex flex-col gap-3">
            {sessions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No sessions yet.</div>
            ) : sessions.map(s => (
              <Link key={s.id} href={`/dashboard/child/${id}/sessions/${s.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:shadow-md transition-shadow flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{topicLabel(s.topic)}</p>
                  <p className="text-xs text-gray-400">{formatDate(s.started_at)} · {s.duration_minutes ? formatDuration(s.duration_minutes) : 'in progress'}</p>
                </div>
                <div className="text-right">
                  {s.vocab_introduced?.length > 0 && (
                    <p className="text-xs text-blue-500">{s.vocab_introduced.length} words</p>
                  )}
                  {s.quiz_score != null && (
                    <p className="text-xs text-gray-400">Quiz: {s.quiz_score}/3</p>
                  )}
                  <span className="text-gray-300 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Vocabulary tab */}
        {tab === 'vocabulary' && vocabData && (
          <VocabularyJournal
            words={vocabData.words}
            totalCount={vocabData.total_count}
          />
        )}

        {/* Goals tab */}
        {tab === 'goals' && <GoalsTab childId={id} />}
      </main>
    </div>
  )
}

function GoalsTab({ childId }: { childId: string }) {
  const [goals, setGoals] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<'sessions_per_week' | 'words_per_month'>('sessions_per_week')
  const [target, setTarget] = useState(5)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.goals.list(childId).then(setGoals).catch(console.error)
  }, [childId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const goal = await api.goals.create(childId, type, target)
      setGoals(g => [...g, goal])
      setShowForm(false)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-4">
      {goals.map(g => (
        <div key={g.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-800">
              {g.type === 'sessions_per_week' ? '📅 Sessions per week' : '📚 Words per month'}
            </p>
            {g.achieved ? (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">✓ Achieved!</span>
            ) : g.on_track ? (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">On track</span>
            ) : (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Behind</span>
            )}
          </div>
          <div className="flex items-end justify-between mb-1">
            <p className="text-2xl font-bold text-gray-800">{g.current} <span className="text-sm font-normal text-gray-400">/ {g.target}</span></p>
            <p className="text-xs text-gray-400">{g.period_start} – {g.period_end}</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${g.achieved ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, (g.current / g.target) * 100)}%` }} />
          </div>
        </div>
      ))}
      {showForm ? (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <select value={type} onChange={e => setType(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="sessions_per_week">Sessions per week</option>
            <option value="words_per_month">New words per month</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Target:</label>
            <input type="number" min={1} max={30} value={target} onChange={e => setTarget(+e.target.value)}
              className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold">{saving ? 'Saving...' : 'Set Goal'}</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-blue-500 text-sm hover:underline text-center">+ Set New Goal</button>
      )}
    </div>
  )
}
