import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Lightweight IP-based rate limiter (in-memory, will reset on server restart)
const trialIps = new Set<string>();

import { supabase } from '@/lib/supabaseClient';

export async function isUserLoggedIn(req?: NextRequest): Promise<boolean> {
  try {
    // 1. Check Authorization Bearer header
    let token: string | null = null;
    if (req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    // 2. Check Supabase auth cookie if no header token
    if (!token) {
      const cookieStore = req ? req.cookies : cookies();
      const authCookie = cookieStore.getAll().find(
        (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
      );

      if (authCookie) {
        try {
          // Supabase auth cookies may be JSON array [access_token, refresh_token]
          const parsed = JSON.parse(decodeURIComponent(authCookie.value));
          token = Array.isArray(parsed) ? parsed[0] : (parsed?.access_token || authCookie.value);
        } catch {
          token = authCookie.value;
        }
      }
    }

    if (!token) return false;

    // Cryptographically verify token validity with Supabase auth server
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return !!(user && !error);
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
