# Technical Architecture
# AI English Speaking Coach — MVP

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Next.js  │  │ Web Speech   │  │ SpeechSynthesis   │ │
│  │ Frontend │  │ API (STT)    │  │ API (TTS)         │ │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘ │
│       │               │                    │            │
└───────┼───────────────┼────────────────────┼────────────┘
        │               │                    │
        ▼               ▼                    ▲
┌───────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                      │
│                                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────┐ │
│  │ Conversation│ │ Session    │ │ Report             │ │
│  │ Engine     │ │ Manager    │ │ Generator          │ │
│  └─────┬──────┘ └─────┬──────┘ └─────────┬──────────┘ │
│        │              │                   │            │
│  ┌─────▼──────────────▼───────────────────▼──────────┐ │
│  │              LLM Service Layer                     │ │
│  │         (Groq / Gemini / GPT-3.5)                 │ │
│  └────────────────────┬──────────────────────────────┘ │
│                       │                                │
└───────────────────────┼────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│                  DATABASE (Supabase)                    │
│                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Users    │ │ Children │ │ Sessions │ │ Vocab    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└───────────────────────────────────────────────────────┘
```

## 2. Technology Stack

| Layer | Technology | Cost | Why This Choice |
|-------|-----------|------|-----------------|
| Frontend | Next.js 14 (App Router) | Free | Fast development, SSR, great DX, easy Vercel deploy |
| Hosting (Frontend) | Vercel (Hobby) | Free | Auto-deploy from GitHub, SSL, CDN, custom domain |
| Backend | Python FastAPI | Free | Async support for API calls, simple, fast |
| Hosting (Backend) | Railway ($5/mo free credit) | Free | Easy Python deploy, environment variables, logging |
| Database | Supabase (Free tier) | Free | 500MB storage, auth built-in, real-time, REST API |
| Auth | Supabase Auth | Free | Email/password + Google OAuth, session management |
| LLM (Primary) | Groq API (Llama 3.1 70B) | Free | Fastest inference, free tier generous, good quality |
| LLM (Fallback) | Google Gemini 1.5 Flash | Free | 60 RPM free, good quality, reliable |
| Speech-to-Text | Web Speech API (browser) | Free | No API key, works in Chrome/Edge, good for English |
| Text-to-Speech | Browser SpeechSynthesis | Free | No API key, instant, acceptable quality |
| TTS (Upgrade) | Google Cloud TTS | Free | 1M chars/month free, better voice quality |

## 3. Component Details

### 3.1 Frontend (Next.js)

**Pages:**
- `/` — Landing page (product info, sign up, pricing)
- `/login` — Parent login
- `/dashboard` — Parent dashboard (child profiles, session history, reports)
- `/dashboard/child/[id]` — Individual child progress view
- `/dashboard/child/[id]/sessions/[sessionId]` — Session transcript view
- `/session/[childId]` — Active conversation interface (child-facing)

**Key Frontend Components:**
- `MicrophoneButton` — Handles Web Speech API recording, visual states (listening/idle)
- `ConversationView` — Displays conversation messages, typing indicators
- `TopicSelector` — Visual menu for choosing conversation topics
- `VocabularyJournal` — Browsable word list with search
- `StreakCounter` — Current streak display with animation
- `SessionReport` — Post-session summary card
- `ProgressChart` — Weekly/monthly progress visualisation
- `QuizView` — End-of-session verbal quiz interface

**State Management:** React useState/useReducer (no external state library needed for MVP)

### 3.2 Backend (FastAPI)

**API Endpoints:**

```
POST /api/auth/signup          — Create parent account
POST /api/auth/login           — Parent login
POST /api/children             — Create child profile
GET  /api/children/{id}        — Get child profile + learning data

POST /api/sessions/start       — Start new conversation session
POST /api/sessions/{id}/message — Send child's message, get AI response
POST /api/sessions/{id}/end    — End session, trigger report generation

GET  /api/sessions/{childId}           — List all sessions for a child
GET  /api/sessions/{id}/transcript     — Full conversation transcript
GET  /api/sessions/{id}/report         — Session report

GET  /api/vocabulary/{childId}         — Get vocabulary journal
GET  /api/progress/{childId}           — Get progress data (weekly/monthly)
GET  /api/progress/{childId}/weekly    — Weekly progress report

