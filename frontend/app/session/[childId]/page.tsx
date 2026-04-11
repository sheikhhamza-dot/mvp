'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api, getToken } from '@/lib/api'
import { Child, ConversationMessage, TopicId } from '@/lib/types'
import MicrophoneButton from '@/components/MicrophoneButton'
import ConversationView from '@/components/ConversationView'
import TopicSelector from '@/components/TopicSelector'
import QuizView from '@/components/QuizView'
import Link from 'next/link'

type SessionState = 'topic_select' | 'starting' | 'active' | 'ending' | 'done'

const MAX_SESSION_MINUTES = 15

// TTS helper
function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.()
    return
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  utterance.pitch = 1.1
  // Prefer a female voice
  const voices = window.speechSynthesis.getVoices()
  const femaleVoice = voices.find(v =>
    (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria') || v.name.includes('Zira'))
    && v.lang.startsWith('en')
  )
  if (femaleVoice) utterance.voice = femaleVoice
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()
  window.speechSynthesis.speak(utterance)
}

export default function SessionPage() {
  const { childId } = useParams<{ childId: string }>()
  const router = useRouter()

  const [child, setChild] = useState<Child | null>(null)
  const [sessionState, setSessionState] = useState<SessionState>('topic_select')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isMicDisabled, setIsMicDisabled] = useState(true)
  const [sessionPhase, setSessionPhase] = useState('opening')
  const [showQuiz, setShowQuiz] = useState(false)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [endResult, setEndResult] = useState<any>(null)
  const [error, setError] = useState('')

  const sessionStartRef = useRef<Date | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Auth check
  useEffect(() => {
    if (!getToken()) { router.push('/login'); return }
    api.children.get(childId).then(setChild).catch(console.error)

    // Load voices (required in some browsers)
    window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', () => {})

    return () => {
      window.speechSynthesis?.cancel()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [childId, router])

  // Session timer
  useEffect(() => {
    if (sessionState === 'active') {
      sessionStartRef.current = new Date()
      timerRef.current = setInterval(() => {
        if (sessionStartRef.current) {
          const mins = (Date.now() - sessionStartRef.current.getTime()) / 60000
          setElapsedMinutes(mins)
          if (mins >= MAX_SESSION_MINUTES) {
            handleEndSession('timeout')
          }
        }
      }, 10000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [sessionState])

  const addMessage = (role: 'child' | 'ai', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date().toISOString() }])
  }

  const playAiResponse = useCallback((text: string) => {
    setIsAiSpeaking(true)
    setIsMicDisabled(true)
    speak(text, () => {
      setIsAiSpeaking(false)
      setIsMicDisabled(false)
    })
  }, [])

  const handleTopicSelect = async (topic: TopicId) => {
    setSessionState('starting')
    try {
      const result = await api.sessions.start(childId, topic)
      setSessionId(result.session_id)
      addMessage('ai', result.opening_message)
      setSessionState('active')
      playAiResponse(result.opening_message)
    } catch (e: any) {
      setError(e.message)
      setSessionState('topic_select')
    }
  }

  const handleTranscript = async (text: string) => {
    if (!sessionId || sessionState !== 'active') return
    addMessage('child', text)
    setIsMicDisabled(true)

    try {
      const result = await api.sessions.message(sessionId, text)
      addMessage('ai', result.response)
      setSessionPhase(result.metadata.session_phase)

      // Show quiz overlay when entering quiz phase
      if (result.metadata.session_phase === 'quiz' && sessionPhase !== 'quiz') {
        setShowQuiz(true)
      }

      playAiResponse(result.response)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
      setIsMicDisabled(false)
    }
  }

  const handleEndSession = async (reason = 'child_ended') => {
    if (!sessionId || sessionState === 'ending' || sessionState === 'done') return
    setSessionState('ending')
    window.speechSynthesis?.cancel()
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      const result = await api.sessions.end(sessionId, reason)
      setEndResult(result)
      setSessionState('done')
    } catch (e: any) {
      setError(e.message)
      setSessionState('active')
    }
  }

  // ── Render states ────────────────────────────────────────────────────────

  if (sessionState === 'topic_select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-lg mx-auto">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="text-sm text-blue-500 hover:underline">← Back</Link>
            <span className="text-sm font-medium text-gray-500">🎙️ English Coach</span>
          </div>
          {child && <TopicSelector onSelect={handleTopicSelect} childName={child.name} />}
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </div>
      </div>
    )
  }

  if (sessionState === 'starting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="text-6xl animate-bounce-slow mb-4">🎙️</div>
          <p className="text-gray-500 animate-pulse">Starting your session...</p>
        </div>
      </div>
    )
  }

  if (sessionState === 'done' && endResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800">Great session!</h2>
          <p className="text-gray-500 mt-2 mb-5">{endResult.summary}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-blue-600">{endResult.vocab_introduced?.length || 0}</p>
              <p className="text-xs text-gray-400">New words</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-purple-600">{Math.round(endResult.duration_minutes || 0)}m</p>
              <p className="text-xs text-gray-400">Practice time</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/session/${childId}`}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors">
              Practice Again
            </Link>
            <Link href="/dashboard"
              className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Active session
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">L</div>
          <div>
            <p className="font-semibold text-sm text-gray-800">Lily</p>
            <p className="text-xs text-gray-400">Your English Coach</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <span className="text-xs text-gray-400">
            {Math.floor(elapsedMinutes)}:{String(Math.floor((elapsedMinutes % 1) * 60)).padStart(2, '0')} / {MAX_SESSION_MINUTES}m
          </span>
          <button
            onClick={() => handleEndSession('child_ended')}
            disabled={sessionState === 'ending'}
            className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            End
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ConversationView messages={messages} isAiTyping={isAiSpeaking} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <p className="text-xs text-red-500 text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>
        </div>
      )}

      {/* Mic button */}
      <div className="bg-white border-t border-gray-100 py-5 flex justify-center flex-shrink-0">
        <MicrophoneButton
          onTranscript={handleTranscript}
          disabled={isMicDisabled || sessionState === 'ending'}
        />
      </div>

      {/* Quiz overlay */}
      {showQuiz && <QuizView onComplete={() => setShowQuiz(false)} />}
    </div>
  )
}
