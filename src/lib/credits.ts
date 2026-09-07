import { supabase } from './supabaseClient';

export const CREDIT_COSTS = {
  SPEECH_ANALYSIS: 1,
  PPT_ANALYSIS: 1,
  VIVA_SESSION: 2,
};

export const CREDIT_PACKAGES = [
  {
    id: 'free_starter',
    name: 'Free Trial',
    badge: '5 Free Credits',
    price: 0,
    credits: 5,
    subtitle: 'Everything you need to try out Oratii AI speech & viva analysis',
    popular: false,
    cta: 'Get Started Free',
    validity: 'Lifetime',
    features: [
      '5 Free Credits on signup',
      'Try Speech Coach (1 credit)',
      'Try Slide Deck Audit (1 credit)',
      'Try AI Viva Defense (2 credits)',
      'Standard AI Analysis Queue',
    ],
  },
  {
    id: 'sachet_10',
    name: 'Chai Pack',
    badge: 'Quick Top-Up',
    price: 49,
    credits: 10,
    subtitle: 'Cost of a cold drink! Perfect for daily homework & speech drills',
    popular: false,
    cta: 'Buy 10 Credits (₹49)',
    validity: 'Never Expires',
    features: [
      '10 Total Credits (₹4.90 / credit)',
      'Never Expires (Use anytime)',
      'Speech Coach + WPM & Filler analysis',
      'Instant UPI payment (GPay / PhonePe)',
      'Downloadable PDF scorecards',
    ],
  },
  {
    id: 'sachet_25',
    name: 'Interview Sprint',
    badge: 'Student Best-Seller',
    price: 99,
    credits: 25,
    subtitle: 'Ideal for campus placement preparation & viva defense practice',
    popular: true,
    cta: 'Buy 25 Credits (₹99)',
    validity: 'Never Expires',
    features: [
      '25 Total Credits (₹3.96 / credit)',
      'Never Expires (Lifetime validity)',
      'Full line-by-line speech & slide critique',
      'STAR Method Mock Interview rounds',
      'Priority Processing Queue',
    ],
  },
  {
    id: 'value_50',
    name: 'Semester Value Pack',
    badge: 'Max Value',
    price: 199,
    credits: 60,
    subtitle: 'For active speakers, MBA presenters & competitive exam prep',
    popular: false,
    cta: 'Buy 60 Credits (₹199)',
    validity: 'Never Expires',
    features: [
      '60 Total Credits (50 + 10 Bonus)',
      'Never Expires (Lifetime validity)',
      'Everything in Sprint Pack',
      'Custom Viva Defense Personas',
      'Full Presentation Studio webcam HUD',
    ],
  },
  {
    id: 'academy_500',
    name: 'Academy Bulk Pool',
    badge: 'For Institutes & Batches',
    price: 1499,
    credits: 500,
    subtitle: 'Shared pooled balance for coaching centers, professors & trainers',
    popular: false,
    cta: 'Buy 500 Credits (₹1,499)',
    validity: 'Never Expires',
    features: [
      '500 Total Credits (₹2.99 / credit)',
      'Shared across all students in your batch',
      'Co-branded institute PDF reports',
      'Trainer Gradebook & Leaderboard sync',
      'Dedicated Ultra-Fast Queue',
    ],
  },
];

/**
 * Retrieves current credit balance for a user with fallback to 10 for new users.
 * Administrator accounts (role === 'admin', current_plan === 'admin_unlimited', or admin_verified) receive unlimited credits.
 */
export async function getUserCredits(userId: string): Promise<number> {
  if (!userId) return 0;

  // 1. Check client-side admin session flag
  if (typeof window !== 'undefined' && sessionStorage.getItem('admin_verified') === 'true') {
    return 999999;
  }

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

  // 1. Check client-side admin session flag
  if (typeof window !== 'undefined' && sessionStorage.getItem('admin_verified') === 'true') {
    return { allowed: true, remainingCredits: 999999 };
  }

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

