import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { withAuthAndRateLimit } from '@/lib/apiWrapper';

export const dynamic = 'force-dynamic';

export const POST = withAuthAndRateLimit(async (request, { user }) => {
  try {
    const { filename, contentType, size } = await request.json();

    if (!filename || !contentType || !size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 413 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!allowedTypes.includes(contentType) && !filename.endsWith('.pdf') && !filename.endsWith('.pptx') && !filename.endsWith('.ppt')) {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    const presentationId = `pres-${Date.now()}`;
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${user.id}/${presentationId}/${cleanFilename}`;

    const { getServiceSupabase } = await import('@/lib/supabaseClient');
    const serviceSupabase = getServiceSupabase();

    const { data, error } = await serviceSupabase.storage
      .from('presentations')
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error('Storage error:', error);
      return NextResponse.json({ error: 'Failed to initialize upload' }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      presentationId
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
