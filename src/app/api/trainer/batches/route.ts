// src/app/api/trainer/batches/route.ts
// Lists and creates batches for a trainer with auto-generated 6-character invite codes

import { NextRequest, NextResponse } from 'next/server';
import { getTrainerDbClient, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

function generateBatchCode(prefix: string): string {
  const cleanPrefix = prefix.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'ORAT';
  const randomSuffix = Math.floor(10 + Math.random() * 90); // 2-digit number e.g. 26
  return `${cleanPrefix}${randomSuffix}`;
}

export async function GET(request: NextRequest) {
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

    const supabaseAdmin = getTrainerDbClient(token);

    // Query batches owned by this trainer
    const { data: batches, error: batchError } = await supabaseAdmin
      .from('batches')
      .select(`
        id,
        academy_id,
        name,
        code,
        description,
        track,
        is_active,
        created_at
      `)
      .eq('trainer_id', user.id)
      .order('created_at', { ascending: false });

    if (batchError) {
      return NextResponse.json({ error: batchError.message }, { status: 500 });
    }

    const batchIds = (batches || []).map((b) => b.id);

    // Fetch student member counts per batch
    let memberCounts: Record<string, number> = {};
    let submissionCounts: Record<string, number> = {};

    if (batchIds.length > 0) {
      const [membersRes, subsRes] = await Promise.all([
        supabaseAdmin.from('batch_members').select('batch_id').in('batch_id', batchIds),
        supabaseAdmin.from('batch_submissions').select('batch_id').in('batch_id', batchIds),
      ]);

      membersRes.data?.forEach((m) => {
        memberCounts[m.batch_id] = (memberCounts[m.batch_id] || 0) + 1;
      });

      subsRes.data?.forEach((s) => {
        submissionCounts[s.batch_id] = (submissionCounts[s.batch_id] || 0) + 1;
      });
    }

    const enrichedBatches = (batches || []).map((b) => ({
      ...b,
      studentCount: memberCounts[b.id] || 0,
      submissionCount: submissionCounts[b.id] || 0,
    }));

    return NextResponse.json({ batches: enrichedBatches });
  } catch (error: any) {
    console.error('[Trainer Batches GET] Error:', error);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7).trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { name, description, track } = await request.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Batch name is required' }, { status: 400 });
    }

    const supabaseAdmin = getTrainerDbClient(token);

    // Verify user is an authorized trainer or admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'trainer' && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Only verified educators or speech coaches can create student batches.' },
        { status: 403 }
      );
    }

    // Check trainer's academy
    let { data: academy } = await supabaseAdmin
      .from('academies')
      .select('id, name')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!academy) {
      // Auto-create an academy placeholder for the trainer
      const { data: newAcademy } = await supabaseAdmin
        .from('academies')
        .insert({
          owner_id: user.id,
          name: `${user.email?.split('@')[0] || 'Trainer'}'s Academy`,
        })
        .select()
        .single();
      academy = newAcademy;
    }

    // Generate unique batch code
    let code = generateBatchCode(name);
    // Ensure uniqueness
    const { data: existing } = await supabaseAdmin
      .from('batches')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (existing) {
      code = `${code.slice(0, 3)}${Math.floor(100 + Math.random() * 900)}`;
    }

    const { data: batch, error: createError } = await supabaseAdmin
      .from('batches')
      .insert({
        academy_id: academy?.id,
        trainer_id: user.id,
        name: name.trim(),
        code,
        description: description?.trim() || null,
        track: track || 'all',
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    console.error('[Trainer Batches POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ error: 'batchId query parameter is required' }, { status: 400 });
    }

    const supabaseAdmin = getTrainerDbClient(token);

    // Delete batch owned by this trainer
    const { error: deleteError } = await supabaseAdmin
      .from('batches')
      .delete()
      .eq('id', batchId)
      .eq('trainer_id', user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Trainer Batches DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
