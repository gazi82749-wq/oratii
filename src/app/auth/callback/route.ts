import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Handles OAuth callback from Google (or other providers).
 * Supabase redirects back to this endpoint with a `code` parameter.
 * We exchange `code` for a session (which sets auth cookies), set our `Oratii_logged_in` cookie,
 * and redirect the user to `/dashboard` (or the intended `next` path).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const roleParam = requestUrl.searchParams.get('role');
  const nextParam = requestUrl.searchParams.get('next') || '/dashboard';
  let targetPath = nextParam.startsWith('/') ? nextParam : `/${nextParam}`;

  const isSignup = requestUrl.searchParams.get('is_signup') === 'true';

  if (code) {
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
            // Ignored if called in read-only context
          }
        },
      },
    });

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      // 1. If roleParam is provided, persist to profiles
      if (roleParam === 'trainer') {
        try {
          const { getServiceSupabase } = await import('@/lib/supabaseClient');
          const adminClient = getServiceSupabase();
          await adminClient.from('profiles').upsert(
            {
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              role: 'trainer',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('[OAuth Callback] Profile upsert notice:', profileErr);
        }
      }

      // 2. Check if user is trainer and if academy onboarding is required
      try {
        const { getServiceSupabase } = await import('@/lib/supabaseClient');
        const adminClient = getServiceSupabase();
        const { data: profile } = await adminClient
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.role === 'trainer') {
          const { data: academy } = await adminClient
            .from('academies')
            .select('id')
            .eq('owner_id', session.user.id)
            .maybeSingle();

          if (!academy) {
            targetPath = '/trainer/onboarding';
          }
        }
      } catch (checkErr) {
        console.warn('[OAuth Callback] Trainer check notice:', checkErr);
      }

      // If initial Google Signup, route via setup-password page
      let finalRedirectUrl = targetPath;
      if (isSignup) {
        finalRedirectUrl = `/setup-password?next=${encodeURIComponent(targetPath)}`;
      }

      const response = NextResponse.redirect(new URL(finalRedirectUrl, request.url));
      response.cookies.set('Oratii_logged_in', 'true', {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      });
      return response;
    }
  }

  // If code is missing or exchange failed, redirect back to login page
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
}
