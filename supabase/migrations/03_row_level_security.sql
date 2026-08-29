-- ============================================================
-- Migration: Add Row Level Security policies to ALL tables
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
--    PK: id (matches auth.uid())
--    Existing: SELECT own, UPDATE own  ✓
--    Missing:  INSERT own row (needed by signup trigger fallback)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- UPDATE: users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- INSERT: users can only insert their own profile row (id must match their auth.uid())
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- DELETE: users cannot delete profiles (only cascade from auth.users handles this)
-- No DELETE policy = denied by default with RLS enabled ✓


-- ──────────────────────────────────────────────────────────────
-- 2. SUBSCRIPTIONS TABLE
--    FK: user_id
--    Existing: SELECT own  ✓
--    Missing:  No INSERT/UPDATE/DELETE policies
--    Server writes via service_role key bypass RLS, so
--    we only need SELECT for the client.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: denied for clients (server uses service_role to bypass)
-- No policy = denied by default with RLS enabled ✓


-- ──────────────────────────────────────────────────────────────
-- 3. PAYMENTS TABLE
--    FK: user_id
--    Existing: SELECT own  ✓
--    Missing:  No INSERT/UPDATE/DELETE policies
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: denied for clients ✓


-- ──────────────────────────────────────────────────────────────
-- 4. USAGE_LIMITS TABLE
--    FK: user_id (UNIQUE)
--    Existing: SELECT own  ✓
--    Missing:  No INSERT/UPDATE policies for client
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage limits" ON public.usage_limits;
CREATE POLICY "Users can view own usage limits"
    ON public.usage_limits FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE: denied for clients ✓


-- ──────────────────────────────────────────────────────────────
-- 5. ANALYSIS_REPORTS TABLE  (referenced in analyze-slides API)
--    Table may already exist WITHOUT user_id column.
--    The API inserts without user context (server-side, anon key).
--    We add user_id safely and enable RLS.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.analysis_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presentation_id TEXT,
    overall_score NUMERIC,
    slide_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely add user_id if it doesn't exist yet
ALTER TABLE public.analysis_reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read their own reports (user_id match) OR reports with no owner (legacy)
DROP POLICY IF EXISTS "Users can view own analysis reports" ON public.analysis_reports;
CREATE POLICY "Users can view own analysis reports"
    ON public.analysis_reports FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

-- INSERT: allow inserts (server writes these; user_id may be null for anonymous analyses)
DROP POLICY IF EXISTS "Users can insert analysis reports" ON public.analysis_reports;
CREATE POLICY "Users can insert analysis reports"
    ON public.analysis_reports FOR INSERT
    WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- UPDATE/DELETE: denied for clients ✓


-- ──────────────────────────────────────────────────────────────
-- 6. USER_STATS TABLE  (referenced in storage.ts)
--    Table may already exist. Safely ensure schema + RLS.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    highest_streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely add columns if table existed but was missing them
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS highest_streak INTEGER DEFAULT 0;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.user_stats ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only read their own stats
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
CREATE POLICY "Users can view own stats"
    ON public.user_stats FOR SELECT
    USING (auth.uid() = user_id);

-- UPDATE: users can only update their own stats
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
CREATE POLICY "Users can update own stats"
    ON public.user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- INSERT: users can only insert their own stats row
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
CREATE POLICY "Users can insert own stats"
    ON public.user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- DELETE: denied for clients ✓


-- ──────────────────────────────────────────────────────────────
-- 7. SESSIONS TABLE  (referenced in storage.ts)
--    Table may already exist. Safely ensure schema + RLS.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT,
    score NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely add columns if table existed but was missing them
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS session_type TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS score NUMERIC DEFAULT 0;

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only read their own sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.sessions;
CREATE POLICY "Users can view own sessions"
    ON public.sessions FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: users can only insert sessions for themselves
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.sessions;
CREATE POLICY "Users can insert own sessions"
    ON public.sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE/DELETE: denied for clients ✓


-- ──────────────────────────────────────────────────────────────
-- VERIFICATION QUERY
-- Run this after the migration to confirm RLS is ON for all tables:
-- ──────────────────────────────────────────────────────────────
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';

