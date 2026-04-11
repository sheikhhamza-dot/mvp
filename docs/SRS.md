# Software Requirements Specification (SRS)
# AI English Speaking Coach — MVP

## 1. Functional Requirements

### 1.1 Authentication & User Management

- FR-101: Parent can sign up with email/password or Google OAuth
- FR-102: Parent can create up to 3 child profiles under one account
- FR-103: Each child profile stores name, age, grade, native language, and English proficiency level (beginner/intermediate)
- FR-104: Child accesses the app through a simplified interface — no login required once device is set up
- FR-105: Parent can view and manage all child profiles from their dashboard

### 1.2 Voice Conversation

- FR-201: Child taps a microphone button to start speaking
- FR-202: App captures audio and converts to text using Web Speech API (browser-based STT)
- FR-203: If Web Speech API is unavailable (unsupported browser), show a message directing user to Chrome/Edge
- FR-204: Transcribed text is sent to backend along with conversation history and child profile context
- FR-205: Backend calls LLM API with system prompt + conversation history + child learning profile
- FR-206: LLM response is converted to speech using browser SpeechSynthesis API or Google Cloud TTS free tier
- FR-207: Audio response plays automatically after generation
- FR-208: Visual indicators show conversation state: "Listening" (mic active), "Thinking" (processing), "Speaking" (audio playing)
- FR-209: Child can interrupt the AI by tapping the mic button while AI is speaking
- FR-210: Session auto-ends after 15 minutes with a closing message, or child can end manually

### 1.3 Conversation Memory

- FR-301: All messages (child and AI) are stored per session in the database
- FR-302: The last 3 sessions' key context (topics, vocabulary, child's interests) is included in the LLM system prompt
- FR-303: AI references past conversations naturally when relevant
- FR-304: Child's stated interests and preferences are extracted and stored in their profile for future use

### 1.4 Session Structure

- FR-401: Each session follows an arc: opening → core conversation → vocabulary introduction → closing
- FR-402: Opening: AI greets child by name, references last session or asks about their day
- FR-403: Core: conversation follows the child's chosen topic or AI-selected topic based on learning gaps
- FR-404: Vocabulary: AI introduces 1-3 new words in context during the conversation
- FR-405: Closing: AI summarises what was practiced, encourages the child, previews next session
- FR-406: Session metadata is stored: start time, end time, duration, topic, vocabulary introduced

### 1.5 Topic Selection

- FR-501: Before starting a session, child sees a visual topic menu
- FR-502: Topics available: My Day, My Hobbies, Tell a Story, Role Play, Free Talk, Describe Something
- FR-503: Selected topic is passed to the system prompt to guide conversation direction
- FR-504: AI still targets the child's weak areas within the chosen topic

### 1.6 Vocabulary Journal

- FR-601: Every new word introduced by the AI is saved to the child's vocabulary journal
- FR-602: Each entry stores: word, definition (simple), example sentence from the conversation, date introduced
- FR-603: Child can browse their vocabulary journal sorted by date or alphabetically
- FR-604: AI periodically uses past vocabulary in new conversations to test retention
- FR-605: Vocabulary journal shows total word count as a growing number

### 1.7 Streak Tracking

- FR-701: Track consecutive days with at least one completed session
- FR-702: Display current streak prominently on child's home screen
- FR-703: AI acknowledges streaks in conversation ("7 days in a row! You're on fire!")
- FR-704: After a missed day, show encouragement to start a new streak (not guilt)

### 1.8 Adaptive Difficulty

- FR-801: Track child's proficiency across vocabulary range, grammar complexity, and response length
- FR-802: Define 5 difficulty levels with specific parameters (vocabulary tier, sentence complexity, speech speed, topics)
- FR-803: System automatically adjusts level based on performance over the last 5 sessions
- FR-804: Level changes are logged and visible to parents
- FR-805: AI's language complexity, vocabulary, and topic sophistication adjust to match the child's current level

### 1.9 End-of-Session Quiz

- FR-901: After the closing, AI asks 3 verbal questions about vocabulary or grammar from that session
- FR-902: Child answers by speaking
- FR-903: AI evaluates responses and gives encouraging feedback
- FR-904: Quiz results (correct/incorrect per question) are stored and included in the session report

### 1.10 Parent Dashboard & Reports

- FR-1001: Parent sees a list of all sessions with date, duration, topic, and summary
- FR-1002: Post-session report includes: topics covered, new vocabulary with definitions, grammar observations, quiz results, AI recommendations
- FR-1003: Weekly progress view: total sessions, total speaking time, new vocabulary count, streak status, difficulty level
- FR-1004: Parent can read full conversation transcripts of any session
- FR-1005: Parent can set simple goals for their child (sessions per week, words per month)
- FR-1006: Goal progress is tracked and displayed

### 1.11 Safety & Content

- FR-1101: System prompt explicitly prohibits age-inappropriate content, violence, sexual content, and personal data solicitation
- FR-1102: AI redirects off-topic or inappropriate conversation attempts back to English practice
- FR-1103: If child expresses distress or mentions harm, AI responds with care and suggests talking to a parent or trusted adult
- FR-1104: All AI outputs pass through a content safety check before being spoken

## 2. Non-Functional Requirements

### 2.1 Performance

- NFR-01: Voice-to-response latency must be under 3 seconds for conversational feel
- NFR-02: App must load in under 2 seconds on 4G connection
- NFR-03: Audio playback must start within 1 second of response generation

### 2.2 Scalability

- NFR-04: Architecture must support up to 1,000 concurrent sessions without degradation
- NFR-05: Database queries must return in under 200ms for all user-facing operations

### 2.3 Security & Privacy

- NFR-06: All data transmitted over HTTPS
- NFR-07: Conversation data encrypted at rest in database
- NFR-08: Child's personal information (name, age) accessible only to parent account
- NFR-09: No conversation data shared with third parties
- NFR-10: Parent can delete child's data at any time (all conversations, vocabulary, progress)

### 2.4 Compatibility

- NFR-11: Web app must work on Chrome and Edge (Web Speech API requirement)
- NFR-12: Responsive design for mobile phones, tablets, and desktop
- NFR-13: Minimum supported screen size: 320px width (iPhone SE)

### 2.5 Availability

- NFR-14: 99% uptime target (acceptable for MVP stage)
- NFR-15: Graceful error handling when LLM API or TTS service is unavailable
