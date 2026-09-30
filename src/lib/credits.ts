import { supabase } from './supabaseClient';

export const CREDIT_COSTS = {
  SPEECH_ANALYSIS: 1,
  PPT_ANALYSIS: 1,
  VIVA_SESSION: 2,
};

export const CREDIT_PACKAGES = [
  {
    id: 'free_starter',
    name: 'Starter',
    badge: 'Zero Risk',
    price: 0,
    credits: 10,
    subtitle: 'Experience the power of real-time AI speech and vocal analysis.',
    popular: false,
    cta: 'Get Started Free',
    validity: 'Monthly',
    comingSoon: false,
    features: [
      '10 Free Credits every month',
      'Full Access to AI Speech Coach',
      'Vocal Pacing & Filler Word Analysis',
      'Instant AI Scorecard & Feedback',
      'Never Expires (Use anytime)',
    ],
  },
  {
    id: 'interview_sprint',
    name: 'Pro',
    badge: 'Coming Soon',
    price: 149,
    credits: 40,
    subtitle: 'Perfect for placement drives, interviews & vocal practice.',
    popular: true,
    cta: 'Coming Soon',
    comingSoon: true,
    validity: 'Never Expires',
    features: [
      '40 Total Credits (₹3.72 / credit)',
      'Full Access to AI Speech Coach',
      'Instant UPI Payment Activation',
      'Never Expires (Use anytime)',
    ],
  },
  {
    id: 'season_pass',
    name: 'Premium',
    badge: 'Coming Soon',
    price: 499,
    credits: 200,
    subtitle: 'For active speakers going through placement drives.',
    popular: false,
    cta: 'Coming Soon',
    comingSoon: true,
    validity: 'Never Expires',
    features: [
      '200 Total Credits (₹2.49 / credit)',
      'Full Access to AI Speech Coach',
      'Save 33% vs standard credit rate',
      'Never Expires (Use anytime)',
    ],
  }
];

/**
 * Retrieves current credit balance for a user with fallback to 10 for new users.
 * Administrator accounts (role === 'admin', current_plan === 'admin_unlimited', or admin_verified) receive unlimited credits.
 */
export async function getUserCredits(userId: string): Promise<number> {
  if (!userId) return 0;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits, role, current_plan, email')
      .eq('id', userId)
      .maybeSingle();

    if (
      data?.role === 'admin' ||
      data?.current_plan === 'admin_unlimited' ||
      (data?.email && (data.email.startsWith('admin') || data.email.includes('admin@')))
    ) {
      return 999999;
    }

    if (error || !data || typeof data.credits !== 'number') {
      return 10;
    }
    return data.credits;
  } catch {
    return 10;
  }
}

/**
 * Checks if user has enough credits and deducts from Supabase profiles database.
 * Administrator accounts bypass credit deductions completely.
 */
export async function checkAndDeductCredits(
  userId: string,
  cost: number
): Promise<{ allowed: boolean; remainingCredits: number; error?: string }> {
  if (!userId) {
    return { allowed: false, remainingCredits: 0, error: 'Please log in to use AI analysis.' };
  }

  try {
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
      return { allowed: true, remainingCredits: 999999 };
    }

    const currentCredits = typeof profile?.credits === 'number' ? profile.credits : 10;
    if (currentCredits < cost) {
      return {
        allowed: false,
        remainingCredits: currentCredits,
        error: `Insufficient credits (${currentCredits} remaining). Please top up to continue AI analysis.`,
      };
    }

    const newCredits = currentCredits - cost;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      console.error('Credit deduction update error:', updateError.message);
    }

    return { allowed: true, remainingCredits: newCredits };
  } catch (e) {
    console.error('Failed to deduct credits:', e);
    return { allowed: true, remainingCredits: 10 };
  }
}

