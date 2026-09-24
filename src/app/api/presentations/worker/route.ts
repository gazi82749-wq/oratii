import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import JSZip from 'jszip';
import { parseSlideXml, parseNotesXml } from '@/lib/pptxParser';
import { setCache } from '@/lib/idempotency';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

import { processPresentationFile } from '@/lib/presentationWorker';

export async function POST(request: NextRequest) {
  let presentationId = '';
  let userId = '';
  try {
    const secret = request.headers.get('x-worker-secret') || '';
    const expectedSecret = process.env.WORKER_SECRET;
    
    if (!expectedSecret) {
      console.error('CRITICAL: WORKER_SECRET is not configured.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    let isMatch = secret.length === expectedSecret.length;
    for (let i = 0; i < expectedSecret.length; i++) {
      if (secret[i] !== expectedSecret[i]) {
        isMatch = false;
      }
    }
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    presentationId = body.presentationId;
    userId = body.userId;
    const path = body.path;

    if (!path || !presentationId) {
      return NextResponse.json({ error: 'Missing path or presentationId' }, { status: 400 });
    }

    await processPresentationFile({ path, presentationId, userId });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Worker error:', error);
    if (presentationId) {
      await setCache(`job:${presentationId}`, { status: 'failed', error: error.message, ownerId: userId }, 3600).catch(()=>{});
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
