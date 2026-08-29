-- ============================================================
-- Migration: Add session_data JSONB column to sessions table
-- ============================================================

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS session_data JSONB;
