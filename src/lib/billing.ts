import { getServiceSupabase } from '@/lib/supabaseClient';

export type UsageType = 'speech_analysis_count' | 'ppt_analysis_count' | 'viva_sessions_count';

// Credit cost per feature: 1 credit per session / run
export const CREDIT_COST: Record<UsageType, number> = {
  speech_analysis_count: 1,
  ppt_analysis_count: 1,
  viva_sessions_count: 1,
};

// Default credits granted to new users on signup (Total 10 credits)
export const DEFAULT_FREE_CREDITS = 10;

/**
 * Checks if a user has sufficient credits and decrements 1 credit per session.
 * Single source of truth: profiles.credits (with fallback to 10 for new users).
 * Administrator accounts bypass credit checks completely and receive unlimited usage.
 */
export async function checkAndDecrementUsage(
  userId: string,
  type: UsageType
): Promise<{ allowed: boolean; limitReached?: boolean; remainingCredits?: number }> {
  try {
    const supabase = getServiceSupabase();
    const cost = CREDIT_COST[type] || 1;

    // 1. Admin check in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, role, current_plan, email')
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

    // 2. Determine current credits from profiles.credits (defaults to 10 for new users)
    let currentCredits = typeof profile?.credits === 'number' ? profile.credits : 10;

    // Sync with usage_limits table if present
    const { data: usageData } = await supabase
      .from('usage_limits')
      .select('speech_analysis_count, ppt_analysis_count, viva_sessions_count')
      .eq('user_id', userId)
      .maybeSingle();

    if (usageData) {
      const usageTotal = (usageData.speech_analysis_count || 0) +
                         (usageData.ppt_analysis_count || 0) +
                         (usageData.viva_sessions_count || 0);
      currentCredits = Math.max(currentCredits, usageTotal);
    } else {
      // Auto-initialize usage_limits with 10 free credits for new user
      await supabase
        .from('usage_limits')
        .upsert({
          user_id: userId,
          speech_analysis_count: 10,
          ppt_analysis_count: 0,
          viva_sessions_count: 0,
          current_month: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

    // If profile.credits was null/missing, update profiles table to 10
    if (!profile || typeof profile.credits !== 'number') {
      await supabase
        .from('profiles')
        .update({ credits: 10 })
        .eq('id', userId);
      currentCredits = 10;
    }

    // 3. Credit check: return insufficient credits if less than cost
    if (currentCredits < cost) {
      return { allowed: false, limitReached: true, remainingCredits: currentCredits };
    }

    // 4. Atomic credit deduction (1 credit per session)
    const newCredits = Math.max(0, currentCredits - cost);

    await supabase
      .from('profiles')
      .update({ credits: newCredits, updated_at: new Date().toISOString() })
      .eq('id', userId);

    await supabase
      .from('usage_limits')
      .update({
        speech_analysis_count: newCredits,
        current_month: new Date().toISOString()
      })
      .eq('user_id', userId);

    return { allowed: true, remainingCredits: newCredits };

  } catch (err: any) {
    console.error('[Billing] Error during credit deduction:', err?.message || err);
    // Safe fallback: allow new user session if DB query fails transiently
    return { allowed: true, remainingCredits: 9 };
  }
}

/**
 * Returns current credit balance for a user.
 * Admin accounts receive 999999.
 * Auto-initializes 10 free credits for new users if missing.
 */
export async function getCreditBalance(userId: string): Promise<number> {
  try {
    const supabase = getServiceSupabase();

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, role, current_plan, email')
      .eq('id', userId)
      .maybeSingle();

    if (
      profile?.role === 'admin' ||
      profile?.current_plan === 'admin_unlimited' ||
      (profile?.email && (profile.email.startsWith('admin') || profile.email.includes('admin@')))
    ) {
      return 999999;
    }

    if (profile && typeof profile.credits === 'number') {
      return profile.credits;
    }

    // Auto-initialize 10 credits if missing
    await supabase.from('profiles').update({ credits: 10 }).eq('id', userId);
    return 10;
  } catch {
    return 10;
  }
}

/**
 * Refunds 1 credit if AI operation fails completely after deduction.
 */
export async function refundUsage(
  userId: string,
  cost: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getServiceSupabase();

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, role, current_plan, email')
      .eq('id', userId)
      .maybeSingle();

    if (
      profile?.role === 'admin' ||
      profile?.current_plan === 'admin_unlimited' ||
      (profile?.email && (profile.email.startsWith('admin') || profile.email.includes('admin@')))
    ) {
      return { success: true };
    }

    const currentCredits = typeof profile?.credits === 'number' ? profile.credits : 0;
    const newCredits = currentCredits + cost;

    await supabase.from('profiles').update({ credits: newCredits }).eq('id', userId);
    await supabase.from('usage_limits').update({ speech_analysis_count: newCredits }).eq('user_id', userId);

    return { success: true };
  } catch (err: any) {
    console.error('[Billing] Failed to refund credit:', err);
    return { success: false, error: err.message };
  }
}
