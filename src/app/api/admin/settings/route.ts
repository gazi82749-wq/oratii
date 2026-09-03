import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabaseClient';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

async function verifyAdminCaller(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7).trim();
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return false;

  const serviceClient = getServiceSupabase();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function GET(request: Request) {
  try {
    const serviceClient = getServiceSupabase();
    const { data, error } = await serviceClient
      .from('platform_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Default fallback if table is not yet seeded
    const settings = data || {
      platform_name: 'Oratii',
      contact_email: 'contact@oratii.app',
      support_email: 'support@oratii.app',
      upi_id: 'oratii@upi',
      two_factor_enabled: true,
      session_timeout_minutes: 30,
    };

    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdminCaller(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      platform_name,
      contact_email,
      support_email,
      upi_id,
      two_factor_enabled,
      session_timeout_minutes,
    } = body;

    const serviceClient = getServiceSupabase();
    const { data, error } = await serviceClient
      .from('platform_settings')
      .upsert({
        id: 'default',
        platform_name,
        contact_email,
        support_email,
        upi_id,
        two_factor_enabled,
        session_timeout_minutes: Number(session_timeout_minutes) || 30,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', settings: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
