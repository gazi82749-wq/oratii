import { NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    const token = authHeader.substring(7).trim();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session token.' }, { status: 401 });
    }

    const { planName, userId, billingCycle } = await req.json();

    if (!userId || !planName) {
      return NextResponse.json({ error: 'userId and planName are required' }, { status: 400 });
    }

    // Verify caller is modifying their own account or is an admin
    const supabaseAdmin = getServiceSupabase();
    if (user.id !== userId) {
      const { data: callerProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (callerProfile?.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: You cannot modify another user's subscription." }, { status: 403 });
      }
    }

    const endDate = new Date();
    if (billingCycle === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1); // Add 1 year
    } else {
      endDate.setMonth(endDate.getMonth() + 1); // Add 1 month
    }

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingSub) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan_name: planName.toLowerCase(),
          payment_status: 'captured',
          subscription_status: 'active',
          end_date: endDate.toISOString(),
          billing_cycle: billingCycle === 'year' ? 'year' : 'month',
          razorpay_payment_id: 'free_gateway',
        })
        .eq('user_id', userId);
    } else {
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_name: planName.toLowerCase(),
          amount: 0,
          billing_cycle: billingCycle === 'year' ? 'year' : 'month',
          payment_status: 'captured',
          subscription_status: 'active',
          end_date: endDate.toISOString(),
          razorpay_payment_id: 'free_gateway',
          razorpay_order_id: 'free_gateway',
        });
    }

    // Update the user's profile and reset usage limits to 10 free credits
    await supabaseAdmin
      .from('profiles')
      .update({
        current_plan: planName.toLowerCase(),
        credits: 10,
        plan_expiry: endDate.toISOString(),
      })
      .eq('id', userId);

    await supabaseAdmin
      .from('usage_limits')
      .update({
        speech_analysis_count: 10,
        ppt_analysis_count: 5,
        viva_sessions_count: 5,
        current_month: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Free upgrade error:', error);
    return NextResponse.json(
      { error: 'Free upgrade failed' },
      { status: 500 }
    );
  }
}
