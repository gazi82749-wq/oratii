import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { planName, userId, billingCycle } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Update the user's profile and reset usage limits
    await supabaseAdmin
      .from('profiles')
      .update({
        current_plan: planName.toLowerCase(),
        plan_expiry: endDate.toISOString(),
      })
      .eq('id', userId);

    await supabaseAdmin
      .from('usage_limits')
      .update({
        speech_analysis_count: 0,
        ppt_analysis_count: 0,
        viva_sessions_count: 0,
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
