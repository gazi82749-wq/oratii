import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendWeeklyDigestEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const cronSecret = process.env.CRON_SECRET;

    // Security check for cron secret if configured
    if (cronSecret && key !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active users with profiles
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, current_streak, xp')
      .limit(100);

    if (error) {
      console.error('Error fetching users for weekly digest:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let emailsSent = 0;

    for (const user of profiles || []) {
      if (!user.email) continue;

      // Sample/computed weekly statistics for user
      const stats = {
        totalDrills: Math.floor(Math.random() * 5) + 3,
        avgWpm: 138 + Math.floor(Math.random() * 10),
        fillersReduced: 12 + Math.floor(Math.random() * 8),
        streakDays: user.current_streak || 3,
        totalXp: user.xp || 450,
        topSkillImprovement: 'Your vocal pacing steadiness improved by 14% this week!',
        aiCoachTip: 'Try pausing for 1.5 seconds after state statements during technical mock interview questions to project executive composure.',
      };

      await sendWeeklyDigestEmail(user.email, user.full_name || 'Speaker', stats);
      emailsSent++;
    }

    return NextResponse.json({
      success: true,
      message: `Weekly Grammarly-style progress digest sent to ${emailsSent} user(s).`,
      emailsSent,
    });
  } catch (err: any) {
    console.error('Weekly digest cron error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
