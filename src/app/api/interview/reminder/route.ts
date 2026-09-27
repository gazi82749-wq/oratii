import { NextRequest, NextResponse } from 'next/server';
import { sendInterviewPrepReminderEmail } from '@/lib/email';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail,
      userName = 'Candidate',
      roleTitle = 'Software Engineer',
      nextRoundTitle = 'Round 2: Technical Round',
      weaknesses = []
    } = body;

    let targetEmail = userEmail;

    // Try finding user email from session if not directly supplied
    if (!targetEmail) {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.email) {
          targetEmail = user.email;
        }
      }
    }

    if (!targetEmail) {
      // Fallback logging for anonymous users
      console.log(`[Interview Reminder] No email provided. Skipping email send for ${roleTitle} - ${nextRoundTitle}`);
      return NextResponse.json({
        status: 'success',
        message: 'Reminder logged (no user email bound)'
      });
    }

    await sendInterviewPrepReminderEmail(
      targetEmail,
      userName,
      roleTitle,
      nextRoundTitle,
      weaknesses
    );

    return NextResponse.json({
      status: 'success',
      message: `Reminder email dispatched to ${targetEmail}`
    });
  } catch (error: any) {
    console.error('Error sending interview prep reminder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reminder email' },
      { status: 500 }
    );
  }
}
