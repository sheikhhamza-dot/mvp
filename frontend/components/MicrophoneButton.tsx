'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { getToken } from '@/lib/api'

type State = 'idle' | 'listening' | 'processing'

interface Props {
  onTranscript: (text: string) => void
  disabled?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function MicrophoneButton({ onTranscript, disabled }: Props) {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState<string | null>(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // When parent re-enables the mic after Lily finishes speaking,
  // reset from 'processing' back to 'idle'
  useEffect(() => {
    if (!disabled && state === 'processing') {
      setState('idle')
    }
  }, [disabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRecording(false)
  }, [])

  const stopRecording = useCallback((sendAudio = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecordingSeconds(0)

    const recorder = mediaRecorderRef.current
    if (!recorder) return

    if (sendAudio) {
      recorder.stop() // triggers onstop → sendToWhisper
    } else {
      recorder.ondataavailable = null
      recorder.onstop = null
      recorder.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      mediaRecorderRef.current = null
      chunksRef.current = []
    }
  }, [])

  const sendToWhisper = useCallback(async (audioBlob: Blob) => {
    setState('processing')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')

      const res = await fetch(`${API_URL}/api/sessions/transcribe`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Transcription failed' }))
        throw new Error(err.detail || `Error ${res.status}`)
      }

      const data = await res.json()
      const transcript = (data.transcript || '').trim()

      if (!transcript) {
        setError('No speech detected. Try again!')
        setState('idle')
        return
      }

      onTranscript(transcript)
      // state resets to 'idle' via the disabled→false effect after Lily speaks
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
      setState('idle')
    }
  }, [onTranscript])

  const startListening = useCallback(async () => {
    setError(null)
    setRecordingSeconds(0)
    chunksRef.current = []

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone permission denied. Please allow microphone access.')
      return
    }
    streamRef.current = stream

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/ogg'

    const recorder = new MediaRecorder(stream, { mimeType })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      streamRef.current = null
      mediaRecorderRef.current = null

      const audioBlob = new Blob(chunksRef.current, { type: mimeType })
      chunksRef.current = []

      if (audioBlob.size < 500) {
        setError('No audio recorded. Try again!')
        setState('idle')
        return
      }
      sendToWhisper(audioBlob)
    }

    recorder.start(250) // collect in 250ms chunks
    setState('listening')

    // Rolling timer — auto-stop at 30s
    timerRef.current = setInterval(() => {
      setRecordingSeconds(s => {
        if (s >= 29) {
          stopRecording(true)
          return 0
        }
        return s + 1
      })
    }, 1000)
  }, [sendToWhisper, stopRecording])

  const handleClick = () => {
    if (disabled || state === 'processing') return
    if (state === 'listening') {
      stopRecording(true)
    } else {
      startListening()
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={disabled || state === 'processing'}
        className={cn(
          'relative w-24 h-24 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2',
          state === 'idle' && !disabled &&
            'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 shadow-lg hover:shadow-xl',
          state === 'listening' &&
            'bg-red-500 focus:ring-red-300 shadow-xl',
          state === 'processing' &&
            'bg-gray-400 cursor-not-allowed',
          disabled && 'bg-gray-300 cursor-not-allowed opacity-60',
        )}
        aria-label={state === 'listening' ? 'Stop recording' : 'Start speaking'}
      >
        {/* Pulse rings when recording */}
        {state === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
            <span className="absolute -inset-3 rounded-full bg-red-300 animate-ping opacity-20 delay-150" />
          </>
        )}

        <span className="relative flex items-center justify-center h-full">
          {state === 'processing' ? (
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm-1 16.93A7.001 7.001 0 015 11H3a9 9 0 0017 0h-2a7.001 7.001 0 01-6 6.93V20H9v2h6v-2h-4v-2.07z" />
            </svg>
          )}
        </span>
      </button>

      <p className={cn(
        'text-sm font-medium',
        state === 'idle' && 'text-gray-500',
        state === 'listening' && 'text-red-500',
        state === 'processing' && 'text-blue-500',
      )}>
        {state === 'idle' && (disabled ? 'Wait for Lily...' : 'Tap to speak')}
        {state === 'listening' && `Recording... ${recordingSeconds}s`}
        {state === 'processing' && 'Thinking...'}
      </p>

      {error && (
        <p className="text-xs text-red-500 max-w-xs text-center">{error}</p>
      )}
    </div>
  )
}
