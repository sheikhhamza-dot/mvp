import Link from 'next/link'
import { Child } from '@/lib/types'
import { formatDuration, levelLabel } from '@/lib/utils'
import StreakCounter from './StreakCounter'

interface Props {
  child: Child
}

export default function ChildCard({ child }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Avatar + name */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            {child.name[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{child.name}</h3>
            <p className="text-xs text-gray-400">Grade {child.grade} • Age {child.age}</p>
          </div>
        </div>
        <StreakCounter streak={child.streak_current} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{child.total_sessions}</p>
          <p className="text-xs text-gray-400">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{child.total_vocab_count}</p>
          <p className="text-xs text-gray-400">Words</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">Lvl {child.proficiency_level}</p>
          <p className="text-xs text-gray-400">{levelLabel(child.proficiency_level)}</p>
        </div>
      </div>

      {/* Level bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Level {child.proficiency_level}</span>
          <span>Level 5</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all"
            style={{ width: `${(child.proficiency_level / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link
          href={`/session/${child.id}`}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Start Session
        </Link>
        <Link
          href={`/dashboard/child/${child.id}`}
          className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 text-center text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Progress
        </Link>
      </div>
    </div>
  )
}
