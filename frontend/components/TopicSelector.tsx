'use client'
import { TOPICS, TopicId } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  onSelect: (topic: TopicId) => void
  childName: string
}

export default function TopicSelector({ onSelect, childName }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Hi {childName}! 👋
        </h2>
        <p className="text-gray-500 mt-1">What would you like to talk about today?</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 border-transparent',
              'bg-white shadow-sm hover:shadow-md',
              'hover:border-blue-300 hover:bg-blue-50',
              'transition-all duration-150 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
            )}
          >
            <span className="text-4xl">{topic.emoji}</span>
            <span className="font-semibold text-gray-800 text-sm">{topic.label}</span>
            <span className="text-xs text-gray-400 text-center leading-tight">{topic.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
