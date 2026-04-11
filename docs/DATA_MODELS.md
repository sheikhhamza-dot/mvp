# Data Models Specification
# AI English Speaking Coach

## Entity Relationship Overview

```
parents (1) ──── (N) children (1) ──── (N) sessions (1) ──── (N) messages
                      │                      │
                      │                      └──── (1) session_reports
                      │
                      ├──── (N) vocabulary
                      ├──── (N) goals
                      └──── (N) progress_snapshots
```

## Table Definitions

### parents
Extends Supabase Auth user. Stores additional parent profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK to auth.users | Supabase Auth user ID |
| email | TEXT | NOT NULL | Parent email |
| name | TEXT | NOT NULL | Parent display name |
| language | TEXT | DEFAULT 'en' | Interface language (en, zh, hi, es, ja, ko) |
| created_at | TIMESTAMP | DEFAULT now() | Account creation time |

### children
Each child profile belongs to one parent.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Child profile ID |
| parent_id | UUID | FK to parents(id), NOT NULL | Owning parent |
| name | TEXT | NOT NULL | Child's first name |
| age | INTEGER | NOT NULL, CHECK (6-16) | Child's age |
| grade | INTEGER | NOT NULL, CHECK (1-12) | School grade |
| native_language | TEXT | DEFAULT 'zh' | Child's native language |
| proficiency_level | INTEGER | DEFAULT 1, CHECK (1-5) | Current English level |
| interests | TEXT[] | DEFAULT '{}' | Extracted from conversations |
| weak_areas | TEXT[] | DEFAULT '{}' | Grammar/vocab areas needing work |
| strong_areas | TEXT[] | DEFAULT '{}' | Areas of demonstrated competence |
| streak_current | INTEGER | DEFAULT 0 | Current consecutive days |
| streak_last_date | DATE | NULLABLE | Date of last completed session |
| streak_longest | INTEGER | DEFAULT 0 | All-time longest streak |
| total_sessions | INTEGER | DEFAULT 0 | Lifetime session count |
| total_speaking_minutes | DECIMAL | DEFAULT 0 | Lifetime speaking time |
| total_vocab_count | INTEGER | DEFAULT 0 | Total unique words learned |
| created_at | TIMESTAMP | DEFAULT now() | Profile creation time |

### sessions
One record per conversation session.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Session ID |
| child_id | UUID | FK to children(id), NOT NULL | Child who participated |
| topic | TEXT | NOT NULL | Selected topic (my_day, hobbies, story, roleplay, free_talk, describe) |
| difficulty_level | INTEGER | NOT NULL | Level at time of session |
| started_at | TIMESTAMP | DEFAULT now() | Session start time |
| ended_at | TIMESTAMP | NULLABLE | Session end time |
| duration_minutes | DECIMAL | NULLABLE | Computed on end |
| message_count | INTEGER | DEFAULT 0 | Total messages exchanged |
| vocab_introduced | TEXT[] | DEFAULT '{}' | New words introduced this session |
| vocab_reviewed | TEXT[] | DEFAULT '{}' | Past words revisited |
| corrections_made | JSONB | DEFAULT '[]' | Array of {error, correction, type} |
| quiz_score | INTEGER | NULLABLE | Out of 3 |
| quiz_details | JSONB | NULLABLE | Array of {question, correct, answer_given} |
| summary | TEXT | NULLABLE | AI-generated parent summary |
| session_plan | JSONB | NULLABLE | The plan generated at session start |
| end_reason | TEXT | DEFAULT 'completed' | completed, timeout, child_ended, error |

### messages
Individual messages within a session.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Message ID |
| session_id | UUID | FK to sessions(id), NOT NULL | Parent session |
| role | TEXT | NOT NULL, CHECK (child, ai, system) | Who sent the message |
| content | TEXT | NOT NULL | Message text |
| created_at | TIMESTAMP | DEFAULT now() | Message timestamp |

### vocabulary
The child's vocabulary journal. One entry per word per child.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Entry ID |
| child_id | UUID | FK to children(id), NOT NULL | Owning child |
| word | TEXT | NOT NULL | The vocabulary word |
| definition | TEXT | NOT NULL | Simple definition |
| example_sentence | TEXT | NOT NULL | Sentence from the conversation where it was introduced |
| introduced_in_session | UUID | FK to sessions(id) | Session where first introduced |
| introduced_at | DATE | NOT NULL | Date introduced |
| times_used_later | INTEGER | DEFAULT 0 | Times used correctly in subsequent sessions |
| last_used_at | TIMESTAMP | NULLABLE | Most recent use in a session |
| retained | BOOLEAN | DEFAULT false | True if used correctly 3+ times in later sessions |

**Unique constraint:** (child_id, word) — each word appears once per child

### goals
Parent-set goals for each child.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Goal ID |
| child_id | UUID | FK to children(id), NOT NULL | Target child |
| type | TEXT | NOT NULL | sessions_per_week, words_per_month |
| target | INTEGER | NOT NULL | Target number |
| current | INTEGER | DEFAULT 0 | Current progress |
| period_start | DATE | NOT NULL | Goal period start |
| period_end | DATE | NOT NULL | Goal period end |
| achieved | BOOLEAN | DEFAULT false | Whether target was met |
| created_at | TIMESTAMP | DEFAULT now() | When goal was set |

### progress_snapshots
Weekly snapshots for trend tracking. Generated automatically every Sunday.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Snapshot ID |
| child_id | UUID | FK to children(id), NOT NULL | Target child |
| week_start | DATE | NOT NULL | Monday of the snapshot week |
| sessions_count | INTEGER | DEFAULT 0 | Sessions that week |
| speaking_minutes | DECIMAL | DEFAULT 0 | Total speaking time that week |
| new_vocab_count | INTEGER | DEFAULT 0 | New words introduced that week |
| vocab_retained | INTEGER | DEFAULT 0 | Past words successfully reused |
| quiz_avg_score | DECIMAL | NULLABLE | Average quiz score (out of 3) |
| difficulty_level | INTEGER | NOT NULL | Level at end of week |
| summary | TEXT | NULLABLE | AI-generated weekly summary |
| created_at | TIMESTAMP | DEFAULT now() | When snapshot was generated |

**Unique constraint:** (child_id, week_start)

## Indexes

```sql
CREATE INDEX idx_sessions_child ON sessions(child_id, started_at DESC);
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
CREATE INDEX idx_vocabulary_child ON vocabulary(child_id, introduced_at DESC);
CREATE INDEX idx_goals_child_active ON goals(child_id, period_end) WHERE achieved = false;
CREATE INDEX idx_progress_child ON progress_snapshots(child_id, week_start DESC);
```

## Row Level Security (Supabase RLS)

```sql
-- Parents can only access their own data
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY parents_own ON parents FOR ALL USING (id = auth.uid());

-- Parents can only access their children's data
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY children_own ON children FOR ALL USING (parent_id = auth.uid());

-- Cascade through children for all child-related tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_own ON sessions FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY vocab_own ON vocabulary FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_own ON goals FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
```
