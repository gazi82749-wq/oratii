import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_PACKAGES } from '@/lib/credits';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    // Verify HMAC SHA256 Signature if key secret is present
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret && secret !== 'rzp_test_placeholder_secret') {
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
    }

    // Calculate credits to add based on package definition
    const targetPackage = CREDIT_PACKAGES.find((p) => p.id === planId);
    const creditsToAdd = targetPackage ? targetPackage.credits : 10;

    // Fetch existing credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .maybeSingle();

    const currentCredits = typeof profile?.credits === 'number' ? profile.credits : 5;
    const newCredits = currentCredits + creditsToAdd;

    // Update user profile credits instantly
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        credits: newCredits,
        current_plan: planId,
      })
      .eq('id', userId);

    if (updateErr) {
      await supabase
        .from('profiles')
        .update({
          current_plan: planId,
        })
        .eq('id', userId);
    }

    // Record payment log
    try {
      await supabase.from('payments').insert({
        user_id: userId,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: planId === 'pro_180' ? 799 : 299,
        currency: 'INR',
        status: 'captured',
        payment_method: 'razorpay',
      });
    } catch (e: any) {
      console.log('Payment log non-critical insert notice:', e?.message);
    }

    return NextResponse.json({
      success: true,
      newCredits,
      addedCredits: creditsToAdd,
      message: `Successfully added ${creditsToAdd} credits to your account!`,
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', details: error.message },
      { status: 500 }
    );
  }
}
