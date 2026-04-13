'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

type State = 'idle' | 'listening' | 'processing'

interface Props {
  onTranscript: (text: string) => void
  disabled?: boolean
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function MicrophoneButton({ onTranscript, disabled }: Props) {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState<string | null>(null)
  const [interim, setInterim] = useState('')

  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')  // accumulates all final text while listening

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // When parent re-enables the mic after Lily finishes speaking,
  // reset from 'processing' back to 'idle'
  useEffect(() => {
    if (!disabled && state === 'processing') {
      setState('idle')
    }
  }, [disabled])

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const stopListening = useCallback(() => {
    // Null out the ref first so onend knows we stopped intentionally
    const recognition = recognitionRef.current
    recognitionRef.current = null
    recognition?.stop()

    const text = finalTranscriptRef.current.trim()
    finalTranscriptRef.current = ''
    setInterim('')

    if (text) {
      setState('processing')
      onTranscript(text)
    } else {
      setState('idle')
    }
  }, [onTranscript])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice not supported in this browser. Please use Chrome or Edge.')
      return
    }
    setError(null)
    setInterim('')
    finalTranscriptRef.current = ''

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true      // keep listening through pauses
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => setState('listening')

    recognition.onresult = (event: any) => {
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' '
        } else {
          interimText += transcript
        }
      }
      // Show interim text or the accumulated final text as live feedback
      setInterim(interimText || finalTranscriptRef.current.trim())
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.')
        setState('idle')
        recognitionRef.current = null
      } else if (event.error === 'no-speech') {
        // no-speech is not a real error in continuous mode — just ignore it
      } else if (event.error !== 'aborted') {
        // Unexpected error — salvage whatever was captured
        const text = finalTranscriptRef.current.trim()
        finalTranscriptRef.current = ''
        setInterim('')
        recognitionRef.current = null
        if (text) {
          setState('processing')
          onTranscript(text)
        } else {
          setError('Something went wrong. Please try again.')
          setState('idle')
        }
      }
    }

    recognition.onend = () => {
      // If recognitionRef is still set, the browser ended it (timeout/error),
      // not us — send whatever was captured
      if (recognitionRef.current !== null) {
        recognitionRef.current = null
        const text = finalTranscriptRef.current.trim()
        finalTranscriptRef.current = ''
        setInterim('')
        if (text) {
          setState('processing')
          onTranscript(text)
        } else {
          setState('idle')
        }
      }
    }

    recognition.start()
  }, [isSupported, onTranscript])

  const handleClick = () => {
    if (disabled || state === 'processing') return
    if (state === 'listening') {
      stopListening()
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
        aria-label={state === 'listening' ? 'Tap to send' : 'Tap to speak'}
      >
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
          ) : state === 'listening' ? (
            // Stop / send icon when listening
            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
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
        {state === 'listening' && 'Tap again when done'}
        {state === 'processing' && 'Thinking...'}
      </p>

      {interim && (
        <p className="text-xs text-gray-400 italic max-w-xs text-center">
          "{interim}"
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500 max-w-xs text-center">{error}</p>
      )}
    </div>
  )
}
