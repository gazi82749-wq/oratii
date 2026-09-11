import { getServiceSupabase } from '@/lib/supabaseClient';

export type UsageType = 'speech_analysis_count' | 'ppt_analysis_count' | 'viva_sessions_count';

// Credit cost per feature (unified: 1 credit = 1 use of any feature)
export const CREDIT_COST: Record<UsageType, number> = {
  speech_analysis_count: 1,
  ppt_analysis_count: 1,
  viva_sessions_count: 1,
};

// Default credits granted to new users on signup
export const DEFAULT_FREE_CREDITS = 20;

/**
 * Checks if a user has sufficient credits for a specific usage type,
 * and if so, decrements the available usage limit.
 * Returns { allowed: true } if successful, { allowed: false, limitReached: true } if insufficient credits.
 */
export async function checkAndDecrementUsage(
  userId: string,
  type: UsageType
): Promise<{ allowed: boolean; limitReached?: boolean; remainingCredits?: number }> {
  try {
    const supabase = getServiceSupabase();
    const cost = CREDIT_COST[type] || 1;

    // Fetch current credit balance
    const { data, error } = await supabase
      .from('usage_limits')
      .select('speech_analysis_count, ppt_analysis_count, viva_sessions_count')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn('[Billing] Could not fetch usage limits for user:', userId, error?.message);
      // Fail-open with caution: allow the request but log it
      // In a stricter setup, you could fail-closed here
      return { allowed: true };
    }

    // Unified credit balance: sum of all remaining credit fields
    const totalCredits =
      (data.speech_analysis_count || 0) +
      (data.ppt_analysis_count || 0) +
      (data.viva_sessions_count || 0);

    if (totalCredits < cost) {
      return { allowed: false, limitReached: true, remainingCredits: totalCredits };
    }

    // Decrement from the specific usage type column first, then overflow to others
    const currentTypeCount = data[type] || 0;

    if (currentTypeCount >= cost) {
      // Decrement from the matching column
      const { error: updateError } = await supabase
        .from('usage_limits')
        .update({ [type]: currentTypeCount - cost })
        .eq('user_id', userId);

      if (updateError) {
        console.error('[Billing] Failed to decrement usage:', updateError.message);
        return { allowed: true }; // Fail-open: don't block user on DB write failure
      }
    } else {
      // Overflow: decrement from whichever column has credits
      // Priority: speech → ppt → viva
      const columns: UsageType[] = ['speech_analysis_count', 'ppt_analysis_count', 'viva_sessions_count'];
      let remaining = cost;
      const updates: Partial<Record<UsageType, number>> = {};

      for (const col of columns) {
        if (remaining <= 0) break;
        const available = data[col] || 0;
        const deducted = Math.min(available, remaining);
        updates[col] = available - deducted;
        remaining -= deducted;
      }

      if (remaining > 0) {
        return { allowed: false, limitReached: true, remainingCredits: 0 };
      }

      const { error: updateError } = await supabase
        .from('usage_limits')
        .update(updates)
        .eq('user_id', userId);

      if (updateError) {
        console.error('[Billing] Failed to decrement usage (overflow):', updateError.message);
        return { allowed: true };
      }
    }

    const newTotal = totalCredits - cost;
    return { allowed: true, remainingCredits: newTotal };

  } catch (err: any) {
    console.error('[Billing] Unexpected error:', err?.message || err);
    // Fail-open: don't block user on unexpected errors
    return { allowed: true };
  }
}

/**
 * Returns the current credit balance for a user.
 * Used by UI components to show remaining credits.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  try {
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('usage_limits')
      .select('speech_analysis_count, ppt_analysis_count, viva_sessions_count')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return 0;
    }

    return (
      (data.speech_analysis_count || 0) +
      (data.ppt_analysis_count || 0) +
      (data.viva_sessions_count || 0)
    );
  } catch {
    return 0;
  }
}
