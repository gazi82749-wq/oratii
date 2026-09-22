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
    credits: 5,
    subtitle: 'Experience the power of real-time AI speech and slide analysis.',
    popular: false,
    cta: 'Get Started Free',
    validity: 'Lifetime',
    features: [
      '5 Free Credits on registration',
      'Full Access to All AI Features',
      '5 Speech Drills OR 2 AI Vivas',
      'Instant AI Scorecard & Feedback',
      'Never Expires (Use anytime)',
    ],
  },
  {
    id: 'interview_sprint',
    name: 'Pro',
    badge: 'Most Popular',
    price: 149,
    credits: 40,
    subtitle: 'Perfect for urgent placement drives, mock interviews & quick drills.',
    popular: true,
    cta: 'Buy 40 Credits (₹149)',
    validity: 'Never Expires',
    features: [
      '40 Total Credits (₹3.72 / credit)',
      'Full Access to All AI Features',
      '40 Speech Drills OR 20 AI Vivas',
      'Instant UPI Payment Activation',
      'Never Expires (Use anytime)',
    ],
  },
  {
    id: 'season_pass',
    name: 'Premium',
    badge: 'Maximum Value',
    price: 499,
    credits: 200,
    subtitle: 'For active speakers going through a full 3-month placement season.',
    popular: false,
    cta: 'Buy 200 Credits (₹499)',
    validity: 'Never Expires',
    features: [
      '200 Total Credits (₹2.49 / credit)',
      'Full Access to All AI Features',
      '200 Speech Drills OR 100 AI Vivas',
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

  // Removed insecure client-side admin bypass

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits, role, current_plan, email')
      .eq('id', userId)
      .maybeSingle();

    // 2. Check profile role, plan, or admin email prefix
    if (
      data?.role === 'admin' ||
      data?.current_plan === 'admin_unlimited' ||
      (data?.email && (data.email.startsWith('admin') || data.email.includes('admin@')))
    ) {
      return 999999; // Unlimited access for Administrator accounts
    }

    if (error || !data || typeof data.credits !== 'number') {
      return 5;
    }
    return data.credits;
  } catch {
    return 5;
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

  // Removed insecure client-side admin bypass

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, role, current_plan, email')
      .eq('id', userId)
      .maybeSingle();

    // 2. Bypass deduction for Administrators
    if (
      profile?.role === 'admin' ||
      profile?.current_plan === 'admin_unlimited' ||
      (profile?.email && (profile.email.startsWith('admin') || profile.email.includes('admin@')))
    ) {
      return { allowed: true, remainingCredits: 999999 };
    }

    const currentCredits = typeof profile?.credits === 'number' ? profile.credits : 5;
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
    return { allowed: true, remainingCredits: 5 };
  }
}

