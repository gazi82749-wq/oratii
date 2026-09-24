import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabaseClient';
import { checkRateLimit, AI_RATE_LIMIT } from './rateLimit';
import { logSystemEvent } from './logger';

// Types for Supabase User
import { User } from '@supabase/supabase-js';

type RouteHandler = (
  req: NextRequest,
  context: { user: User; ip: string }
) => Promise<NextResponse>;

export function withAuthAndRateLimit(handler: RouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const pathname = req.nextUrl?.pathname || req.url || 'API Route';
    try {
      // 1. Rate limiting by IP
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
      const rateResult = await checkRateLimit(`ai:${ip}`, AI_RATE_LIMIT);
      
      if (!rateResult.allowed) {
        logSystemEvent({
          severity: 'warning',
          category: 'API Rate Limit',
          message: `Rate limit hit on ${pathname} by IP ${ip}`,
          source: pathname,
          details: `Retry after ${rateResult.retryAfterSeconds}s`,
        });

        return NextResponse.json({
          error: "Too Many Requests",
          message: `Please wait ${rateResult.retryAfterSeconds} seconds before trying again.`
        }, { status: 429 });
      }

      // 2. Mandatory authentication
      let user: User | null = null;
      const authHeader = req.headers.get('authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        try {
          const { data } = await supabase.auth.getUser(token);
          user = data?.user || null;
        } catch (e) {
          // ignore parsing error
        }
      }

      if (!user) {
        // We also check if Next.js cookies have a session since some components rely on the browser cookie
        // rather than the Bearer token directly.
        try {
          const { data } = await supabase.auth.getUser();
          user = data?.user || null;
        } catch(e) {}
      }

      if (!user) {
        logSystemEvent({
          severity: 'info',
          category: 'Auth',
          message: `Unauthenticated request attempt to ${pathname}`,
          source: pathname,
          details: `IP: ${ip}`,
        });

        return NextResponse.json(
          { error: "Authentication required. Please sign in.", authRequired: true },
          { status: 401 }
        );
      }

      // 3. Execute the actual handler
      return await handler(req, { user, ip });
    } catch (error: any) {
      console.error('[API Wrapper Error]', error);
      logSystemEvent({
        severity: 'critical',
        category: 'API Route',
        message: `API Handler Error (500) on ${pathname}: ${error.message || 'Unknown Exception'}`,
        source: pathname,
        details: error.stack || error.message || String(error),
      });

      return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
      );
    }
  };
}
