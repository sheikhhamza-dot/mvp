# Development Roadmap
# AI English Speaking Coach — MVP Build Plan

## Week 1: Core Voice Loop

### Day 1-2: Project Setup
- [ ] Create GitHub repository with `/frontend` and `/backend` directories
- [ ] Initialize Next.js app in `/frontend`
- [ ] Initialize FastAPI app in `/backend`
- [ ] Create Supabase project, set up database tables (see ARCHITECTURE.md)
- [ ] Deploy frontend to Vercel (connect GitHub repo)
- [ ] Deploy backend to Railway (connect GitHub repo)
- [ ] Configure environment variables on both platforms
- [ ] Verify end-to-end: frontend loads from Vercel, calls backend on Railway, backend connects to Supabase

### Day 3-4: Microphone & Speech-to-Text
- [ ] Build `MicrophoneButton` component using Web Speech API
- [ ] Handle browser permissions for microphone access
- [ ] Display real-time transcription as the child speaks
- [ ] Handle edge cases: no mic permission, unsupported browser, silence timeout
- [ ] Build visual states: idle (tap to speak), listening (pulsing), processing (loading)

### Day 5-7: LLM Integration & TTS
- [ ] Set up Groq API client in backend
- [ ] Write initial system prompt (see SYSTEM_PROMPT_SPEC.md — start with Base Persona + Safety Rules only)
- [ ] Build `/api/sessions/start` and `/api/sessions/{id}/message` endpoints
- [ ] Frontend sends transcribed text to backend, receives AI response
- [ ] Implement browser SpeechSynthesis for TTS playback
- [ ] Select a warm, clear voice from available browser voices
- [ ] Build the full loop: child speaks → text → LLM → response text → spoken response
- [ ] Test the loop 20-30 times yourself, refine the system prompt

**Week 1 Deliverable:** A working voice conversation between a user and the AI tutor. Raw, unstructured, but functional.

---

## Week 2: Educational Intelligence

### Day 8-9: System Prompt Engineering
- [ ] Add Pedagogical Framework to system prompt (correction strategies, vocabulary introduction rules)
- [ ] Add Child Profile section (dynamic — loaded from database)
- [ ] Test 50+ conversation scenarios covering: normal chat, grammar errors, vocabulary gaps, child going off-topic, child giving one-word answers, child being silent
- [ ] Refine prompt until corrections feel natural and encouraging, not robotic

### Day 10-11: Conversation Memory
- [ ] Store all messages in Supabase `messages` table
- [ ] After each session, extract key context (topics, interests, vocabulary) via LLM call
- [ ] Store extracted context in child profile
- [ ] Build context injection: load last 3 sessions' summaries into system prompt
- [ ] Test: start a new session, verify the AI references something from a previous conversation

### Day 12-13: Session Structure
- [ ] Implement session state machine: opening → core → vocabulary → closing
- [ ] Backend tracks current phase and includes phase-appropriate instructions in the prompt
- [ ] Opening: AI greets by name, references last session
- [ ] Core: follows chosen topic while targeting weak areas
- [ ] Vocabulary: AI introduces 1-3 target words naturally
- [ ] Closing: AI summarises, encourages, previews next time
- [ ] Implement 15-minute session timeout with graceful closing

### Day 14: Topic Selection
- [ ] Build `TopicSelector` component with visual menu (icons + labels)
- [ ] Topics: My Day, My Hobbies, Tell a Story, Role Play, Free Talk, Describe Something
- [ ] Selected topic passed to backend and incorporated into session plan
- [ ] Test each topic type to ensure the AI adapts conversation appropriately

**Week 2 Deliverable:** AI tutor that remembers past sessions, follows a structured conversation arc, adapts to chosen topics, and corrects English naturally. Test with 2-3 real children if possible.

---

## Week 3: Progress Tracking & Parent Experience

### Day 15-16: Post-Session Reports
- [ ] After session ends, call LLM with transcript + report generation prompt
- [ ] Generate structured report: summary, vocabulary, grammar observations, highlight, home practice suggestion
- [ ] Store report in database linked to session
- [ ] Build session report view in parent dashboard

### Day 17-18: Vocabulary Journal
- [ ] Extract vocabulary from each session (LLM identifies new words introduced)
- [ ] Store in `vocabulary` table with word, definition, example sentence, date
- [ ] Build `VocabularyJournal` component: browsable list, search, total count display
- [ ] Add retention tracking: flag when a past word is used correctly in a new session

