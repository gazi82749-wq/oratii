import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzbxhxlrmshmtgiocqkh.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhoeGxybXNobXRnaW9jcWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDc2NDksImV4cCI6MjA5NjY4MzY0OX0.Ac7OU5VwtKvvdCmIxvzyuilWJYmLz7-qrLq8DVD_x2U';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // 1. Guard /admin routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      }
      return res;
    }

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login?unauthorized=true', req.url));
    }
  }

  // 2. Guard /trainer routes
  if (pathname.startsWith('/trainer')) {
    if (pathname === '/trainer/onboarding') {
      if (!user) {
        return NextResponse.redirect(new URL('/login?redirectedFrom=/trainer/onboarding', req.url));
      }
      return res;
    }

    if (!user) {
      return NextResponse.redirect(new URL('/login?redirectedFrom=' + pathname, req.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'trainer' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/trainer/onboarding', req.url));
    }
  }

  // 3. Guard private user routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/account')
  ) {
    const hasLoggedInCookie = req.cookies.get('Oratii_logged_in')?.value === 'true';
    if (!user && !hasLoggedInCookie) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/trainer/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/account/:path*',
  ],
};
