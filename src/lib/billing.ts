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
    speech_analysis_count: 5,
    ppt_analysis_count: 3,
    viva_sessions_count: 1, // Limited viva practice
  },
  pro: {
    speech_analysis_count: Infinity,
    ppt_analysis_count: Infinity,
    viva_sessions_count: 20,
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
  try {
    // 1. Get user profile and current plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_plan')
      .eq('id', userId)
      .single();

    const plan = (profile?.current_plan || 'free') as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan][type];

    // Unlimited
    if (limit === Infinity) {
      return { allowed: true };
    }

    // 2. Check current usage
    const { data: usage, error: fetchErr } = await supabase
      .from('usage_limits')
      .select(type)
      .eq('user_id', userId)
      .maybeSingle();

    const currentCount = usage ? (usage[type] || 0) : 0;

    if (currentCount >= limit) {
      return { allowed: false, limitReached: true };
    }

    // 3. Increment usage (or insert if record missing)
    if (usage) {
      await supabase
        .from('usage_limits')
        .update({ [type]: currentCount + 1 })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('usage_limits')
        .insert([{ user_id: userId, [type]: 1 }]);
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking billing limits:', error);
    // Fail open on database errors so users can analyze slides without false blocks
    return { allowed: true };
  }
}
