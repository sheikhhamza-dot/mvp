import { cn } from '@/lib/utils'

interface Props {
  streak: number
  className?: string
}

export default function StreakCounter({ streak, className }: Props) {
  const isActive = streak > 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('text-2xl', streak >= 7 ? 'animate-bounce-slow' : '')}>
        🔥
      </span>
      <div>
        <p className={cn(
          'font-bold text-lg leading-none',
          isActive ? 'text-orange-500' : 'text-gray-400'
        )}>
          {streak} day{streak !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400">streak</p>
      </div>
    </div>
  )
}
