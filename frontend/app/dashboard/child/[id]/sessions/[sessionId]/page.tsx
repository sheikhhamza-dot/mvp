'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import SessionReport from '@/components/SessionReport'
import { formatDate, formatDuration } from '@/lib/utils'

type View = 'report' | 'transcript'

export default function SessionDetailPage() {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>()
  const router = useRouter()
  const [view, setView] = useState<View>('report')
  const [report, setReport] = useState<any>(null)
  const [transcript, setTranscript] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
    Promise.all([
      api.sessions.report(sessionId),
      api.sessions.transcript(sessionId),
    ]).then(([r, t]) => {
      setReport(r); setTranscript(t)
    }).catch(e => setError(e.message))
    .finally(() => setLoading(false))
  }, [sessionId, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 animate-pulse">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Link href={`/dashboard/child/${id}`} className="text-sm text-blue-500 hover:underline mb-4 block">
          ← {transcript?.child_name || 'Child'}'s Progress
        </Link>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
        ) : (
          <>
            {/* Toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
              {(['report', 'transcript'] as View[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>
                  {v === 'report' ? '📋 Session Report' : '💬 Transcript'}
                </button>
              ))}
            </div>

            {view === 'report' && report && <SessionReport report={report} />}

            {view === 'transcript' && transcript && (
              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-400 text-center">
                  {formatDate(transcript.date)} · {transcript.duration_minutes ? formatDuration(transcript.duration_minutes) : ''}
                </div>
                {transcript.messages?.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.role === 'child' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">L</div>
                    )}
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'child' ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
