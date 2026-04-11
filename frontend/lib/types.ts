export interface Child {
  id: string
  name: string
  age: number
  grade: number
  proficiency_level: number
  interests: string[]
  weak_areas: string[]
  strong_areas: string[]
  streak_current: number
  streak_longest: number
  total_sessions: number
  total_speaking_minutes: number
  total_vocab_count: number
}

export interface SessionPlan {
  topic: string
  target_vocabulary: string[]
  focus_areas: string[]
  target_grammar: string[]
  review_words: string[]
  difficulty_notes: string
}

export interface SessionStartResponse {
  session_id: string
  opening_message: string
  session_plan: SessionPlan
}

export interface MessageMetadata {
  vocab_introduced: string[]
  corrections_made: string[]
  session_phase: string
  message_count: number
}

export interface MessageResponse {
  response: string
  metadata: MessageMetadata
}

export interface ConversationMessage {
  role: 'child' | 'ai'
  content: string
  timestamp?: string
}

export interface VocabWord {
  word: string
  definition: string
  example_sentence: string
  introduced_date: string
  times_used_later: number
  retained: boolean
}

export interface SessionSummary {
  id: string
  topic: string
  started_at: string
  ended_at?: string
  duration_minutes?: number
  vocab_introduced: string[]
  quiz_score?: number
  summary?: string
}

export interface GrammarObservations {
  did_well: string
  needs_practice: string
}

export interface QuizDetail {
  question: string
  correct: boolean
  answer_given?: string
  correct_answer?: string
}

export interface SessionReport {
  session_id: string
  child_name: string
  date: string
  duration_minutes?: number
  topic: string
  summary: string
  vocabulary: { word: string; definition: string; example: string }[]
  grammar_observations: GrammarObservations
  quiz_results?: { score: string; details: QuizDetail[] }
  highlight: string
  home_practice: string
}

export interface Progress {
  child_name: string
  total_sessions: number
  total_speaking_minutes: number
  total_vocabulary: number
  current_level: number
  level_history: { level: number; reached_at: string }[]
  current_streak: number
  longest_streak: number
  weekly_avg_sessions: number
}

export interface WeeklyProgress {
  week_start: string
  sessions_count: number
  speaking_minutes: number
  new_vocab_count: number
  vocab_retained_from_past: number
  quiz_avg_score?: number
  level_at_start: number
  level_at_end: number
  summary: string
}

export interface Goal {
  id: string
  type: 'sessions_per_week' | 'words_per_month'
  target: number
  current: number
  period_start: string
  period_end: string
  on_track: boolean
  achieved: boolean
}

export const TOPICS = [
  { id: 'my_day', label: 'My Day', emoji: '☀️', description: 'Talk about what happened today' },
  { id: 'hobbies', label: 'My Hobbies', emoji: '🎮', description: 'Share what you love doing' },
  { id: 'story', label: 'Tell a Story', emoji: '📖', description: 'Make up or share a story' },
  { id: 'roleplay', label: 'Role Play', emoji: '🎭', description: 'Pretend to be in a scene' },
  { id: 'free_talk', label: 'Free Talk', emoji: '💬', description: 'Chat about anything' },
  { id: 'describe', label: 'Describe', emoji: '🔍', description: 'Describe something you see' },
] as const

export type TopicId = typeof TOPICS[number]['id']