POST /api/goals                        — Parent sets a goal
GET  /api/goals/{childId}              — Get active goals + progress
```

**Core Backend Services:**

1. **ConversationEngine** — Manages the conversation flow. Builds the system prompt with child context, learning profile, conversation history, and session plan. Calls LLM API. Parses response. Extracts vocabulary and grammar observations. Returns response text.

2. **SessionManager** — Handles session lifecycle. Creates session records. Tracks session state (opening, core, vocabulary, closing, quiz). Enforces 15-minute limit. Stores all messages.

3. **LearningProfileService** — Maintains the child's dynamic learning profile. Updates vocabulary tracking, grammar pattern observations, difficulty level, and interests after each session. Generates the session plan for the next conversation.

4. **ReportGenerator** — Generates post-session reports and weekly summaries by calling the LLM with the session transcript and a reporting prompt. Stores reports in database.

5. **VocabularyService** — Extracts new vocabulary from conversations. Stores with context. Tracks retention (was the word used correctly in a later session?). Flags words for review.

6. **SafetyFilter** — Pre-screens AI outputs for age-inappropriate content. Checks against keyword lists and uses LLM judgment. Blocks and regenerates if unsafe content detected.

### 3.3 Database (Supabase)

**Tables:**

```sql
-- Parent accounts (handled by Supabase Auth)
-- Additional parent profile data:
parents (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  name TEXT,
  language TEXT DEFAULT 'en',  -- parent interface language
  created_at TIMESTAMP
)

children (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES parents(id),
  name TEXT,
  age INTEGER,
  grade INTEGER,
  native_language TEXT DEFAULT 'zh',
  proficiency_level INTEGER DEFAULT 1,  -- 1-5
  interests TEXT[],  -- extracted from conversations
  streak_current INTEGER DEFAULT 0,
  streak_last_date DATE,
  total_sessions INTEGER DEFAULT 0,
  total_speaking_minutes DECIMAL DEFAULT 0,
  created_at TIMESTAMP
)

sessions (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  topic TEXT,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes DECIMAL,
  difficulty_level INTEGER,
  vocab_introduced TEXT[],
  quiz_score INTEGER,  -- out of 3
  summary TEXT,  -- AI-generated parent summary
  created_at TIMESTAMP
)

messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  role TEXT,  -- 'child' or 'ai'
  content TEXT,
  timestamp TIMESTAMP
)

vocabulary (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  word TEXT,
  definition TEXT,
  example_sentence TEXT,
  introduced_in_session UUID REFERENCES sessions(id),
  times_used_later INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP
)

goals (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  type TEXT,  -- 'sessions_per_week' or 'words_per_month'
  target INTEGER,
  current INTEGER DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP
)

progress_snapshots (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  week_start DATE,
  sessions_count INTEGER,
  speaking_minutes DECIMAL,
  new_vocab_count INTEGER,
  quiz_avg_score DECIMAL,
  difficulty_level INTEGER,
  created_at TIMESTAMP
)
```

## 4. Voice Pipeline Flow

```
1. Child taps mic button
   │
2. Browser Web Speech API starts listening
   │
3. Child speaks in English
   │
4. Web Speech API converts to text (real-time, on-device)
   │
5. Text sent to backend: POST /api/sessions/{id}/message
   │
6. Backend builds LLM prompt:
   ├── System prompt (tutor persona, pedagogical rules, safety)
   ├── Child profile (level, interests, weak areas)
   ├── Session plan (today's focus, target vocabulary)
   ├── Last 3 sessions' context summary
   └── Current session messages
   │
7. LLM API call (Groq/Gemini) → returns response text
   │
8. SafetyFilter checks response
   │
9. ConversationEngine extracts:
   ├── New vocabulary introduced (save to vocab table)
   ├── Grammar observations (update learning profile)
   └── Session state update (advance arc if needed)
   │
10. Response text returned to frontend
    │
11. Browser SpeechSynthesis API speaks the response
    │
12. UI updates: message displayed, state changes to "Listening"
```

**Latency Budget:**
- STT (browser): ~500ms after speech ends
- Backend processing: ~100ms
- LLM inference (Groq): ~500-1000ms
- TTS (browser): ~200ms to start
- **Total target: under 2 seconds end-to-end**

## 5. System Prompt Architecture

The system prompt is composed of multiple sections concatenated at runtime:

```
[BASE PERSONA]
Static. Defines who the AI is, tone, communication style.

[PEDAGOGICAL FRAMEWORK]
Static. Rules for corrections, vocabulary introduction, difficulty progression.

[SAFETY RULES]
Static. Content boundaries, crisis response, topic restrictions.

[CHILD PROFILE]
Dynamic. Loaded from database. Name, age, level, interests, weak areas.

[SESSION PLAN]
Dynamic. Generated before each session. Today's focus areas, target vocabulary, conversation type.

[CONVERSATION HISTORY CONTEXT]
Dynamic. Summary of last 3 sessions' key points.

[CURRENT SESSION MESSAGES]
Dynamic. All messages in the current session.
```

## 6. Deployment Architecture

```
GitHub Repository
    │
    ├── /frontend (Next.js)
    │   └── Auto-deploys to Vercel on push to main
    │
    ├── /backend (FastAPI)
    │   └── Auto-deploys to Railway on push to main
    │
    └── /docs (this documentation)

Vercel (frontend) ──HTTPS──▶ Railway (backend) ──▶ Groq API
                                    │                Gemini API (fallback)
                                    │
                                    ▼
                              Supabase (DB + Auth)
```

## 7. Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (.env):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key (fallback)
GOOGLE_TTS_API_KEY=your-key (if using Google Cloud TTS)
```
