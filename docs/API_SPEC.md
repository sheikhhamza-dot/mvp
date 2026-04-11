# API Specification
# AI English Speaking Coach — Backend

## Base URL
`https://your-backend.railway.app/api`

## Authentication
All endpoints except signup/login require a valid Supabase JWT token in the Authorization header:
`Authorization: Bearer <token>`

---

## Auth Endpoints

### POST /auth/signup
Create a new parent account.
```json
// Request
{
  "email": "parent@email.com",
  "password": "securepassword",
  "name": "Wang Li",
  "language": "zh"
}

// Response 201
{
  "id": "uuid",
  "email": "parent@email.com",
  "name": "Wang Li",
  "token": "jwt-token"
}
```

### POST /auth/login
```json
// Request
{ "email": "parent@email.com", "password": "securepassword" }

// Response 200
{ "id": "uuid", "token": "jwt-token" }
```

---

## Children Endpoints

### POST /children
Create a child profile under the authenticated parent.
```json
// Request
{
  "name": "Xiaoming",
  "age": 10,
  "grade": 5,
  "native_language": "zh",
  "proficiency_level": 2
}

// Response 201
{
  "id": "uuid",
  "name": "Xiaoming",
  "age": 10,
  "grade": 5,
  "proficiency_level": 2,
  "streak_current": 0,
  "total_sessions": 0
}
```

### GET /children
List all children under the authenticated parent.
```json
// Response 200
[
  {
    "id": "uuid",
    "name": "Xiaoming",
    "age": 10,
    "proficiency_level": 2,
    "streak_current": 5,
    "total_sessions": 23,
    "total_speaking_minutes": 287.5
  }
]
```

### GET /children/{child_id}
Get full child profile including learning data.
```json
// Response 200
{
  "id": "uuid",
  "name": "Xiaoming",
  "age": 10,
  "grade": 5,
  "proficiency_level": 3,
  "interests": ["basketball", "minecraft", "dogs"],
  "streak_current": 5,
  "total_sessions": 23,
  "total_vocab_count": 145,
  "weak_areas": ["past continuous tense", "articles"],
  "strong_areas": ["present tense", "sports vocabulary"]
}
```

---

## Session Endpoints

### POST /sessions/start
Start a new conversation session.
```json
// Request
{
  "child_id": "uuid",
  "topic": "my_day"  // my_day | hobbies | story | roleplay | free_talk | describe
}

// Response 201
{
  "session_id": "uuid",
  "opening_message": "Hi Xiaoming! It's great to talk to you again. Last time you told me about your basketball game. Did your team practice this week?",
  "session_plan": {
    "topic": "my_day",
    "target_vocabulary": ["exhausted", "schedule", "practice"],
    "focus_areas": ["past tense consistency"],
    "review_words": ["enormous", "fascinating"]
  }
}
```

### POST /sessions/{session_id}/message
Send child's spoken message, receive AI response.
```json
// Request
{
  "content": "Today I go to school and my teacher give us a lot of homework",
  "timestamp": "2025-04-11T14:23:00Z"
}

// Response 200
{
  "response": "Oh, you went to school and your teacher gave you lots of homework! That sounds like a busy day. What subject was the homework for?",
  "metadata": {
    "vocab_introduced": [],
    "corrections_made": ["go→went (recast)", "give→gave (recast)"],
    "session_phase": "core",
    "message_count": 4
  }
}
```

### POST /sessions/{session_id}/end
End the session and trigger report generation.
```json
// Request
{ "reason": "completed" }  // completed | timeout | child_ended

// Response 200
{
  "session_id": "uuid",
  "duration_minutes": 12.5,
  "vocab_introduced": ["exhausted", "schedule"],
  "quiz_score": 2,  // out of 3
  "summary": "Today Xiaoming talked about his school day. He learned the words 'exhausted' and 'schedule.' His past tense usage improved — he self-corrected twice. He scored 2/3 on the quiz. Suggested focus: continue practicing irregular past tense verbs.",
  "report_url": "/api/sessions/{session_id}/report"
}
```

