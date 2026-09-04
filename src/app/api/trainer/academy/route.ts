// src/app/api/trainer/academy/route.ts
// Handles Academy profile creation and status retrieval for trainers/institutes

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, getTrainerDbClient, supabase } from '@/lib/supabaseClient';

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

    const db = getTrainerDbClient(token);

    const { data: academy, error } = await db
      .from('academies')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[Trainer Academy GET] Query error:', error);
    }

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

    const db = getTrainerDbClient(token);

    // 1. Check if an academy profile already exists for this owner
    const { data: existingAcademy } = await db
      .from('academies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    let academy: any;
    let academyError: any;

    if (existingAcademy) {
      const res = await db
        .from('academies')
        .update({
          name: name.trim(),
          city: city?.trim() || null,
          phone: phone?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAcademy.id)
        .select()
        .single();
      academy = res.data;
      academyError = res.error;
    } else {
      const res = await db
        .from('academies')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          city: city?.trim() || null,
          phone: phone?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      academy = res.data;
      academyError = res.error;
    }

    if (academyError) {
      console.error('[Trainer Academy POST] Error:', academyError.message);
      return NextResponse.json({ error: academyError.message }, { status: 500 });
    }

    // 2. Set profile role to 'trainer' safely
    try {
      const adminClient = getServiceSupabase();
      await adminClient
        .from('profiles')
        .update({ role: 'trainer' })
        .eq('id', user.id);
    } catch (roleErr) {
      console.warn('[Trainer Academy POST] Profile role update notice:', roleErr);
    }

    return NextResponse.json({ success: true, academy });
  } catch (error: any) {
    console.error('[Trainer Academy POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

