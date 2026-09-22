import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabaseClient';
import { checkRateLimit, AI_RATE_LIMIT } from './rateLimit';

// Types for Supabase User
import { User } from '@supabase/supabase-js';

type RouteHandler = (
  req: NextRequest,
  context: { user: User; ip: string }
) => Promise<NextResponse>;

export function withAuthAndRateLimit(handler: RouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Rate limiting by IP
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
      const rateResult = await checkRateLimit(`ai:${ip}`, AI_RATE_LIMIT);
      
      if (!rateResult.allowed) {
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

      // Fallback: Check if the user is passing it via body in the first pass
      // Some existing routes do this: userId = bodyUserId || request.headers.get('x-user-id');
      if (!user) {
        const headerUserId = req.headers.get('x-user-id');
        if (headerUserId) {
          user = { id: headerUserId } as User;
        } else {
          // If still no user, we might need to clone the request to parse the JSON
          // safely without consuming the body stream for the actual handler.
          const clonedReq = req.clone();
          try {
            const body = await clonedReq.json();
            if (body.userId) {
              user = { id: body.userId } as User;
            }
          } catch (e) {
            // Body might be empty or invalid JSON, which is fine
          }
        }
      }

      if (!user) {
        return NextResponse.json(
          { error: "Authentication required. Please sign in.", authRequired: true },
          { status: 401 }
        );
      }

      // 3. Execute the actual handler
      return await handler(req, { user, ip });
    } catch (error: any) {
      console.error('[API Wrapper Error]', error);
      return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
      );
    }
  };
}
