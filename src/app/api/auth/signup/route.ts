import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRateLimit, AUTH_RATE_LIMIT } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const DEFAULT_URL = 'https://vzbxhxlrmshmtgiocqkh.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhoeGxybXNobXRnaW9jcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDc2NDksImV4cCI6MjA5NjY4MzY0OX0.Ac7OU5VwtKvvdCmIxvzyuilWJYmLz7-qrLq8DVD_x2U';

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
  let email: string, password: string, fullName: string, role: string;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
    fullName = body.fullName || '';
    role = body.role === 'trainer' ? 'trainer' : 'student';
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

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

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://ppt-analyzer.vercel.app';
  const emailRedirectTo = role === 'trainer'
    ? `${origin}/auth/callback?next=/trainer/onboarding&role=trainer`
    : `${origin}/dashboard`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo,
    },
  });

  if (data?.user?.id) {
    try {
      const { getServiceSupabase } = await import('@/lib/supabaseClient');
      const adminClient = getServiceSupabase();
      await adminClient.from('profiles').upsert(
        {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (profileErr) {
      console.warn('Non-critical signup profile upsert notice:', profileErr);
    }
  }

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
