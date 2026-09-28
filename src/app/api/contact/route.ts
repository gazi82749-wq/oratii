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

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = (typeof subject === 'string' && subject.trim()) ? subject.trim() : 'General Support Inquiry';
    const trimmedMessage = message.trim();

    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Full name must be under 100 characters.' },
        { status: 400 }
      );
    }

    if (trimmedEmail.length > 100) {
      return NextResponse.json(
        { error: 'Email address must be under 100 characters.' },
        { status: 400 }
      );
    }

    if (trimmedSubject.length > 200) {
      return NextResponse.json(
        { error: 'Subject must be under 200 characters.' },
        { status: 400 }
      );
    }

    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be under 5000 characters.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await sendContactSupportNotificationEmail(
      trimmedEmail,
      escapeHtml(trimmedName),
      escapeHtml(trimmedSubject),
      escapeHtml(trimmedMessage)
    );

    return NextResponse.json({
      status: 'success',
      message: "Your support request has been sent successfully. We'll get back to you within 24 business hours.",
    });
  } catch (error: any) {
    console.error('Error in contact form submission route:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or email support@oratii.in directly.' },
      { status: 500 }
    );
  }
}
