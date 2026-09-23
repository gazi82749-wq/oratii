// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = (searchParams.get('search') || '').toLowerCase();
    const plan = searchParams.get('plan') || 'all';

    const serviceDb = getServiceSupabase();
    let authUsers: any[] = [];
    let isServiceRoleActive = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Try listing users from Supabase Auth admin API (Requires SUPABASE_SERVICE_ROLE_KEY)
    if (isServiceRoleActive) {
      try {
        const { data: listRes, error: listError } = await serviceDb.auth.admin.listUsers();
        if (!listError && listRes?.users) {
          authUsers = listRes.users;
        }
      } catch (authErr) {
        console.warn('[AdminUsers] Failed to fetch auth.users via admin API:', authErr);
      }
    }

    // 2. Fetch profiles table
    let profilesQuery = serviceDb.from('profiles').select('*');
    const { data: profiles, error: profilesError } = await profilesQuery;

    const profilesMap = new Map<string, any>();
    if (profiles) {
      profiles.forEach(p => profilesMap.set(p.id, p));
    }

    // 3. Combine auth.users and profiles to ensure every signed-up user is represented
    let combinedUsers: any[] = [];

    if (authUsers.length > 0) {
      combinedUsers = authUsers.map(u => {
        const p = profilesMap.get(u.id) || {};
        return {
          id: u.id,
          email: u.email || p.email || 'No email',
          full_name: u.user_metadata?.full_name || p.full_name || u.email?.split('@')[0] || 'User',
          created_at: u.created_at || p.created_at || new Date().toISOString(),
          current_plan: p.current_plan || 'free',
          role: p.role || (u.email?.includes('admin') ? 'admin' : 'user'),
          credits: p.credits ?? 20,
          analyses_count: p.analyses_count || 0,
          last_active: u.last_sign_in_at || p.updated_at || u.created_at,
        };
      });
    } else if (profiles && profiles.length > 0) {
      combinedUsers = profiles.map(p => ({
        id: p.id,
        email: p.email || 'No email',
        full_name: p.full_name || p.email?.split('@')[0] || 'User',
        created_at: p.created_at || new Date().toISOString(),
        current_plan: p.current_plan || 'free',
        role: p.role || 'user',
        credits: p.credits ?? 20,
        analyses_count: p.analyses_count || 0,
        last_active: p.updated_at || p.created_at,
      }));
    }

    // Filter by search query
    if (search) {
      combinedUsers = combinedUsers.filter(
        u => u.email.toLowerCase().includes(search) || u.full_name.toLowerCase().includes(search)
      );
    }

    // Filter by plan
    if (plan && plan !== 'all') {
      combinedUsers = combinedUsers.filter(u => u.current_plan === plan);
    }

    const total = combinedUsers.length;
    const from = (page - 1) * limit;
    const paginatedUsers = combinedUsers.slice(from, from + limit);

    return NextResponse.json({
      users: paginatedUsers,
      total,
      page,
      limit,
      isServiceRoleActive,
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
      
      // Also sync usage_limits plan if applicable
      const addedLimit = plan === 'pro' ? 500 : plan === 'enterprise' ? 5000 : 20;
      await serviceDb.from('usage_limits').upsert({
        user_id: userId,
        speech_analysis_count: addedLimit,
        ppt_analysis_count: addedLimit,
        viva_sessions_count: addedLimit,
      }, { onConflict: 'user_id' });

    } else if (action === 'update_role') {
      const { error } = await serviceDb.from('profiles').update({ role }).eq('id', userId);
      if (error) throw error;
    } else if (action === 'add_credits') {
      const added = credits || 100;
      const { data: profile } = await serviceDb.from('profiles').select('credits').eq('id', userId).single();
      const currentCredits = profile?.credits || 0;
      const { error } = await serviceDb.from('profiles').update({ credits: currentCredits + added }).eq('id', userId);
      if (error) throw error;

      // Update usage_limits table as well
      const { data: usage } = await serviceDb.from('usage_limits').select('*').eq('user_id', userId).single();
      if (usage) {
        await serviceDb.from('usage_limits').update({
          speech_analysis_count: (usage.speech_analysis_count || 0) + added,
          ppt_analysis_count: (usage.ppt_analysis_count || 0) + added,
          viva_sessions_count: (usage.viva_sessions_count || 0) + added,
        }).eq('user_id', userId);
      } else {
        await serviceDb.from('usage_limits').insert({
          user_id: userId,
          speech_analysis_count: added,
          ppt_analysis_count: added,
          viva_sessions_count: added,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}