### Day 19: Streak & Adaptive Difficulty
- [ ] Implement streak logic: check last session date on session start, increment or reset
- [ ] Display streak counter on child home screen
- [ ] Add streak acknowledgment to system prompt ("mention the child's streak if it's 3+ days")
- [ ] Implement difficulty levels 1-5 with defined parameters (vocabulary range, grammar complexity, sentence length)
- [ ] Auto-adjust level based on performance over last 5 sessions
- [ ] Log level changes, display to parent

### Day 20-21: Weekly Progress & Parent Dashboard
- [ ] Build progress aggregation: compute weekly stats from session data
- [ ] Generate weekly summary via LLM call (or template-based)
- [ ] Build parent dashboard: list of children, session history, reports, vocabulary count, streak, level
- [ ] Build weekly progress view with trends

**Week 3 Deliverable:** Complete parent experience — session reports, vocabulary journal, streak tracking, difficulty progression, and weekly progress. Parents can see exactly what their child is learning.

---

## Week 4: Polish, Safety & Launch Prep

### Day 22-23: End-of-Session Quiz
- [ ] At session close, AI asks 3 verbal quiz questions about that session's content
- [ ] Child answers by speaking, AI evaluates and responds encouragingly
- [ ] Store quiz results (score out of 3, per-question details)
- [ ] Include quiz results in session report

### Day 24: Safety & Edge Cases
- [ ] Test all safety scenarios: inappropriate topics, distressed child, attempts to break the AI, silence, gibberish input
- [ ] Verify content filtering catches edge cases
- [ ] Test browser compatibility (Chrome, Edge — document Safari/Firefox limitations)
- [ ] Test on mobile browsers (responsive design check)
- [ ] Handle API failures gracefully (Groq down → try Gemini fallback → show friendly error)

### Day 25: Authentication & Multi-Child
- [ ] Implement Supabase Auth (email/password + Google OAuth)
- [ ] Build sign-up and login flows
- [ ] Build child profile creation (parent adds child with name, age, grade)
- [ ] Test multi-child: parent switches between children, each has separate history and progress

### Day 26: Parent Goals & Transcripts
- [ ] Build goal setting UI (sessions per week / words per month)
- [ ] Implement goal tracking and display
- [ ] Build conversation transcript view (read-only for parents)

### Day 27: UX Polish
- [ ] Child-facing interface: large buttons, warm colors, visual feedback (animations on streaks, quiz success)
- [ ] Loading states for all async operations
- [ ] Empty states (first session, no vocabulary yet, no reports yet)
- [ ] Error states with friendly messages

### Day 28: Launch
- [ ] Final end-to-end test: sign up → create child → run full session → view report → check vocabulary → verify streak
- [ ] Deploy final version
- [ ] Prepare 3-5 families for initial testing
- [ ] Ship it

**Week 4 Deliverable:** Complete, polished MVP ready for real users. Auth, multi-child support, quizzes, safety tested, parent goals, transcripts, and responsive design.

---

## Post-Launch Priority Queue

Features to build based on user feedback, in likely priority order:

1. **Multi-language parent interface** (Chinese first, then Hindi, Spanish)
2. **Email session reports** (send report to parent's email after each session)
3. **Pronunciation assessment** (integrate Azure/SpeechAce when revenue supports the cost)
4. **Monthly milestone reports**
5. **Referral system** (invite link, reward for both referrer and new user)
6. **Subscription payment** (Stripe for global, Taobao for China)
7. **PWA support** (installable on phone, push notifications for reminders)
8. **Teacher dashboard** (view student progress across a class)

---

## Cost Tracking

| Service | Free Tier Limit | When You'll Hit It | Upgrade Cost |
|---------|----------------|-------------------|--------------|
| Vercel | 100GB bandwidth/month | ~5,000-10,000 users | $20/month Pro |
| Railway | $5/month credit | ~500 concurrent users | $5-20/month |
| Supabase | 500MB, 50K MAU | ~2,000-3,000 users | $25/month Pro |
| Groq | 30 RPM, 14,400 RPD | ~200 sessions/day | $0.05-0.10/session |
| Gemini | 60 RPM | ~500 sessions/day | $0.01-0.03/session |
| Google TTS | 1M chars/month | ~1,000 sessions/month | $4/1M chars |

**Estimated monthly cost at 5,000 users:** $50-150/month (well within revenue from even 100 paying subscribers at ¥69/month)
