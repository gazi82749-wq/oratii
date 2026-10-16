-- Migration 11: Add full_name column to profiles
-- The codebase references full_name throughout but the production DB
-- does not have it. This migration safely adds the column only.

-- Step 1: Add full_name column (safe even if it already exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
