import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
const FROM_EMAIL = 'billing@Oratiiai.com';

// Generic email sender to avoid template duplication
async function sendEmail(to: string, subject: string, heading: string, body: string, ctaText: string, ctaUrl: string, ctaColor: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder' || process.env.RESEND_API_KEY.includes('re_placeholder')) {
    console.log(`[Email Skipped - No Resend Key] To: ${to}, Subject: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${heading}</h2>
          ${body}
          <br/>
          <a href="${ctaUrl}" style="background-color: ${ctaColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">${ctaText}</a>
          <br/><br/>
          <p>Best,<br/>The Oratii AI Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error(`Failed to send email "${subject}":`, error);
  }
}

export async function sendPaymentSuccessEmail(toEmail: string, userName: string, planName: string, amount: number) {
  await sendEmail(
    toEmail,
    'Payment Successful - Welcome to Oratii AI Premium!',
    'Payment Successful!',
    `<p>Hi ${userName},</p>
     <p>We successfully received your payment of ₹${amount} for the <strong>${planName}</strong> plan.</p>
     <p>Your premium features are now unlocked. Head over to your dashboard to start practicing!</p>`,
    'Go to Dashboard',
    'https://Oratiiai.com/dashboard',
    '#4f46e5'
  );
}

export async function sendPaymentFailedEmail(toEmail: string, userName: string) {
  await sendEmail(
    toEmail,
    'Action Required: Payment Failed',
    'Payment Failed',
    `<p>Hi ${userName},</p>
     <p>We encountered an issue processing your recent payment. Your subscription has not been updated.</p>
     <p>Please update your payment method or try again to unlock premium features.</p>`,
    'Update Payment Method',
    'https://Oratiiai.com/dashboard/billing',
    '#ef4444'
  );
}
