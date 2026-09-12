-- Create analysis_cache table for caching AI analysis results
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_hash TEXT NOT NULL UNIQUE,
  analysis_result JSONB NOT NULL,
  slide_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast hash lookups
CREATE INDEX IF NOT EXISTS idx_analysis_cache_hash ON analysis_cache (content_hash);

-- Auto-cleanup old cache entries (older than 7 days)
-- Optional: run as a scheduled job or manually
-- DELETE FROM analysis_cache WHERE created_at < now() - INTERVAL '7 days';
