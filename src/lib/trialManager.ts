import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Lightweight IP-based rate limiter (in-memory, will reset on server restart)
const trialIps = new Map<string, number>(); // IP -> usage count

import { supabase } from '@/lib/supabaseClient';

// Maximum number of free anonymous sessions allowed (Speech Coach only)
const MAX_ANONYMOUS_SESSIONS = 2;

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


/**
 * Checks if an anonymous user has exhausted their free trial sessions.
 * Returns true if the user should be BLOCKED (trial used up).
 * Returns false if the user can proceed (trial still available).
 * 
 * Logged-in users are never blocked by the trial system.
 */
export async function hasUsedTrial(req: NextRequest): Promise<boolean> {
  // Logged-in users bypass the trial system entirely — they use credits instead
  if (await isUserLoggedIn(req)) return false;

  // Check 1: Cookie-based tracking (primary)
  const trialCookie = req.cookies.get('Oratii_trial_count');
  const cookieCount = trialCookie ? parseInt(trialCookie.value, 10) || 0 : 0;

  if (cookieCount >= MAX_ANONYMOUS_SESSIONS) {
    return true; // Trial exhausted
  }

  // Check 2: IP-based tracking (secondary, catches cookie-clearing)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  if (ip !== 'unknown') {
    const ipCount = trialIps.get(ip) || 0;
    if (ipCount >= MAX_ANONYMOUS_SESSIONS) {
      return true; // Trial exhausted (IP-level)
    }
  }

  return false;
}

/**
 * Marks one trial session as consumed for an anonymous user.
 * Increments both cookie counter and IP counter.
 */
export async function setTrialUsed(req: NextRequest) {
  if (await isUserLoggedIn(req)) return; // Don't track trial for logged-in users

  // Increment cookie counter
  try {
    const cookieStore = cookies();
    const existing = req.cookies.get('Oratii_trial_count');
    const currentCount = existing ? parseInt(existing.value, 10) || 0 : 0;
    const newCount = currentCount + 1;

    cookieStore.set('Oratii_trial_count', String(newCount), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  } catch (e) {
    // Cookie setting may fail in certain edge cases — ignore
  }

  // Increment IP counter
  if (req) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
    if (ip !== 'unknown') {
      const currentIpCount = trialIps.get(ip) || 0;
      trialIps.set(ip, currentIpCount + 1);
    }
  }
}

// Periodic cleanup of IP tracking map to prevent memory leaks (every 30 minutes)
const IP_CLEANUP_INTERVAL = 30 * 60 * 1000;
const MAX_IP_ENTRIES = 5000;

let ipCleanupTimer: NodeJS.Timeout | null = null;
if (!ipCleanupTimer) {
  ipCleanupTimer = setInterval(() => {
    if (trialIps.size > MAX_IP_ENTRIES) {
      // Remove oldest half of entries
      let count = 0;
      for (const key of trialIps.keys()) {
        trialIps.delete(key);
        count++;
        if (count >= MAX_IP_ENTRIES / 2) break;
      }
    }
  }, IP_CLEANUP_INTERVAL);
  if (ipCleanupTimer.unref) ipCleanupTimer.unref();
}
