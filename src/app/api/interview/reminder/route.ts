import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { roleTitle = 'Software Engineer', nextRoundTitle = 'Round 2' } = body;

    console.log(`[Interview Reminder] Request for ${roleTitle} - ${nextRoundTitle}. Note: 40-minute prep break reminders are handled via Browser Push Notifications only.`);

    return NextResponse.json({
      status: 'info',
      message: '40-minute prep break reminders use Browser Web Push Notifications only.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process reminder request.' },
      { status: 500 }
    );
  }
}
