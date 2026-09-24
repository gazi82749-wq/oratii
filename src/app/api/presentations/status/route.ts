import { NextRequest, NextResponse } from 'next/server';
import { withAuthAndRateLimit } from '@/lib/apiWrapper';
import { checkCache } from '@/lib/idempotency';

export const dynamic = 'force-dynamic';

export const GET = withAuthAndRateLimit(async (request, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const presentationId = searchParams.get('id');

    if (!presentationId) {
      return NextResponse.json({ error: 'Missing presentationId' }, { status: 400 });
    }

    const job: any = await checkCache(`job:${presentationId}`);
    
    if (!job) {
      return NextResponse.json({ status: 'not_found' });
    }

    if (job.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(job);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
