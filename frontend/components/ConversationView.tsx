'use client'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ConversationMessage } from '@/lib/types'

interface Props {
  messages: ConversationMessage[]
  isAiTyping?: boolean
}

export default function ConversationView({ messages, isAiTyping }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiTyping])

  return (
    <div className="flex flex-col gap-3 overflow-y-auto flex-1 px-4 py-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            'flex animate-fade-in',
            msg.role === 'child' ? 'justify-end' : 'justify-start'
          )}
        >
          {msg.role === 'ai' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
              L
            </div>
          )}
          <div
            className={cn(
              'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
              msg.role === 'child'
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
            )}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isAiTyping && (
        <div className="flex items-start animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
            L
          </div>
          <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
            <div className="flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
