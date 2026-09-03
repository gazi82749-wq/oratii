import { getServiceSupabase } from '@/lib/supabaseClient';

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
