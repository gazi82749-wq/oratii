import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase client with the service role key to bypass RLS for webhook updates
// Note: We need a service role key in production, but we'll use ANON for now if SERVICE_ROLE isn't set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzbxhxlrmshmtgiocqkh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhoeGxybXNobXRnaW9jcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDc2NDksImV4cCI6MjA5NjY4MzY0OX0.Ac7OU5VwtKvvdCmIxvzyuilWJYmLz7-qrLq8DVD_x2U';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder';

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle Payment Captured
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const { userId, planName } = payment.notes;

      // Idempotency check: prevent double-processing on Razorpay webhook retries
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status')
        .eq('payment_id', payment.id)
        .maybeSingle();

      if (existingPayment) {
        return NextResponse.json({ status: 'ok', message: 'Webhook event already processed' });
      }

      // 1. Record the payment
      await supabase.from('payments').insert({
        user_id: userId,
        payment_id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: 'captured',
        payment_method: payment.method,
      });

      // 2. Update or create the subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Add 1 month

      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingSub) {
        await supabase
          .from('subscriptions')
          .update({
            plan_name: planName.toLowerCase(),
            payment_status: 'captured',
            subscription_status: 'active',
            end_date: endDate.toISOString(),
            razorpay_payment_id: payment.id,
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_name: planName.toLowerCase(),
            amount: payment.amount / 100,
            billing_cycle: 'month',
            payment_status: 'captured',
            subscription_status: 'active',
            end_date: endDate.toISOString(),
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
          });
      }

      // 3. Update the user's profile and reset usage limits
      await supabase
        .from('profiles')
        .update({
          current_plan: planName.toLowerCase(),
          plan_expiry: endDate.toISOString(),
        })
        .eq('id', userId);

      await supabase
        .from('usage_limits')
        .update({
          speech_analysis_count: 0,
          ppt_analysis_count: 0,
          viva_sessions_count: 0,
          current_month: new Date().toISOString(),
        })
        .eq('user_id', userId);
        
      // TODO: Send Success Email using Resend
    }

    // Handle Payment Failed
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const { userId } = payment.notes;

      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('payment_id', payment.id)
        .maybeSingle();

      if (existingPayment) {
        return NextResponse.json({ status: 'ok', message: 'Webhook event already processed' });
      }

      await supabase.from('payments').insert({
        user_id: userId,
        payment_id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: 'failed',
        payment_method: payment.method,
      });
      
      // TODO: Send Failure Email using Resend
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
