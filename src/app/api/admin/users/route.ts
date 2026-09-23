// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || 'all';

    // Use service role client to bypass client RLS restrictions and retrieve all profiles
    const serviceDb = getServiceSupabase();

    let query = serviceDb
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    if (plan && plan !== 'all') {
      query = query.eq('current_plan', plan);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      users: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch admin users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, plan, role, credits } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const serviceDb = getServiceSupabase();

    if (action === 'update_plan') {
      const { error } = await serviceDb.from('profiles').update({ current_plan: plan }).eq('id', userId);
      if (error) throw error;
    } else if (action === 'update_role') {
      const { error } = await serviceDb.from('profiles').update({ role }).eq('id', userId);
      if (error) throw error;
    } else if (action === 'add_credits') {
      const { data: profile } = await serviceDb.from('profiles').select('credits').eq('id', userId).single();
      const currentCredits = profile?.credits || 0;
      const { error } = await serviceDb.from('profiles').update({ credits: currentCredits + (credits || 100) }).eq('id', userId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}
