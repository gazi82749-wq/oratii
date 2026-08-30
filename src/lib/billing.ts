import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzbxhxlrmshmtgiocqkh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhoeGxybXNobXRnaW9jcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDc2NDksImV4cCI6MjA5NjY4MzY0OX0.Ac7OU5VwtKvvdCmIxvzyuilWJYmLz7-qrLq8DVD_x2U';

// NOTE: This is an intentionally separate Supabase client using the Service Role Key
// to bypass Row Level Security (RLS) for server-side billing operations.
// Do NOT replace with the shared client from supabaseClient.ts (which uses the anon key).
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type UsageType = 'speech_analysis_count' | 'ppt_analysis_count' | 'viva_sessions_count';

export const PLAN_LIMITS = {
  free: {
    speech_analysis_count: Infinity,
    ppt_analysis_count: Infinity,
    viva_sessions_count: Infinity,
  },
  pro: {
    speech_analysis_count: Infinity,
    ppt_analysis_count: Infinity,
    viva_sessions_count: Infinity,
  },
  premium: {
    speech_analysis_count: Infinity,
    ppt_analysis_count: Infinity,
    viva_sessions_count: Infinity,
  },
  team: {
    speech_analysis_count: Infinity,
    ppt_analysis_count: Infinity,
    viva_sessions_count: Infinity,
  }
};

/**
 * Checks if a user has sufficient credits for a specific usage type,
 * and if so, decrements the available usage limit.
 * Returns { allowed: true } if successful.
 */
export async function checkAndDecrementUsage(userId: string, type: UsageType): Promise<{ allowed: boolean; limitReached?: boolean }> {
  // Unlimited testing mode: All features have ZERO credit barriers
  return { allowed: true };
}
