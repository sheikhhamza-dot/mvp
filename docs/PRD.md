# Product Requirements Document (PRD)
# AI English Speaking Coach for Grade 4-8 Students

## 1. Product Overview

An AI-powered personalised English speaking coach that conducts voice conversations adapted to each child's level and interests. The AI analyses grammar, vocabulary, fluency, and comprehension in real-time, corrects mistakes naturally within conversation, introduces new vocabulary by steering toward weak areas, and progressively increases difficulty as the student improves. It generates personalised reports for parents and builds a dynamic learning profile unique to each child.

## 2. Target Users

**Primary User (Child):** Grade 4-8 students (ages 8-14) learning English as a second language. Initial market: Chinese students, expandable to any non-English-speaking country.

**Primary Buyer (Parent):** Parents of the target students. They evaluate the product based on visible progress evidence, not the child's subjective enjoyment alone.

**Secondary Influencer (Teacher):** English teachers who may recommend the product to parents.

## 3. Problem Statement

K-12 students study English for years but cannot speak it. Classroom time gives each student 2-3 minutes of speaking practice per week. Private tutors cost ¥200-500/hour. Existing apps (Duolingo, Liulishuo) focus on text-based drills, not conversation. There is no affordable, always-available, adaptive conversation partner that lets a child practice speaking at their level.

## 4. Core Value Proposition

A private English speaking tutor that costs ¥69/month instead of ¥300/hour, is available anytime, never loses patience, remembers everything about your child, and gets smarter about their specific needs every session.

## 5. MVP Features (In Priority Order)

### P0 — Must Have for Launch

1. **Voice Conversation Loop**
   - Child taps to speak, AI listens via speech-to-text
   - LLM generates contextual response as English tutor
   - Response played back as natural speech via TTS
   - Conversation flows for 10-15 minutes per session

2. **Conversation Memory & Continuity**
   - AI remembers past sessions (topics discussed, child's interests, vocabulary introduced)
   - References previous conversations naturally ("Last time you told me about your dog. How is Max doing?")

3. **Session Structure**
   - Opening: greeting, recap of last session
   - Core: conversation on chosen or AI-selected topic
   - Vocabulary: 1-3 new words introduced in context
   - Closing: encouragement, preview of next session

4. **Topic Selection**
   - Child chooses from visual menu: My Day, My Hobbies, Tell a Story, Role Play, Free Talk
   - AI adapts session plan based on selection while targeting weak areas

5. **Post-Session Report for Parents**
   - Auto-generated summary: topics covered, new vocabulary, grammar observations, session duration
   - Displayed in parent dashboard and optionally sent via email

6. **Safety & Content Layer**
   - AI never generates age-inappropriate content
   - Redirects off-topic or inappropriate conversation attempts
   - No personal data collection beyond what's needed for the product

7. **User Authentication**
   - Parent creates account (email/password or Google OAuth)
   - Parent creates child profile(s) under their account
   - Child accesses via simple interface (no login required once set up on device)

### P1 — Add Within First 2 Weeks Post-Launch

8. **Vocabulary Journal**
   - Every new word saved with sentence context, definition, and date introduced
   - Child can browse their growing word collection
   - AI revisits old vocabulary in future sessions to test retention

9. **Streak Tracking**
   - Daily practice streak counter visible to child
   - AI acknowledges streaks and encourages consistency

10. **Adaptive Difficulty**
    - Track child's level across vocabulary range, grammar complexity, and fluency
    - Progressively increase AI's language complexity as child improves
    - Show level progression to parents ("Moved from Level 2 to Level 3 this week")

11. **End-of-Session Quiz**
    - 3 verbal questions on vocabulary/grammar from that session
    - AI evaluates spoken answers and gives encouraging feedback
    - Results included in parent report

12. **Weekly Progress Report**
    - Aggregated view: total speaking time, sessions completed, vocabulary growth, topics covered
    - Trends over time (vocabulary count, session frequency, level progression)

### P2 — Add When User Base Grows

13. **Parent-Set Goals** ("Practice 5 times this week," "Learn 10 new words this month")
14. **Conversation Transcript Access** for parents
15. **Multi-Language Parent Interface** (Chinese, Hindi, Spanish, Japanese, Korean)
16. **Pronunciation Assessment** (integrate Azure/SpeechAce when revenue supports it)

## 6. Out of Scope for MVP

- Gamification (points, badges, leaderboards)
- Social features (competing with friends)
- Curriculum alignment to specific school textbooks
- Video or avatar animation
- Native mobile app (web-first)
- Teacher dashboard
- Group conversation practice

## 7. Business Model

**Free Tier:** 3 sessions per week, basic session summaries, conversation memory.

**Paid Tier (¥69/month):** Unlimited sessions, full progress reports, weekly summaries, vocabulary journal, adaptive curriculum, parent goal-setting, conversation transcripts.

**Free Trial:** 7-14 days of full paid access for new sign-ups.

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Day 1 return rate | >40% |
| Day 7 return rate | >20% |
| Average session length | 8-15 minutes |
| Sessions per user per week | 3+ |
| Free-to-paid conversion | 8-15% |
| Parent satisfaction (survey) | >4/5 |
| Monthly active users (capstone) | 5,000 |

## 9. Assumptions & Risks

**Assumptions:**
- Web Speech API is accurate enough for accented English from children (fallback: Whisper API)
- Free-tier LLM APIs (Groq/Gemini) provide sufficient quality for tutoring conversations
- Parents will pay ¥69/month for a product that demonstrably improves their child's speaking

**Risks:**
- Voice latency too high for natural conversation feel (mitigation: use Groq for fast inference, stream TTS)
- Children lose interest after novelty wears off (mitigation: varied conversation types, streak mechanics, adaptive difficulty)
- Parents can't see enough progress to justify payment (mitigation: detailed session reports, weekly progress, vocabulary journal)
