import { NextRequest, NextResponse } from 'next/server';
import { sendContactSupportNotificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Sanitize user input to prevent HTML/script injection in email templates
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
      email.trim(),
      escapeHtml(name.trim()),
      escapeHtml(subject || 'General Support Inquiry'),
      escapeHtml(message.trim())
    );

    return NextResponse.json({
      status: 'success',
      message: 'Your message has been sent successfully! Our support team will get back to you shortly.',
    });
  } catch (error: any) {
    console.error('Error in contact form submission route:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or email hello@oratii.in directly.' },
      { status: 500 }
    );
  }
}
