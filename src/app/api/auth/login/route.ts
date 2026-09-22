import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { checkRateLimit, AUTH_RATE_LIMIT } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  // 1. Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  const rateLimitKey = `login:${ip}`;
  const rateResult = await checkRateLimit(rateLimitKey, AUTH_RATE_LIMIT);

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

  // 3. Authenticate via Supabase server client (sets cookies on response)
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

  // 4. Check role and academy onboarding status
  let userRole = 'student';
  let hasAcademy = false;

  if (data.user?.id) {
    try {
      const { getServiceSupabase } = await import('@/lib/supabaseClient');
      const adminClient = getServiceSupabase();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role) {
        userRole = profile.role;
      }

      if (userRole === 'trainer' || userRole === 'admin') {
        const { data: academy } = await adminClient
          .from('academies')
          .select('id')
          .eq('owner_id', data.user.id)
          .maybeSingle();

        if (academy) {
          hasAcademy = true;
        }
      }
    } catch (checkErr) {
      console.warn('[Login Route] Profile check notice:', checkErr);
    }
  }

  // 5. Return session tokens and user info to the client
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
        role: userRole,
        hasAcademy,
        user_metadata: data.user?.user_metadata,
      },
    },
    {
      status: 200,
      headers: { 'X-RateLimit-Remaining': String(rateResult.remaining) },
    }
  );
}
