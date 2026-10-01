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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000);

    const serviceDb = getServiceSupabase();

    // 1. Fetch sessions
    let query = serviceDb
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type !== 'all') {
      if (type === 'ppt' || type === 'presentation') {
        query = query.in('session_type', ['ppt', 'presentation']);
      } else {
        query = query.eq('session_type', type);
      }
    }

    const { data: rawSessions, error: sessionsError } = await query;
    if (sessionsError) {
      console.error('[AdminSessions] Error fetching sessions:', sessionsError);
      throw sessionsError;
    }

    // 2. Fetch profiles map to enrich sessions with user names & emails
    const { data: profiles } = await serviceDb.from('profiles').select('id, full_name, email');
    const profileMap = new Map<string, any>();
    if (profiles) {
      profiles.forEach(p => profileMap.set(p.id, p));
    }

    // 3. Map and normalize sessions data
    const sessions = (rawSessions || []).map((s: any) => {
      const userProfile = profileMap.get(s.user_id) || {};
      const userName = userProfile.full_name || userProfile.email || (s.user_id ? `User (${s.user_id.substring(0, 6)})` : 'Anonymous User');
      const userEmail = userProfile.email || 'N/A';
      const sd = s.session_data || {};

      return {
        id: s.id,
        userId: s.user_id,
        userName,
        userEmail,
        sessionType: s.session_type,
        score: s.score ?? sd.scores?.overall ?? 0,
        createdAt: s.created_at,
        // Detailed metrics parsed from session_data
        wpm: sd.wpm || sd.scores?.wpm || sd.pace || 130,
        toneClarity: sd.toneClarity || sd.scores?.tone || sd.scores?.clarity || s.score || 80,
        fluencyScore: sd.fluencyScore || sd.scores?.fluency || s.score || 80,
        fillerWords: sd.fillerWordsCount ?? sd.fillerWords ?? sd.fillers ?? 0,
        overallRating: s.score || sd.scores?.overall || sd.overallScore || 80,
        // PPT Specific fields
        presentationName: sd.title || sd.presentationName || sd.fileName || 'Presentation Deck',
        contentScore: sd.contentScore || sd.scores?.content || s.score || 75,
        deliveryScore: sd.deliveryScore || sd.scores?.delivery || sd.designScore || s.score || 75,
        engagementScore: sd.engagementScore || sd.scores?.engagement || sd.storytellingScore || s.score || 75,
        category: sd.category || 'Academic / Pitch',
        strengths: sd.strengths || sd.feedback?.strengths || [],
        weaknesses: sd.weaknesses || sd.feedback?.weaknesses || [],
        suggestions: sd.suggestions || sd.feedback?.suggestions || [],
        slides: sd.slideBySlideFeedback || sd.slides || [],
        // Interview specific fields
        subject: sd.subject || sd.role || sd.topic || 'Mock Interview',
        questionsAsked: sd.questionsAsked || sd.questionCount || (sd.answers ? sd.answers.length : 5),
        duration: sd.duration || sd.durationSeconds || 300,
        sessionData: sd
      };
    });

    return NextResponse.json({
      sessions,
      total: sessions.length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch sessions' }, { status: 500 });
  }
}
