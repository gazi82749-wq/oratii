// src/app/api/notifications/send/route.ts
// Admin-only endpoint to send push notifications to users

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// Configure web-push with VAPID credentials
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_CONTACT = process.env.VAPID_CONTACT_EMAIL || 'mailto:hello@oratii.in';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate and verify admin role
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7).trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabaseAdmin = getServiceSupabase();

    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 2. Parse notification payload
    const { title, body, url, tag, userId: targetUserId } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'title and body are required' },
        { status: 400 }
      );
    }

    // 3. Fetch target subscriptions
    let query = supabaseAdmin.from('push_subscriptions').select('*');

    if (targetUserId) {
      // Send to specific user
      query = query.eq('user_id', targetUserId);
    }
    // else: broadcast to ALL subscriptions

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('[Push Send] Failed to fetch subscriptions:', fetchError.message);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, message: 'No subscriptions found' });
    }

    // 4. Build notification payload
    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      tag: tag || 'oratii-admin',
    });

    // 5. Send notifications in parallel, track results
    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
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

          // Update last_used_at timestamp
          await supabaseAdmin
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('endpoint', sub.endpoint);
        } catch (error: any) {
          failed++;
          // If subscription expired (410 Gone) or invalid (404), mark for cleanup
          if (error?.statusCode === 410 || error?.statusCode === 404) {
            expiredEndpoints.push(sub.endpoint);
          }
          console.error(`[Push Send] Failed for endpoint ${sub.endpoint.slice(0, 50)}...`, error?.message);
        }
      })
    );

    // 6. Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);

      console.log(`[Push Send] Cleaned up ${expiredEndpoints.length} expired subscriptions`);
    }

    return NextResponse.json({
      sent,
      failed,
      cleaned: expiredEndpoints.length,
      total: subscriptions.length,
    });
  } catch (error: any) {
    console.error('[Push Send] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET: Fetch push notification system stats & subscribers for Admin
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7).trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabaseAdmin = getServiceSupabase();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Query all subscriptions
    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, user_id, endpoint, created_at, last_used_at')
      .order('created_at', { ascending: false });

    if (subsError) {
      return NextResponse.json({ error: subsError.message }, { status: 500 });
    }

    const totalSubscriptions = subscriptions?.length || 0;
    const userIds = Array.from(new Set(subscriptions?.map(s => s.user_id).filter(Boolean)));
    const uniqueUsers = userIds.length;

    // Fetch user profiles for context
    let usersInfo: Record<string, { email: string; full_name?: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      profiles?.forEach(p => {
        usersInfo[p.id] = { email: p.email, full_name: p.full_name };
      });
    }

    return NextResponse.json({
      vapidConfigured: Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY),
      totalSubscriptions,
      uniqueUsers,
      subscriptions: (subscriptions || []).map(s => ({
        id: s.id,
        user_id: s.user_id,
        email: s.user_id ? usersInfo[s.user_id]?.email || 'Unknown user' : 'Anonymous device',
        user_name: s.user_id ? usersInfo[s.user_id]?.full_name || '' : '',
        created_at: s.created_at,
        last_used_at: s.last_used_at,
        endpoint_domain: s.endpoint ? new URL(s.endpoint).hostname : '',
      })),
    });
  } catch (error: any) {
    console.error('[Push Stats GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification stats', details: error?.message },
      { status: 500 }
    );
  }
}

