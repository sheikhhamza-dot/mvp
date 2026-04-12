'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, getToken } from '@/lib/api'
import Navbar from '@/components/Navbar'
import SessionReport from '@/components/SessionReport'
import { formatDate, formatDuration, topicLabel } from '@/lib/utils'

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
    if (!getToken()) { router.push('/login'); return }
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
    <>
      {/* Print styles */}
      <style>{`
        .no-print { display: none !important; }
        .print-only { display: none; }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page { margin: 18mm 16mm; }
        }
        @media not print {
          .no-print { display: revert; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <div className="no-print">
          <Navbar />
        </div>

        <main className="max-w-2xl mx-auto px-4 py-6">

          {/* Print-only header */}
          <div className="print-only mb-6 pb-4 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 16 }}>🎙️</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>SpeakLily</span>
              </div>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Printed {new Date().toLocaleDateString()}</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginTop: 12 }}>
              Session Report — {transcript?.child_name || report?.child_name || ''}
            </h1>
            {report && (
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                {formatDate(report.date)}
                {report.topic ? ` · ${topicLabel(report.topic)}` : ''}
                {report.duration_minutes ? ` · ${formatDuration(report.duration_minutes)}` : ''}
              </p>
            )}
          </div>

          {/* Screen nav */}
          <div className="no-print">
            <Link href={`/dashboard/child/${id}`} className="text-sm text-blue-500 hover:underline mb-4 block">
              ← {transcript?.child_name || 'Child'}'s Progress
            </Link>
          </div>

          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
          ) : (
            <>
              {/* Tabs + Print button row */}
              <div className="no-print flex items-center gap-3 mb-5">
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-1">
                  {(['report', 'transcript'] as View[]).map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors ${view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>
                      {v === 'report' ? '📋 Session Report' : '💬 Transcript'}
                    </button>
                  ))}
                </div>
                {view === 'report' && report && (
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
                  >
                    🖨️ Print / PDF
                  </button>
                )}
              </div>

              {view === 'report' && report && <SessionReport report={report} />}

              {view === 'transcript' && transcript && (
                <div className="flex flex-col gap-3">
                  <div className="text-sm text-gray-400 text-center no-print">
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

          {/* Print footer */}
          <div className="print-only mt-8 pt-4 border-t border-gray-200 text-center" style={{ fontSize: 11, color: '#9CA3AF' }}>
            Generated by SpeakLily · AI English Speaking Coach for children aged 8–14
          </div>
        </main>
      </div>
    </>
  )
}
