// src/app/api/trainer/assignments/route.ts
// Creates new assignments across the 3 Master Tracks (Speech, Interview, Presentation/Viva)

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7).trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { batchId, title, track, instructions, targetWpm, maxFillers, dueDate } = await request.json();

    if (!batchId || !title) {
      return NextResponse.json({ error: 'batchId and title are required' }, { status: 400 });
    }

    const supabaseAdmin = getServiceSupabase();

    // Verify trainer owns the batch
    const { data: batch } = await supabaseAdmin
      .from('batches')
      .select('id, trainer_id')
      .eq('id', batchId)
      .single();

    if (!batch || batch.trainer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: assignment, error: createError } = await supabaseAdmin
      .from('batch_assignments')
      .insert({
        batch_id: batchId,
        trainer_id: user.id,
        title: title.trim(),
        track: track || 'speech', // 'speech' | 'interview' | 'presentation_viva'
        instructions: instructions?.trim() || null,
        target_wpm: targetWpm || 140,
        max_fillers: maxFillers !== undefined ? maxFillers : 2,
        due_date: dueDate || null,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    console.error('[Trainer Assignments POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
