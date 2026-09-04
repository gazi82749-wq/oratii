// src/app/api/trainer/batches/[id]/route.ts
// Detailed batch roster, assignments, and student gradebook

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = params.id;
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7).trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabaseAdmin = getServiceSupabase();

    // 1. Fetch batch info
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('batches')
      .select('*, academies(name, city)')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Verify trainer ownership
    if (batch.trainer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch enrolled students
    const { data: members } = await supabaseAdmin
      .from('batch_members')
      .select('student_id, enrolled_at')
      .eq('batch_id', batchId);

    const studentIds = (members || []).map((m) => m.student_id);

    let studentProfiles: Record<string, any> = {};
    if (studentIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, credits')
        .in('id', studentIds);

      profiles?.forEach((p) => {
        studentProfiles[p.id] = p;
      });
    }

    // 3. Fetch assignments
    const { data: assignments } = await supabaseAdmin
      .from('batch_assignments')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false });

    // 4. Fetch submissions
    const { data: submissions } = await supabaseAdmin
      .from('batch_submissions')
      .select('*')
      .eq('batch_id', batchId)
      .order('submitted_at', { ascending: false });

    // 5. Aggregate student metrics for the Gradebook
    const gradebook = studentIds.map((sid) => {
      const p = studentProfiles[sid] || {};
      const studentSubs = (submissions || []).filter((s) => s.student_id === sid);
      const totalSessions = studentSubs.length;

      const avgScore =
        totalSessions > 0
          ? Math.round(
              studentSubs.reduce((acc, s) => acc + (Number(s.overall_score) || 0), 0) /
                totalSessions
            )
          : 0;

      const avgWpm =
        totalSessions > 0
          ? Math.round(
              studentSubs.reduce((acc, s) => acc + (Number(s.wpm) || 0), 0) /
                totalSessions
            )
          : 0;

      const totalFillers = studentSubs.reduce(
        (acc, s) => acc + (Number(s.filler_count) || 0),
        0
      );

      const lastSub = studentSubs[0] || null;

      return {
        id: sid,
        email: p.email || 'Student',
        name: p.full_name || p.email?.split('@')[0] || 'Student',
        totalSessions,
        avgScore,
        avgWpm,
        totalFillers,
        lastActive: lastSub?.submitted_at || null,
        cefrBand: lastSub?.cefr_band || (avgScore >= 85 ? 'IELTS 7.5 (C1)' : avgScore >= 70 ? 'IELTS 6.5 (B2)' : 'IELTS 5.5 (B1)'),
      };
    });

    return NextResponse.json({
      batch,
      assignments: assignments || [],
      gradebook,
      recentSubmissions: submissions || [],
    });
  } catch (error: any) {
    console.error('[Trainer Batch Detail GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
