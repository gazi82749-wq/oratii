import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Lightweight IP-based rate limiter (in-memory, will reset on server restart)
const trialIps = new Set<string>();

import { supabase } from '@/lib/supabaseClient';

export async function isUserLoggedIn(req?: NextRequest) {
  try {
    if (req) {
      const OratiiLoggedInReq = req.cookies.get('Oratii_logged_in');
      if (OratiiLoggedInReq?.value === 'true') return true;

      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) return true;

      const reqAuthCookie = req.cookies.getAll().find(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
      if (reqAuthCookie) return true;
    }

    const cookieStore = cookies();
    const OratiiLoggedIn = cookieStore.get('Oratii_logged_in');
    if (OratiiLoggedIn?.value === 'true') return true;

    const authCookie = cookieStore.getAll().find(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
    if (authCookie) return true;

    return false;
  } catch (err) {
    return false;
  }
}

export async function hasUsedTrial(req: NextRequest) {
  // Unlimited trial mode: Never block any user with a trial limit barrier
  return false;
}

export async function setTrialUsed(req: NextRequest) {
  if (await isUserLoggedIn(req)) return; // Don't track trial for logged in users

  try {
    const cookieStore = cookies();
    cookieStore.set('Oratii_trial_used', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
  } catch (e) {
    // ignore
  }

  if (req) {
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
    if (ip !== 'unknown') {
      trialIps.add(ip);
    }
  }
}
