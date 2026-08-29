// src/app/api/auth/signup/route.ts
// Server-side signup proxy with rate limiting (5 attempts per 15 minutes per IP)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, AUTH_RATE_LIMIT } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  const rateLimitKey = `signup:${ip}`;
  const rateResult = checkRateLimit(rateLimitKey, AUTH_RATE_LIMIT);

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
  let email: string, password: string, fullName: string;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
    fullName = body.fullName || '';
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

  // 4. Create user via Supabase (server-side, using anon key)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
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

  // Check for duplicate account (Supabase returns user with empty identities)
  if (data?.user?.identities?.length === 0) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      {
        status: 409,
        headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
      }
    );
  }

  // Email confirmation required (no session returned)
  if (data?.user && !data?.session) {
    return NextResponse.json(
      {
        status: 'confirmation_required',
        message: 'Please check your email to confirm your account.',
        user: { id: data.user.id, email: data.user.email },
      },
      {
        status: 200,
        headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
      }
    );
  }

  // Direct sign-in (email confirmation disabled in Supabase settings)
  return NextResponse.json(
    {
      status: 'success',
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
        token_type: data.session?.token_type,
      },
      user: {
        id: data.user?.id,
        email: data.user?.email,
        user_metadata: data.user?.user_metadata,
      },
    },
    {
      status: 200,
      headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
    }
  );
}
