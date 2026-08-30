import { supabase } from './supabaseClient';

export const CREDIT_COSTS = {
  SPEECH_ANALYSIS: 1,
  PPT_ANALYSIS: 1,
  VIVA_SESSION: 1,
};

export const CREDIT_PACKAGES = [
  {
    id: 'free_starter',
    name: 'Free Trial',
    badge: '5 Free Credits',
    price: 0,
    credits: 5,
    subtitle: 'Everything you need to try out Oratii AI presentation analysis',
    popular: false,
    cta: 'Get Started Free',
    validity: 'Lifetime',
    features: [
      '5 Free Credits on signup',
      'Try Speech Coach (1 credit)',
      'Try PPT Slide Analyzer (1 credit)',
      'Try AI Viva Defense (1 credit)',
      'Standard AI Analysis Queue',
    ],
  },
  {
    id: 'value_50',
    name: 'Value Pack',
    badge: '🔥 Best Value',
    price: 299,
    credits: 50,
    subtitle: 'Perfect for active speakers, students & job interview prep',
    popular: true,
    cta: 'Buy 50 Credits (₹299)',
    validity: 'Never Expires',
    features: [
      '50 Total Credits (₹5.98 / credit)',
      'Never Expires (Use whenever needed)',
      'Full line-by-line speech & slide critique',
      'Download detailed PDF summaries',
      '⚡ Priority Processing Queue',
    ],
  },
  {
    id: 'pro_180',
    name: 'Pro Power Pack',
    badge: '⚡ Max Savings',
    price: 799,
    credits: 180,
    subtitle: 'For power users, researchers, professors & frequent presenters',
    popular: false,
    cta: 'Buy 180 Credits (₹799)',
    validity: 'Never Expires',
    features: [
      '180 Total Credits (150 + 30 Bonus)',
      'Never Expires (Lifetime validity)',
      'Everything in Value Pack',
      'Custom Viva Defense Personas',
      '🚀 Ultra Fast Dedicated Queue',
    ],
  },
];

/**
 * Retrieves current credit balance for a user with fallback.
 */
export async function getUserCredits(userId: string): Promise<number> {
  // Unlimited testing mode
  return 999;
}

/**
 * Checks if user has enough credits and deducts.
 */
export async function checkAndDeductCredits(
  userId: string,
  cost: number
): Promise<{ allowed: boolean; remainingCredits: number; error?: string }> {
  // Unlimited testing mode: ALWAYS ALLOWED
  return { allowed: true, remainingCredits: 999 };
}
