import { NextResponse } from 'next/server';
import { getServiceSupabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Never expose admin self-upgrade in production without strict secret verification
  const adminSecret = process.env.ADMIN_SETUP_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: 'Admin setup is disabled.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, secret } = body;

    if (!secret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid administrative passkey.' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Target user email is required.' }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();

    // Find profile by email
    const { data: profile, error: findError } = await serviceSupabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (findError || !profile) {
      return NextResponse.json({ error: `User with email ${email} not found. Please log in once first.` }, { status: 404 });
    }

    // Upgrade role securely using service role client
    const { error: updateError } = await serviceSupabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profile.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: `User ${email} has been successfully promoted to administrator.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

