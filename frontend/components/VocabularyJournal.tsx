'use client'
import { useState } from 'react'
import { VocabWord } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  words: VocabWord[]
  totalCount: number
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function VocabularyJournal({ words, totalCount, onLoadMore, hasMore }: Props) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'date' | 'alpha'>('date')

  const filtered = words.filter(w =>
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.definition.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Vocabulary Journal</h3>
          <p className="text-sm text-gray-500">{totalCount} words learned</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSort('date')}
            className={cn(
              'px-3 py-1 text-xs rounded-full border',
              sort === 'date' ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'
            )}
          >
            Recent
          </button>
          <button
            onClick={() => setSort('alpha')}
            className={cn(
              'px-3 py-1 text-xs rounded-full border',
              sort === 'alpha' ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'
            )}
          >
            A–Z
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search words..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* Word list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            {search ? 'No words match your search.' : 'No vocabulary words yet. Start a session!'}
          </div>
        )}
        {filtered.map(word => (
          <div
            key={word.word}
            className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{word.word}</span>
                  {word.retained && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                      ✓ Retained
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{word.definition}</p>
                <p className="text-xs text-gray-400 italic mt-1">"{word.example_sentence}"</p>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <p className="text-xs text-gray-400">{word.introduced_date}</p>
                {word.times_used_later > 0 && (
                  <p className="text-xs text-blue-500 mt-0.5">used {word.times_used_later}×</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          className="text-blue-500 text-sm text-center hover:underline mt-2"
        >
          Load more words
        </button>
      )}
    </div>
  )
}
