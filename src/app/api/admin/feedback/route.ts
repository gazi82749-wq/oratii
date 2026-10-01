import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';

async function verifyAdminCaller(request: Request) {
  let user;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 10) {
    const token = authHeader.substring(7).trim();
    const { data: { user: authUser } } = await supabase.auth.getUser(token);
    user = authUser;
  } 
  
  if (!user) {
    const { data: { user: cookieUser } } = await supabase.auth.getUser();
    user = cookieUser;
  }

  if (!user) return false;
  if (user.email?.toLowerCase() === 'gazi82749@gmail.com') return true;

  const serviceClient = getServiceSupabase();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminCaller(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    const serviceDb = getServiceSupabase();
    const { data, error } = await serviceDb
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet or has no rows
      return NextResponse.json({ feedback: [], total: 0 });
    }

    return NextResponse.json({ feedback: data || [], total: (data || []).length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch feedback' }, { status: 500 });
  }
}
