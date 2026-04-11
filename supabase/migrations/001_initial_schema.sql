-- ============================================================
-- AI English Speaking Coach — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Parents table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 6 AND 16),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 12),
  native_language TEXT DEFAULT 'zh',
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  interests TEXT[] DEFAULT '{}',
  weak_areas TEXT[] DEFAULT '{}',
  strong_areas TEXT[] DEFAULT '{}',
  streak_current INTEGER DEFAULT 0,
  streak_last_date DATE,
  streak_longest INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_speaking_minutes DECIMAL DEFAULT 0,
  total_vocab_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes DECIMAL,
  message_count INTEGER DEFAULT 0,
  vocab_introduced TEXT[] DEFAULT '{}',
  vocab_reviewed TEXT[] DEFAULT '{}',
  corrections_made JSONB DEFAULT '[]',
  quiz_score INTEGER,
  quiz_details JSONB,
  summary TEXT,
  session_plan JSONB,
  end_reason TEXT DEFAULT 'completed'
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('child', 'ai', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  example_sentence TEXT NOT NULL,
  introduced_in_session UUID REFERENCES sessions(id),
  introduced_at DATE NOT NULL DEFAULT CURRENT_DATE,
  times_used_later INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  retained BOOLEAN DEFAULT FALSE,
  UNIQUE (child_id, word)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sessions_per_week', 'words_per_month')),
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress snapshots table
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  speaking_minutes DECIMAL DEFAULT 0,
  new_vocab_count INTEGER DEFAULT 0,
  vocab_retained INTEGER DEFAULT 0,
  quiz_avg_score DECIMAL,
  difficulty_level INTEGER NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (child_id, week_start)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sessions_child ON sessions(child_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vocabulary_child ON vocabulary(child_id, introduced_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_child_active ON goals(child_id, period_end) WHERE achieved = FALSE;
CREATE INDEX IF NOT EXISTS idx_progress_child ON progress_snapshots(child_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;

-- Parents can only access their own profile
CREATE POLICY parents_own ON parents FOR ALL USING (id = auth.uid());

-- Parents can only access their own children
CREATE POLICY children_own ON children FOR ALL USING (parent_id = auth.uid());

-- Parents can only access sessions belonging to their children
CREATE POLICY sessions_own ON sessions FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Parents can only access messages from their children's sessions
CREATE POLICY messages_own ON messages FOR ALL
  USING (session_id IN (
    SELECT s.id FROM sessions s
    JOIN children c ON s.child_id = c.id
    WHERE c.parent_id = auth.uid()
  ));

-- Parents can only access their children's vocabulary
CREATE POLICY vocab_own ON vocabulary FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Parents can only access their children's goals
CREATE POLICY goals_own ON goals FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Parents can only access their children's progress
CREATE POLICY progress_own ON progress_snapshots FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- ============================================================
-- Trigger: auto-create parent profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.parents (id, email, name, language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
