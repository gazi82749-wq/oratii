// src/app/api/trainer/join/route.ts
// Resolves batch info by 6-digit code and enrolls students

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const supabaseAdmin = getServiceSupabase();

    const { data: batch, error } = await supabaseAdmin
      .from('batches')
      .select('id, name, code, description, track, is_active, academies(name, city)')
      .ilike('code', code)
      .maybeSingle();

    if (error || !batch) {
      return NextResponse.json({ error: 'Invalid or expired batch code' }, { status: 404 });
    }

    return NextResponse.json({ batch });
  } catch (error: any) {
    console.error('[Trainer Join GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to join.' }, { status: 401 });
    }

    const token = authHeader.substring(7).trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Batch code is required' }, { status: 400 });
    }

    const supabaseAdmin = getServiceSupabase();

    // 1. Resolve batch
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('id, name, academy_id, academies(name)')
      .ilike('code', code.trim().toUpperCase())
      .maybeSingle();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found. Please check your code.' }, { status: 404 });
    }

    // 2. Enroll student in batch_members (upsert)
    const { error: enrollError } = await supabaseAdmin
      .from('batch_members')
      .upsert(
        {
          batch_id: batch.id,
          student_id: user.id,
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: 'batch_id,student_id' }
      );

    if (enrollError) {
      console.error('[Trainer Join POST] Enroll error:', enrollError.message);
      return NextResponse.json({ error: 'Failed to enroll in batch' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${batch.name}!`,
      batch,
    });
  } catch (error: any) {
    console.error('[Trainer Join POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
