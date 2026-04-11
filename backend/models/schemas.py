from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime, date


# ── Auth ─────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    language: str = "en"

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    token: str


# ── Children ─────────────────────────────────────────────────────────────────

class ChildCreate(BaseModel):
    name: str
    age: int = Field(..., ge=6, le=16)
    grade: int = Field(..., ge=1, le=12)
    native_language: str = "zh"
    proficiency_level: int = Field(default=1, ge=1, le=5)

class ChildSummary(BaseModel):
    id: str
    name: str
    age: int
    proficiency_level: int
    streak_current: int
    total_sessions: int
    total_speaking_minutes: float
    total_vocab_count: int

class ChildDetail(BaseModel):
    id: str
    name: str
    age: int
    grade: int
    proficiency_level: int
    interests: List[str]
    weak_areas: List[str]
    strong_areas: List[str]
    streak_current: int
    streak_longest: int
    total_sessions: int
    total_speaking_minutes: float
    total_vocab_count: int


# ── Sessions ─────────────────────────────────────────────────────────────────

class SessionStart(BaseModel):
    child_id: str
    topic: str = "free_talk"

class SessionPlan(BaseModel):
    topic: str
    target_vocabulary: List[str]
    focus_areas: List[str]
    target_grammar: List[str]
    review_words: List[str]
    difficulty_notes: str = ""

class SessionStartResponse(BaseModel):
    session_id: str
    opening_message: str
    session_plan: SessionPlan

class MessageRequest(BaseModel):
    content: str
    timestamp: Optional[str] = None

class MessageMetadata(BaseModel):
    vocab_introduced: List[str]
    corrections_made: List[str]
    session_phase: str
    message_count: int

class MessageResponse(BaseModel):
    response: str
    metadata: MessageMetadata

class SessionEndRequest(BaseModel):
    reason: str = "completed"

class SessionEndResponse(BaseModel):
    session_id: str
    duration_minutes: float
    vocab_introduced: List[str]
    quiz_score: Optional[int]
    summary: str
    report_url: str

class TranscriptMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str]

class TranscriptResponse(BaseModel):
    session_id: str
    child_name: str
    date: str
    duration_minutes: Optional[float]
    messages: List[TranscriptMessage]

class VocabEntry(BaseModel):
    word: str
    definition: str
    example: str

class GrammarObservations(BaseModel):
    did_well: str
    needs_practice: str

class QuizDetail(BaseModel):
    question: str
    correct: bool
    answer_given: Optional[str]
    correct_answer: Optional[str]

class QuizResults(BaseModel):
    score: str
    details: List[QuizDetail]

class SessionReport(BaseModel):
    session_id: str
    child_name: str
    date: str
    duration_minutes: Optional[float]
    topic: str
    summary: str
    vocabulary: List[VocabEntry]
    grammar_observations: GrammarObservations
    quiz_results: Optional[QuizResults]
    highlight: str
    home_practice: str


# ── Vocabulary ────────────────────────────────────────────────────────────────

class VocabularyWord(BaseModel):
    word: str
    definition: str
    example_sentence: str
    introduced_date: str
    times_used_later: int
    retained: bool

class VocabularyResponse(BaseModel):
    total_count: int
    words: List[VocabularyWord]


# ── Progress ──────────────────────────────────────────────────────────────────

class LevelHistory(BaseModel):
    level: int
    reached_at: str

class ProgressResponse(BaseModel):
    child_name: str
    total_sessions: int
    total_speaking_minutes: float
    total_vocabulary: int
    current_level: int
    level_history: List[LevelHistory]
    current_streak: int
    longest_streak: int
    weekly_avg_sessions: float

class WeeklyProgressResponse(BaseModel):
    week_start: str
    sessions_count: int
    speaking_minutes: float
    new_vocab_count: int
    vocab_retained_from_past: int
    quiz_avg_score: Optional[float]
    level_at_start: int
    level_at_end: int
    summary: str


# ── Goals ─────────────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    child_id: str
    type: str
    target: int

class GoalResponse(BaseModel):
    id: str
    type: str
    target: int
    current: int
    period_start: str
    period_end: str
    on_track: Optional[bool] = None
    achieved: bool = False
