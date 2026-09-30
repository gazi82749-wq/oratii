import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Oratii <hello@oratii.in>';
const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

// Generic email sender to avoid template duplication
async function sendEmail(
  to: string,
  subject: string,
  heading: string,
  body: string,
  ctaText: string,
  ctaUrl: string,
  ctaColor: string,
  fromSender: string = 'Oratii Support <support@oratii.in>',
  replyToAddress: string = 'support@oratii.in'
) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder' || process.env.RESEND_API_KEY.includes('re_placeholder')) {
    console.log(`[Email Skipped - No Resend Key] To: ${to}, Subject: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({
      from: fromSender,
      to,
      replyTo: replyToAddress,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">
          <div style="background-color: #1B2140; padding: 28px 24px; text-align: center;">
            <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">
              Orat<span style="color: #F2A93B;">ii</span> AI
            </h1>
          </div>
          <div style="padding: 28px 24px;">
            <h2 style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 0;">${heading}</h2>
            <div style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
              ${body}
            </div>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${ctaUrl}" style="background-color: ${ctaColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 100px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${ctaText}</a>
            </div>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="font-size: 13px; color: #94A3B8; margin: 0; text-align: center;">
              If you have any questions, feel free to reply to this email.<br/>Best regards, <strong>The Oratii AI Team</strong>
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error(`Failed to send email "${subject}":`, error);
  }
}

export async function sendPaymentSuccessEmail(toEmail: string, userName: string, planName: string, amount: number) {
  const siteUrl = getSiteUrl();
  await sendEmail(
    toEmail,
    'Payment Successful - Welcome to Oratii AI Premium!',
    'Payment Successful!',
    `<p>Hi ${userName || 'there'},</p>
     <p>We successfully received your payment of <strong>₹${amount}</strong> for the <strong>${planName}</strong> credit pack.</p>
     <p>Your practice credits have been added to your account instantly. Head over to your dashboard to start practicing!</p>`,
    'Go to Dashboard',
    `${siteUrl}/dashboard`,
    '#4f46e5'
  );
}

export async function sendPaymentFailedEmail(toEmail: string, userName: string) {
  const siteUrl = getSiteUrl();
  await sendEmail(
    toEmail,
    'Action Required: Payment Failed',
    'Payment Processing Issue',
    `<p>Hi ${userName || 'there'},</p>
     <p>We encountered an issue processing your recent payment for Oratii credits.</p>
     <p>Please check your payment method or try again from the pricing page.</p>`,
    'Try Again',
    `${siteUrl}/pricing`,
    '#ef4444'
  );
}

export interface WeeklyDigestStats {
  totalDrills: number;
  avgWpm: number;
  fillersReduced: number;
  streakDays: number;
  totalXp: number;
  topSkillImprovement: string;
  aiCoachTip: string;
}

export async function sendWeeklyDigestEmail(toEmail: string, userName: string, stats: WeeklyDigestStats) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder' || process.env.RESEND_API_KEY.includes('re_placeholder')) {
    console.log(`[Email Skipped - No Resend Key] Weekly Digest to ${toEmail}`);
    return;
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">
      <!-- Header -->
      <div style="background-color: #1B2140; padding: 32px 24px; text-align: center;">
        <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.5px;">
          Orat<span style="color: #F2A93B;">ii</span>
        </h1>
        <p style="color: #94A3B8; font-size: 13px; font-weight: 700; uppercase; tracking-wider; margin: 0;">
          YOUR WEEKLY SPEAKING &amp; INTERVIEW PROGRESS
        </p>
      </div>

      <!-- Content Container -->
      <div style="padding: 28px 24px;">
        <p style="font-size: 16px; font-weight: 700; color: #0F172A; margin-top: 0;">
          Hi ${userName || 'there'}, 👋
        </p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
          Here is your Grammarly-style weekly speaking performance summary. See how your vocal pacing, filler word control, and interview delivery improved this week!
        </p>

        <!-- Stats Grid (Grammarly style 2x2) -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 24px;">
          <tr>
            <td style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; width: 50%;">
              <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase;">Practice Drills</span>
              <div style="font-size: 22px; font-weight: 900; color: #1E293B; margin-top: 4px;">${stats.totalDrills} Done</div>
            </td>
            <td style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; width: 50%;">
              <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase;">Average Pacing</span>
              <div style="font-size: 22px; font-weight: 900; color: #4F46E5; margin-top: 4px;">${stats.avgWpm} WPM</div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; width: 50%;">
              <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase;">Fillers Defeated</span>
              <div style="font-size: 22px; font-weight: 900; color: #10B981; margin-top: 4px;">-${stats.fillersReduced} Words</div>
            </td>
            <td style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center; width: 50%;">
              <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase;">Practice Streak</span>
              <div style="font-size: 22px; font-weight: 900; color: #F59E0B; margin-top: 4px;">🔥 ${stats.streakDays} Days</div>
            </td>
          </tr>
        </table>

        <!-- Highlight Card -->
        <div style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <span style="font-size: 11px; font-weight: 900; color: #4338CA; text-transform: uppercase;">🌟 Top Weekly Growth</span>
          <p style="font-size: 14px; font-weight: 700; color: #1E1B4B; margin: 4px 0 0 0;">
            ${stats.topSkillImprovement}
          </p>
        </div>

        <!-- AI Coach Personal Tip -->
        <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 18px; margin-bottom: 28px;">
          <span style="font-size: 11px; font-weight: 900; color: #B45309; text-transform: uppercase;">💡 AI Coach Recommendation for Next Week</span>
          <p style="font-size: 13px; color: #78350F; line-height: 1.5; margin: 6px 0 0 0;">
            ${stats.aiCoachTip}
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${siteUrl}/speech-coach" style="display: inline-block; background-color: #1B2140; color: #FFFFFF; font-size: 15px; font-weight: 800; padding: 14px 32px; border-radius: 100px; text-decoration: none; box-shadow: 0 4px 14px rgba(27,33,64,0.3);">
            Launch This Week's Speech Coach &rarr;
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #F1F5F9; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0;">
        <p style="font-size: 12px; color: #94A3B8; margin: 0;">
          © 2026 Oratii Inc. • AI Speech, Presentation &amp; Interview Coach
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: 'hello@oratii.in',
      subject: `📊 Your Weekly Speaking & Interview Report — ${stats.streakDays}-Day Streak!`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send weekly digest email to ${toEmail}:`, error);
  }
}

