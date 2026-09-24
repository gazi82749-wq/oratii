import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndRateLimit } from '@/lib/apiWrapper';
import { setCache } from '@/lib/idempotency';

export const dynamic = 'force-dynamic';

export const POST = withAuthAndRateLimit(async (request, { user }) => {
  try {
    const { path, presentationId } = await request.json();

    if (!path || !presentationId) {
      return NextResponse.json({ error: 'Missing path or presentationId' }, { status: 400 });
    }

    if (!path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: 'Unauthorized path access' }, { status: 403 });
    }

    // Set initial job status in Redis
    await setCache(`job:${presentationId}`, { status: 'processing', ownerId: user.id }, 3600);

    // Fire and forget worker call
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // We do NOT await this fetch to allow it to run asynchronously as a new request
    fetch(`${protocol}://${host}/api/presentations/worker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Secure internal invocation using explicit secret or fallback to service role key
        'x-worker-secret': process.env.WORKER_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      },
      body: JSON.stringify({ path, presentationId, userId: user.id })
    }).catch(err => console.error("Worker fetch failed:", err));

    return NextResponse.json({
      status: 'processing',
      presentationId
    });

  } catch (error: any) {
    console.error('Process error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
