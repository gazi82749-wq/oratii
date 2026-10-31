import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRateLimit, AUTH_RATE_LIMIT } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  // 1. Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  const rateLimitKey = `signup:${ip}`;
  const rateResult = await checkRateLimit(rateLimitKey, AUTH_RATE_LIMIT);

  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        error: 'Too many signup attempts. Please try again later.',
        retryAfterSeconds: rateResult.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateResult.retryAfterSeconds),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // 2. Parse request body
  let email: string, password: string, fullName: string, role: string, refCode: string;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
    fullName = body.fullName || '';
    role = body.role === 'trainer' ? 'trainer' : 'student';
    refCode = (body.refCode || '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // 3. Basic server-side validation
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // 4. Create user via Supabase server client (sets cookies on response)
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignored if called in read context
        }
      },
    },
  });

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';
  const emailRedirectTo = role === 'trainer'
    ? `${origin}/auth/callback?next=/trainer/onboarding&role=trainer`
    : `${origin}/dashboard`;

  const { getServiceSupabase } = await import('@/lib/supabaseClient');
  const adminClient = getServiceSupabase();
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  let createdUser: { id: string; email?: string } | null = null;
  let userSession: any = null;

  if (hasServiceRole) {
    // 1. Create confirmed user directly via Supabase admin API
    // Bypasses Supabase default 3-email/hr SMTP limit and grants instant activation
    const { data: adminUser, error: adminErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (adminErr) {
      const errMsg = (adminErr.message || '').toLowerCase();
      if (
        errMsg.includes('already') ||
        adminErr.status === 422 ||
        (adminErr as any).code === 'email_exists'
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          {
            status: 409,
            headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
          }
        );
      }
      return NextResponse.json(
        { error: adminErr.message || 'Signup failed' },
        {
          status: 400,
          headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
        }
      );
    }

    if (adminUser?.user) {
      createdUser = { id: adminUser.user.id, email: adminUser.user.email };
    }

    // 2. Immediately sign in the new user to generate authentic session tokens & auth cookies
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInErr) {
      console.warn('Auto sign-in post-creation warning:', signInErr.message);
    } else if (signInData?.session) {
      userSession = signInData.session;
    }
  } else {
    // Fallback to client signUp if service role key is absent
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 400,
          headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
        }
      );
    }

    if (data?.user?.identities?.length === 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        {
          status: 409,
          headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
        }
      );
    }

    if (data?.user) {
      createdUser = { id: data.user.id, email: data.user.email };
    }
    userSession = data?.session || null;
  }

  // 3. Upsert user profile, usage limits, and referral bonus
  if (createdUser?.id) {
    try {
      let initialCredits = 10;
      let referrerUser: any = null;

      if (refCode) {
        const { data: foundReferrers } = await adminClient
          .from('profiles')
          .select('id, credits')
          .or(`id.eq.${refCode},id.like.${refCode}%`)
          .limit(1);

        if (foundReferrers && foundReferrers.length > 0) {
          referrerUser = foundReferrers[0];
          initialCredits = 15; // 10 Base + 5 Referral Bonus
        }
      }

      const { isAuthorizedAdminEmail } = await import('@/lib/adminAuth');
      const dbRole = isAuthorizedAdminEmail(createdUser.email || email) ? 'admin' : 'user';

      await adminClient.from('profiles').upsert(
        {
          id: createdUser.id,
          email: createdUser.email || email,
          full_name: fullName,
          role: dbRole,
          credits: initialCredits,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (referrerUser?.id) {
        await adminClient
          .from('profiles')
          .update({
            credits: (referrerUser.credits || 10) + 5,
            updated_at: new Date().toISOString(),
          })
          .eq('id', referrerUser.id);
      }

      await adminClient.from('usage_limits').upsert(
        {
          user_id: createdUser.id,
          speech_analysis_count: 10,
          ppt_analysis_count: 5,
          viva_sessions_count: 5,
          current_month: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch (profileErr) {
      console.warn('Non-critical signup profile upsert notice:', profileErr);
    }
  }

  // 4. Send Welcome Email via Resend asynchronously
  if (email) {
    import('@/lib/email').then(({ sendWelcomeEmail }) => {
      sendWelcomeEmail(email, fullName || email.split('@')[0]).catch(err => {
        console.warn('Welcome email non-critical notice:', err);
      });
    });
  }

  // 5. If confirmation is still required (e.g. fallback mode without session)
  if (!userSession && createdUser) {
    return NextResponse.json(
      {
        status: 'confirmation_required',
        message: 'Please check your email to confirm your account.',
        user: { id: createdUser.id, email: createdUser.email || email },
      },
      {
        status: 200,
        headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
      }
    );
  }

  // 6. Direct sign-in success with active session
  return NextResponse.json(
    {
      status: 'success',
      session: {
        access_token: userSession?.access_token,
        refresh_token: userSession?.refresh_token,
        expires_in: userSession?.expires_in,
        token_type: userSession?.token_type,
      },
      user: {
        id: createdUser?.id,
        email: createdUser?.email || email,
        user_metadata: { full_name: fullName, role },
      },
    },
    {
      status: 200,
      headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
    }
  );
}
