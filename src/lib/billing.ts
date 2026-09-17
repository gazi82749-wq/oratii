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

    // Fetch current credit balance to return remaining credits if needed
    const { data: balanceData, error: balanceError } = await supabase
      .from('usage_limits')
      .select('speech_analysis_count, ppt_analysis_count, viva_sessions_count')
      .eq('user_id', userId)
      .single();

    if (balanceError || !balanceData) {
      console.warn('[Billing] Could not fetch usage limits for user:', userId, balanceError?.message);
      return { allowed: false, limitReached: true };
    }

    const totalCredits =
      (balanceData.speech_analysis_count || 0) +
      (balanceData.ppt_analysis_count || 0) +
      (balanceData.viva_sessions_count || 0);

    if (totalCredits < cost) {
      return { allowed: false, limitReached: true, remainingCredits: totalCredits };
    }

    // Attempt atomic decrement
    const { data: success, error: rpcError } = await supabase.rpc('decrement_unified_usage', {
      user_id_val: userId,
      cost_val: cost
    });

    if (rpcError) {
      console.error('[Billing] Atomic deduction RPC failed:', rpcError);
      return { allowed: false, limitReached: true }; // Fail-closed on error for safety
    }

    if (!success) {
      return { allowed: false, limitReached: true, remainingCredits: totalCredits };
    }

    const newTotal = totalCredits - cost;
    return { allowed: true, remainingCredits: newTotal };

  } catch (err: any) {
    console.error('[Billing] Unexpected error:', err?.message || err);
    return { allowed: false, limitReached: true }; // Fail-closed on unexpected error
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

/**
 * Refunds usage atomically if an AI operation fails completely after deduction.
 */
export async function refundUsage(
  userId: string,
  cost: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();
    
    // Call the Postgres RPC to atomically increment usage limits
    const { data, error } = await supabase.rpc('increment_unified_usage', {
      user_id_val: userId,
      refund_val: cost,
    });

    if (error) {
      console.error('[Billing] Atomic refund RPC failed:', error);
      return { success: false, error: error.message };
    }

    if (!data) return { success: false, error: 'User usage record not found' };

    return { success: true };
  } catch (err: any) {
    console.error('[Billing] Failed to refund unified usage:', err);
    return { success: false, error: err.message };
  }
}
