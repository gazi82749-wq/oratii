// src/app/api/notifications/subscribe/route.ts
// Receives and stores Web Push subscription objects from client browsers

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to subscribe to notifications.' },
        { status: 401 }
      );
    }

    // 2. Parse subscription object from request body
    const subscription = await request.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid push subscription object.' },
        { status: 400 }
      );
    }

    // 3. Upsert subscription into database (using service role to bypass RLS for upsert)
    const supabaseAdmin = getServiceSupabase();

    const { error: upsertError } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          keys_p256dh: subscription.keys.p256dh,
          keys_auth: subscription.keys.auth,
          last_used_at: new Date().toISOString(),
        },
        {
          onConflict: 'endpoint',
        }
      );

    if (upsertError) {
      console.error('[Push Subscribe] Database error:', upsertError.message);
      return NextResponse.json(
        { error: 'Failed to save subscription.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: 'subscribed' });
  } catch (error: any) {
    console.error('[Push Subscribe] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
