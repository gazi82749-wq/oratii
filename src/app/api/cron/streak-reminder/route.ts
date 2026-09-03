// src/app/api/cron/streak-reminder/route.ts
// Automated daily streak reminder cron job
// Scheduled via vercel.json to run at 8:00 PM IST (14:30 UTC) daily

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// Configure web-push with VAPID credentials
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_CONTACT = process.env.VAPID_CONTACT_EMAIL || 'mailto:admin@oratii.app';
const CRON_SECRET = process.env.CRON_SECRET;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function GET(request: NextRequest) {
  return handleStreakReminder(request);
}

export async function POST(request: NextRequest) {
  return handleStreakReminder(request);
}

async function handleStreakReminder(request: NextRequest) {
  try {
    // 1. Authenticate the request:
    // Allow either:
    // - Vercel Cron header (CRON_SECRET in Authorization header)
    // - Admin session token (when manually triggered from /admin/notifications)
    const authHeader = request.headers.get('authorization');
    const isVercelCron = Boolean(
      (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) ||
      request.headers.get('x-vercel-cron')
    );

    let isAdmin = false;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (!CRON_SECRET || token !== CRON_SECRET) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const supabaseAdmin = getServiceSupabase();
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role === 'admin') {
            isAdmin = true;
          }
        }
      }
    }

    if (!isVercelCron && !isAdmin) {
      // In development or when no CRON_SECRET set, allow local admin testing
      const isLocalDev = process.env.NODE_ENV === 'development';
      if (!isLocalDev) {
        return NextResponse.json(
          { error: 'Unauthorized. Requires valid CRON_SECRET or Admin privileges.' },
          { status: 401 }
        );
      }
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPID keys not configured on server.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = getServiceSupabase();

    // 2. Query all active push subscriptions
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*');

    if (subsError) {
      console.error('[Streak Reminder] Failed to fetch subscriptions:', subsError.message);
      return NextResponse.json({ error: subsError.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No push subscriptions found. Nothing to send.',
        sent: 0,
      });
    }

    // 3. Extract unique user IDs to check streak stats
    const userIds = Array.from(
      new Set(subscriptions.map((s) => s.user_id).filter(Boolean))
    );

    // Fetch user stats
    const statsMap: Record<string, { current_streak: number }> = {};
    if (userIds.length > 0) {
      const { data: statsList } = await supabaseAdmin
        .from('user_stats')
        .select('user_id, current_streak')
        .in('user_id', userIds);

      statsList?.forEach((st) => {
        if (st.user_id) {
          statsMap[st.user_id] = { current_streak: st.current_streak || 0 };
        }
      });
    }

    // 4. Send streak reminders
    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const userStreak = sub.user_id ? statsMap[sub.user_id]?.current_streak || 0 : 0;

        let title = '🔥 Don’t break your streak!';
        let body = 'Practice a 2-minute speaking drill today to keep your daily momentum alive!';

        if (userStreak > 1) {
          title = `🔥 Keep your ${userStreak}-day streak alive!`;
          body = `You're on fire with a ${userStreak}-day streak. Practice before midnight to keep it!`;
        } else if (userStreak === 1) {
          title = '🔥 Day 2 is waiting for you!';
          body = 'You started strong yesterday. Complete today’s session to build a 2-day streak!';
        } else {
          title = '🎙️ 2-Minute Speaking Drill';
          body = 'Sharpen your vocal pace and eliminate fillers with a quick practice session today.';
        }

        const payload = JSON.stringify({
          title,
          body,
          url: '/speech-coach',
          tag: 'streak-reminder',
        });

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
          sent++;

          await supabaseAdmin
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('endpoint', sub.endpoint);
        } catch (error: any) {
          failed++;
          if (error?.statusCode === 410 || error?.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // 5. Cleanup expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sent,
      failed,
      cleanedExpired: expiredEndpoints.length,
      totalRecipients: subscriptions.length,
    });
  } catch (error: any) {
    console.error('[Streak Reminder] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}
