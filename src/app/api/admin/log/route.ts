// src/app/api/admin/log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase, supabase } from '@/lib/supabaseClient';
import { logSystemEvent, LogSeverity } from '@/lib/logger';

async function verifyAdminCaller(request: Request) {
  let user;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const { data: { user: authUser } } = await supabase.auth.getUser(token);
    user = authUser;
  } else {
    const { data: { user: cookieUser } } = await supabase.auth.getUser();
    user = cookieUser;
  }

  if (!user) return false;

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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');

    const serviceDb = getServiceSupabase();
    let query = serviceDb
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // We allow standard POST for client logs, but simulate_test should be admin only.
    const body = await req.json();

    // Check for test/simulation trigger from admin
    if (body.action === 'simulate_test') {
      const isAdmin = await verifyAdminCaller(req);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
      }
      const type = body.type || 'ai_failure';
      
      if (type === 'ai_failure') {
        await logSystemEvent({
          severity: 'error',
          category: 'AI Provider',
          message: 'Groq API Rate Limit Exceeded (429 Too Many Requests)',
          source: 'Groq (llama3-8b-8192)',
          details: JSON.stringify({
            provider: 'Groq',
            model: 'llama3-8b-8192',
            statusCode: 429,
            errorMessage: 'Rate limit reached for model groq/llama3-8b-8192 in organization org_123',
            circuitBreakerActivated: true,
            fallbackNext: 'Gemini 3.6 Flash'
          }, null, 2),
        });
      } else if (type === 'api_crash') {
        await logSystemEvent({
          severity: 'critical',
          category: 'API Route',
          message: 'Internal Server Error (500) - Speech Analyzer Pipeline Crash',
          source: '/api/speech-analyzer',
          details: 'Error: Cannot read properties of undefined (reading "audioBuffer")\n    at POST (src/app/api/speech-analyzer/route.ts:182:34)',
        });
      } else if (type === 'client_error') {
        await logSystemEvent({
          severity: 'error',
          category: 'Website Client',
          message: 'Uncaught TypeError: Cannot read property "score" of null',
          source: '/viva',
          details: 'TypeError: Cannot read property "score" of null\n    at VivaSessionCard (src/app/viva/page.tsx:142:18)',
        });
      }

      return NextResponse.json({ success: true, message: `Simulated ${type} log created` });
    }

    // Standard log creation
    const { severity, category, message, source, details } = body;

    if (!message || !source) {
      return NextResponse.json({ error: 'Missing required log fields: message, source' }, { status: 400 });
    }

    await logSystemEvent({
      severity: (severity as LogSeverity) || 'error',
      category: category || 'General',
      message,
      source,
      details,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to record log' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminCaller(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }
    const serviceDb = getServiceSupabase();
    const { error } = await serviceDb.from('system_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    await logSystemEvent({
      severity: 'info',
      category: 'System',
      message: 'System logs cleared by administrator',
      source: 'Admin Log Manager',
    });
    return NextResponse.json({ success: true, message: 'Logs cleared successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to clear logs' }, { status: 500 });
  }
}
