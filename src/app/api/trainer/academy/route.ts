// src/app/api/trainer/academy/route.ts
// Handles Academy profile creation and status retrieval for trainers/institutes

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

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

    const supabaseAdmin = getServiceSupabase();

    const { data: academy } = await supabaseAdmin
      .from('academies')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    return NextResponse.json({ academy: academy || null });
  } catch (error: any) {
    console.error('[Trainer Academy GET] Error:', error);
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

    const { name, city, phone } = await request.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Institute name is required' }, { status: 400 });
    }

    const supabaseAdmin = getServiceSupabase();

    // 1. Upsert Academy
    const { data: academy, error: academyError } = await supabaseAdmin
      .from('academies')
      .upsert(
        {
          owner_id: user.id,
          name: name.trim(),
          city: city?.trim() || null,
          phone: phone?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'owner_id' }
      )
      .select()
      .single();

    if (academyError) {
      console.error('[Trainer Academy POST] Error:', academyError.message);
      return NextResponse.json({ error: academyError.message }, { status: 500 });
    }

    // 2. Set profile role to 'trainer'
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'trainer' })
      .eq('id', user.id);

    return NextResponse.json({ success: true, academy });
  } catch (error: any) {
    console.error('[Trainer Academy POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
