'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  onComplete: () => void
}

// QuizView is rendered during the session — the actual quiz is handled
// by the AI through the conversation. This component shows a visual
// overlay during the quiz phase to set the right expectation.
export default function QuizView({ onComplete }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
        <div className="text-center">
          <span className="text-5xl">🎯</span>
          <h2 className="text-xl font-bold text-gray-800 mt-3">Quiz Time!</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Lily is going to ask you 3 quick questions about today's session.
            Listen carefully and answer by speaking!
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          {['Vocabulary', 'Grammar', 'Fun Q'].map((label, i) => (
            <div key={i} className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl">{['📖', '✏️', '😄'][i]}</p>
              <p className="text-xs text-blue-700 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => { setDismissed(true); onComplete() }}
          className="w-full mt-5 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          I'm Ready!
        </button>
      </div>
    </div>
  )
}
