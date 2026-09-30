import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, AI_RATE_LIMIT } from './lib/rateLimit';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

  // 0. Guard API Routes with Rate Limiting (Anti-Spam / DDoS)
  if (pathname.startsWith('/api/')) {
    // Only rate limit AI analysis / heavy processing routes
    const isAiRoute = [
      '/api/viva',
      '/api/speech-writer',
      '/api/speech-analyzer-deep',
      '/api/interview-eval',
      '/api/analyze-presentation-mode',
      '/api/analyze-body-language',
      '/api/coach-chat'
    ].some(route => pathname.startsWith(route));

    if (isAiRoute) {
      // Use standard header for IP extraction in Vercel
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
      
      const { allowed } = await checkRateLimit(ip, AI_RATE_LIMIT);
      
      if (!allowed) {
        return new NextResponse(
          JSON.stringify({ error: "Too many requests. Please wait 10 minutes before trying again." }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // 0.5 Redirect /dashboard/admin to /admin
  if (pathname === '/dashboard/admin') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // 1. Guard /admin routes (both UI and API)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname === '/admin/login') return res;
    
    const isApi = pathname.startsWith('/api/');
    
    if (!user || user.email !== 'gazi82749@gmail.com') {
      if (isApi) {
        return new NextResponse(JSON.stringify({ error: "Forbidden: Admin access only" }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
      return NextResponse.redirect(new URL(user ? '/dashboard' : '/admin/login', req.url));
    }
  }

  // 2. Guard /trainer routes
  if (pathname.startsWith('/trainer')) {
    if (!user) return NextResponse.redirect(new URL('/login?redirectedFrom=' + pathname, req.url));
  }

  // 3. Guard private user routes (/dashboard, /profile, /account)
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
    '/api/:path*'
  ],
};
