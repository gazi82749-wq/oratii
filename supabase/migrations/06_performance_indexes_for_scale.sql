-- ==============================================================================
-- Migration: 06_performance_indexes_for_scale.sql
-- High-concurrency performance indexes to handle 10,000+ concurrent users
-- Prevents sequential table scans on dashboard, billing, and analysis queries
-- ==============================================================================

-- 1. Index foreign key user_id on sessions (Critical for dashboard & session history queries)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id 
ON public.sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_created 
ON public.sessions (user_id, created_at DESC);

-- 2. Index foreign key user_id on analysis_reports (Critical for presentation history)
CREATE INDEX IF NOT EXISTS idx_analysis_reports_user_id 
ON public.analysis_reports (user_id);

CREATE INDEX IF NOT EXISTS idx_analysis_reports_user_created 
ON public.analysis_reports (user_id, created_at DESC);

-- 3. Index foreign key user_id on subscriptions (Critical for layout & billing checks)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON public.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
ON public.subscriptions (user_id, subscription_status);

-- 4. Index foreign key user_id on payments (Critical for invoice history)
CREATE INDEX IF NOT EXISTS idx_payments_user_id 
ON public.payments (user_id);

CREATE INDEX IF NOT EXISTS idx_payments_payment_id 
ON public.payments (payment_id);

-- 5. Index profiles role for fast admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles (role);

-- 6. Index user_stats user_id if not already unique-indexed
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id 
ON public.user_stats (user_id);
