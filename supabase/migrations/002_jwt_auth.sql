-- ============================================================
-- Migration 002: Switch from Supabase Auth to JWT auth
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql
-- ============================================================

-- Drop the Supabase Auth trigger (no longer needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate parents table without auth.users dependency
DROP TABLE IF EXISTS parents CASCADE;

CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate children table (foreign key to new parents table)
-- (children, sessions, etc. tables are unchanged — just re-add FK)
ALTER TABLE children DROP CONSTRAINT IF EXISTS children_parent_id_fkey;
ALTER TABLE children ADD CONSTRAINT children_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE;

-- Disable RLS on parents (backend uses service role which bypasses RLS anyway)
ALTER TABLE parents DISABLE ROW LEVEL SECURITY;
