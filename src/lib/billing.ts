import { getServiceSupabase } from '@/lib/supabaseClient';

export type UsageType = 'speech_analysis_count' | 'ppt_analysis_count' | 'viva_sessions_count';

// Credit cost per feature (unified: 1 credit = 1 use of any feature)
export const CREDIT_COST: Record<UsageType, number> = {
  speech_analysis_count: 1,
  ppt_analysis_count: 1,
  viva_sessions_count: 1,
};

// Default credits granted to new users on signup (Total 20 credits)
export const DEFAULT_FREE_CREDITS = 20;

/**
 * Checks if a user has sufficient credits for a specific usage type,
 * and if so, decrements the available usage limit.
 * Administrator accounts bypass credit checks completely and receive unlimited usage.
 * Automatically initializes usage_limits for new users with free credits if missing.
 */
export async function checkAndDecrementUsage(
  userId: string,
  type: UsageType
): Promise<{ allowed: boolean; limitReached?: boolean; remainingCredits?: number }> {
  try {
    const supabase = getServiceSupabase();
    const cost = CREDIT_COST[type] || 1;

    // 0. Check if user is an Admin in profiles table (Admin bypass)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, current_plan, email')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin =
      profile?.role === 'admin' ||
      profile?.current_plan === 'admin_unlimited' ||
      (profile?.email && (profile.email.startsWith('admin') || profile.email.includes('admin@')));

    if (isAdmin) {
      console.log('[Billing] Admin user bypasses credit deduction:', userId);
      return { allowed: true, remainingCredits: 999999 };
    }

    // Fetch current credit balance
    let { data: balanceData, error: balanceError } = await supabase
      .from('usage_limits')
      .select('speech_analysis_count, ppt_analysis_count, viva_sessions_count')
      .eq('user_id', userId)
      .maybeSingle();

    // If usage record doesn't exist for new user, auto-initialize with free credits
    if (!balanceData) {
      console.log('[Billing] Initializing default free credits for new user:', userId);
      const { data: initData, error: initError } = await supabase
        .from('usage_limits')
        .upsert({
          user_id: userId,
          speech_analysis_count: 10,
          ppt_analysis_count: 5,
          viva_sessions_count: 5,
          current_month: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select('speech_analysis_count, ppt_analysis_count, viva_sessions_count')
        .maybeSingle();

      if (initError || !initData) {
        console.error('[Billing] Failed to initialize usage limits for user:', userId, initError?.message);
        return { allowed: false, limitReached: true };
      }
      balanceData = initData;
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
      console.error('[Billing] Atomic deduction RPC failed, falling back to direct decrement:', rpcError);
      
      // Fallback: direct decrement if RPC fails or is missing
      const fieldToDecrement = type;
      const currentFieldVal = balanceData[fieldToDecrement] || 0;

      if (currentFieldVal >= cost) {
        await supabase
          .from('usage_limits')
          .update({ [fieldToDecrement]: currentFieldVal - cost })
          .eq('user_id', userId);
        
        return { allowed: true, remainingCredits: totalCredits - cost };
      } else {
        // Deduct from speech_analysis_count as fallback if total >= cost
        const backupField = (balanceData.speech_analysis_count || 0) >= cost 
          ? 'speech_analysis_count' 
          : ((balanceData.ppt_analysis_count || 0) >= cost ? 'ppt_analysis_count' : 'viva_sessions_count');
          
        const backupVal = balanceData[backupField] || 0;
        await supabase
          .from('usage_limits')
          .update({ [backupField]: Math.max(0, backupVal - cost) })
          .eq('user_id', userId);

        return { allowed: true, remainingCredits: totalCredits - cost };
      }
    }

    if (!success) {
      return { allowed: false, limitReached: true, remainingCredits: totalCredits };
    }

    const newTotal = totalCredits - cost;
    return { allowed: true, remainingCredits: newTotal };

  } catch (err: any) {
    console.error('[Billing] Unexpected error during credit deduction:', err?.message || err);
    return { allowed: false, limitReached: true };
  }
}

/**
 * Returns the current credit balance for a user.
 * Admin accounts receive 999999.
 * Auto-initializes default credits if user record doesn't exist yet.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  try {
    const supabase = getServiceSupabase();

    // Check if user is an Admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, current_plan, email')
      .eq('id', userId)
      .maybeSingle();

    if (
      profile?.role === 'admin' ||
      profile?.current_plan === 'admin_unlimited' ||
      (profile?.email && (profile.email.startsWith('admin') || profile.email.includes('admin@')))
    ) {
      return 999999;
    }

    let { data, error } = await supabase
      .from('usage_limits')
      .select('speech_analysis_count, ppt_analysis_count, viva_sessions_count')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) {
      const { data: newRow } = await supabase
        .from('usage_limits')
        .upsert({
          user_id: userId,
          speech_analysis_count: 10,
          ppt_analysis_count: 5,
          viva_sessions_count: 5,
          current_month: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select('speech_analysis_count, ppt_analysis_count, viva_sessions_count')
        .maybeSingle();

      data = newRow;
    }

    if (!data) return 0;

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
 * Admin accounts bypass refund logic.
 */
export async function refundUsage(
  userId: string,
  cost: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, current_plan, email')
      .eq('id', userId)
      .maybeSingle();

    if (
      profile?.role === 'admin' ||
      profile?.current_plan === 'admin_unlimited' ||
      (profile?.email && (profile.email.startsWith('admin') || profile.email.includes('admin@')))
    ) {
      return { success: true };
    }
    
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
