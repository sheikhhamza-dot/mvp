import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)}s`
  if (minutes < 60) return `${Math.round(minutes)}m`
  return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function levelLabel(level: number): string {
  return ['', 'Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced'][level] || 'Unknown'
}

export function topicLabel(topic: string): string {
  const labels: Record<string, string> = {
    my_day: 'My Day', hobbies: 'My Hobbies', story: 'Tell a Story',
    roleplay: 'Role Play', free_talk: 'Free Talk', describe: 'Describe Something',
  }
  return labels[topic] || topic
}
