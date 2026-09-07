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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.app';
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
            Launch This Week's 3-Min Drill &rarr;
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
      subject: `📊 Your Weekly Speaking & Interview Report — ${stats.streakDays}-Day Streak!`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send weekly digest email to ${toEmail}:`, error);
  }
}

