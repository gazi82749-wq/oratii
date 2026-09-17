import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceSupabase } from '@/lib/supabaseClient';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/email';
import { CREDIT_PACKAGES } from '@/lib/credits';

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured on the server.');
      return NextResponse.json({ error: 'Webhook signature verification unconfigured.' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

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

    const supabase = getServiceSupabase();


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
            plan_name: (planName || 'standard').toLowerCase(),
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
            plan_name: (planName || 'standard').toLowerCase(),
            amount: payment.amount / 100,
            billing_cycle: 'month',
            payment_status: 'captured',
            subscription_status: 'active',
            end_date: endDate.toISOString(),
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
          });
      }

      // 3. Update the user's profile and add usage limits
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      await supabase
        .from('profiles')
        .update({
          current_plan: (planName || 'standard').toLowerCase(),
          plan_expiry: endDate.toISOString(),
        })
        .eq('id', userId);

      const targetPackage = CREDIT_PACKAGES?.find((p) => p.id === (planName || 'standard').toLowerCase());
      const creditsToAdd = targetPackage ? targetPackage.credits : 10;

      const { data: usage } = await supabase
        .from('usage_limits')
        .select('speech_analysis_count')
        .eq('user_id', userId)
        .maybeSingle();
      
      const currentSpeech = usage?.speech_analysis_count || 0;

      await supabase
        .from('usage_limits')
        .update({
          speech_analysis_count: currentSpeech + creditsToAdd,
        })
        .eq('user_id', userId);
        
      // Send Payment Success Email using Resend
      const userEmail = payment.email || userProfile?.email;
      if (userEmail) {
        await sendPaymentSuccessEmail(
          userEmail,
          userProfile?.full_name || 'Valued Speaker',
          planName || 'Credit Pack',
          payment.amount / 100
        );
      }
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
      
      // Send Payment Failure Email using Resend
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      const userEmail = payment.email || userProfile?.email;
      if (userEmail) {
        await sendPaymentFailedEmail(
          userEmail,
          userProfile?.full_name || 'Valued Speaker'
        );
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