### GET /sessions/{session_id}/transcript
Get full conversation transcript.
```json
// Response 200
{
  "session_id": "uuid",
  "child_name": "Xiaoming",
  "date": "2025-04-11",
  "duration_minutes": 12.5,
  "messages": [
    { "role": "ai", "content": "Hi Xiaoming! How was your day?", "timestamp": "..." },
    { "role": "child", "content": "Today I go to school and...", "timestamp": "..." },
    { "role": "ai", "content": "Oh, you went to school...", "timestamp": "..." }
  ]
}
```

### GET /sessions/{session_id}/report
Get the parent-facing session report.
```json
// Response 200
{
  "session_id": "uuid",
  "child_name": "Xiaoming",
  "date": "2025-04-11",
  "duration_minutes": 12.5,
  "topic": "My Day",
  "summary": "Xiaoming talked about his school day and homework...",
  "vocabulary": [
    { "word": "exhausted", "definition": "very very tired", "example": "I was exhausted after basketball practice" },
    { "word": "schedule", "definition": "a plan for when things happen", "example": "My schedule is very busy this week" }
  ],
  "grammar_observations": {
    "did_well": "Used present tense correctly throughout",
    "needs_practice": "Irregular past tense (go→went, give→gave) — used recasting corrections"
  },
  "quiz_results": {
    "score": "2/3",
    "details": [
      { "question": "What does 'exhausted' mean?", "correct": true },
      { "question": "Use 'schedule' in a sentence", "correct": true },
      { "question": "What is the past tense of 'give'?", "correct": false, "answer_given": "gived", "correct_answer": "gave" }
    ]
  },
  "highlight": "Xiaoming self-corrected his past tense twice without prompting — a great sign of growing awareness!",
  "home_practice": "Practice irregular past tense with Xiaoming: go→went, give→gave, take→took, make→made. Ask him to tell you about yesterday using these words."
}
```

---

## Vocabulary Endpoints

### GET /vocabulary/{child_id}
Get the child's vocabulary journal.
```json
// Query params: ?sort=date|alpha&limit=50&offset=0

// Response 200
{
  "total_count": 145,
  "words": [
    {
      "word": "exhausted",
      "definition": "very very tired",
      "example_sentence": "I was exhausted after basketball practice",
      "introduced_date": "2025-04-11",
      "times_used_later": 3,
      "retained": true
    }
  ]
}
```

---

## Progress Endpoints

### GET /progress/{child_id}
Get overall progress data.
```json
// Response 200
{
  "child_name": "Xiaoming",
  "total_sessions": 23,
  "total_speaking_minutes": 287.5,
  "total_vocabulary": 145,
  "current_level": 3,
  "level_history": [
    { "level": 1, "reached_at": "2025-03-01" },
    { "level": 2, "reached_at": "2025-03-15" },
    { "level": 3, "reached_at": "2025-04-05" }
  ],
  "current_streak": 5,
  "longest_streak": 12,
  "weekly_avg_sessions": 4.2
}
```

### GET /progress/{child_id}/weekly
Get weekly progress report.
```json
// Query params: ?week=2025-04-07 (Monday of the week)

// Response 200
{
  "week_start": "2025-04-07",
  "sessions_count": 5,
  "speaking_minutes": 62.3,
  "new_vocab_count": 12,
  "vocab_retained_from_past": 8,
  "quiz_avg_score": 2.4,
  "level_at_start": 3,
  "level_at_end": 3,
  "summary": "Xiaoming had a strong week with 5 sessions totaling over an hour of English speaking practice. He learned 12 new words and retained 8 words from previous weeks. His past tense usage continues to improve. Next week we'll focus on expanding descriptive vocabulary and introducing basic conditional sentences."
}
```

---

## Goals Endpoints

### POST /goals
Parent sets a goal for their child.
```json
// Request
{
  "child_id": "uuid",
  "type": "sessions_per_week",
  "target": 5
}

// Response 201
{
  "id": "uuid",
  "type": "sessions_per_week",
  "target": 5,
  "current": 0,
  "period_start": "2025-04-07",
  "period_end": "2025-04-13"
}
```

### GET /goals/{child_id}
Get active goals and progress.
```json
// Response 200
[
  {
    "id": "uuid",
    "type": "sessions_per_week",
    "target": 5,
    "current": 3,
    "period_start": "2025-04-07",
    "period_end": "2025-04-13",
    "on_track": true
  }
]
```
