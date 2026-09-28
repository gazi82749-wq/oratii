import { NextRequest, NextResponse } from 'next/server';
import { sendContactSupportNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await sendContactSupportNotificationEmail(
      email,
      name,
      subject || 'General Support Inquiry',
      message
    );

    return NextResponse.json({
      status: 'success',
      message: 'Your message has been sent successfully! Our support team will get back to you shortly.',
    });
  } catch (error: any) {
    console.error('Error in contact form submission route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit contact form.' },
      { status: 500 }
    );
  }
}
