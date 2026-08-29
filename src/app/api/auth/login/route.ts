// src/app/api/auth/login/route.ts
// Server-side login proxy with rate limiting (5 attempts per 15 minutes per IP)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, AUTH_RATE_LIMIT } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  const rateLimitKey = `login:${ip}`;
  const rateResult = checkRateLimit(rateLimitKey, AUTH_RATE_LIMIT);

  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please try again later.',
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
  let email: string, password: string;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // 3. Authenticate via Supabase (server-side, using anon key — same as client)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 401,
        headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
      }
    );
  }

  // 4. Return session tokens to the client
  return NextResponse.json(
    {
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