export async function sendContactSupportNotificationEmail(
  fromEmail: string,
  fromName: string,
  subject: string,
  message: string
) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder' || process.env.RESEND_API_KEY.includes('re_placeholder')) {
    console.log(`[Email Skipped - No Resend Key] Contact Form Notification from ${fromEmail}`);
    return;
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F8FAFC; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">
      <div style="background-color: #1B2140; padding: 24px; text-align: center;">
        <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 900; margin: 0;">
          Orat<span style="color: #F2A93B;">ii</span> Support Inquiry
        </h1>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #475569; margin-top: 0;"><strong>From:</strong> ${fromName} (&lt;${fromEmail}&gt;)</p>
        <p style="font-size: 14px; color: #475569;"><strong>Subject:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 16px 0;" />
        <div style="font-size: 14px; color: #0F172A; line-height: 1.6; white-space: pre-wrap; background-color: #FFFFFF; padding: 16px; border-radius: 12px; border: 1px solid #E2E8F0;">${message}</div>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 16px 0;" />
        <p style="font-size: 12px; color: #94A3B8; margin: 0; text-align: center;">
          Sent via Oratii Contact Form • Direct reply will send email to ${fromEmail}
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Oratii Support <support@oratii.in>',
      to: 'support@oratii.in',
      replyTo: fromEmail,
      subject: `[Contact Form] ${subject} - from ${fromName}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send contact support email from ${fromEmail}:`, error);
  }
}

/**
 * @deprecated Break reminders are delivered via Browser Web Push notifications only per user requirements.
 */
export async function sendInterviewPrepReminderEmail(
  toEmail: string,
  userName: string,
  roleTitle: string,
  nextRoundTitle: string,
  weaknesses: string[]
) {
  console.log(`[Prep Break Reminder] Skipped email to ${toEmail}. 40-min prep break reminders are push notification only.`);
}



