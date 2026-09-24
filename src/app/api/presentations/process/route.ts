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

    const { checkCache, setCache } = await import('@/lib/idempotency');
    const existingJob: any = await checkCache(`job:${presentationId}`);
    
    if (existingJob && existingJob.status === 'processing') {
      const startedAt = existingJob.startedAt || 0;
      const ageMs = Date.now() - startedAt;
      if (ageMs < 5 * 60 * 1000) { // 5 minutes
        return NextResponse.json({ error: 'Job is already processing' }, { status: 429 });
      }
    }

    // Set initial job status in Redis
    await setCache(`job:${presentationId}`, { status: 'processing', ownerId: user.id, startedAt: Date.now() }, 3600);

    if (!process.env.WORKER_SECRET) {
      console.error('CRITICAL: WORKER_SECRET is not configured.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Execute worker logic directly in this process to avoid Vercel serverless networking drops
    const { processPresentationFile } = await import('@/lib/presentationWorker');
    
    // We intentionally don't await this so it runs asynchronously, BUT in Next.js Serverless 
    // we need to use waitUntil if available, or just await it if we want to guarantee execution.
    // Since Vercel hobby allows up to 60s, and this is fast, we will await it.
    const resultObj = await processPresentationFile({ path, presentationId, userId: user.id });

    return NextResponse.json({
      status: 'completed',
      presentationId,
      slideTextContent: resultObj.slideTextContent,
      fileBase64: resultObj.fileBase64,
      isPdf: resultObj.isPdf
    });

  } catch (error: any) {
    console.error('Process error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
