import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

// Shared professional email layout template
async function sendEmail(
  to: string,
  subject: string,
  heading: string,
  bodyHtml: string,
  ctaText: string,
  ctaUrl: string,
  ctaColor: string = '#0F172A',
  fromSender: string = 'Oratii <hello@oratii.in>',
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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); border: 1px solid #E2E8F0;">
                  
                  <!-- Header Branding -->
                  <tr>
                    <td style="background-color: #0F172A; padding: 32px 24px; text-align: center;">
                      <a href="${getSiteUrl()}" style="text-decoration: none; display: inline-block;">
                        <span style="color: #FFFFFF; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          Orat<span style="color: #F2A93B;">ii</span>
                        </span>
                        <span style="color: #94A3B8; font-size: 12px; font-weight: 700; text-transform: uppercase; tracking-wider; display: block; margin-top: 4px; letter-spacing: 1px;">
                          AI Communication &amp; Speech Platform
                        </span>
                      </a>
                    </td>
                  </tr>

                  <!-- Main Content Area -->
                  <tr>
                    <td style="padding: 36px 32px; background-color: #FFFFFF;">
                      <h2 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 16px 0; letter-spacing: -0.3px;">
                        ${heading}
                      </h2>
                      
                      <div style="font-size: 15px; color: #334155; line-height: 1.65; margin-bottom: 28px;">
                        ${bodyHtml}
                      </div>

                      ${ctaText && ctaUrl ? `
                      <!-- Call To Action Button -->
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 8px 0 24px 0;">
                            <a href="${ctaUrl}" target="_blank" style="background-color: ${ctaColor}; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.2px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
                              ${ctaText} &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 28px 0 20px 0;" />
                      
                      <p style="font-size: 13px; color: #64748B; margin: 0; line-height: 1.5; text-align: center;">
                        Have questions or need assistance? Reply directly to this email or visit our <a href="${getSiteUrl()}/help" style="color: #4F46E5; text-decoration: underline;">Help Center</a>.<br/>
                        Warm regards,<br/><strong style="color: #0F172A;">The Oratii Team</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
                      <p style="font-size: 12px; color: #94A3B8; margin: 0 0 6px 0; font-weight: 500;">
                        &copy; ${new Date().getFullYear()} Oratii (oratii.in). All rights reserved.
                      </p>
                      <p style="font-size: 11px; color: #CBD5E1; margin: 0;">
                        Oratii AI • Speech Coach, Presentation Audits &amp; Mock Interviews
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error(`Failed to send email "${subject}":`, error);
  }
}

// 1. Welcome Email
export async function sendWelcomeEmail(toEmail: string, userName: string) {
  const siteUrl = getSiteUrl();
  const name = userName ? userName.split(' ')[0] : 'there';

  const bodyContent = `
    <p style="margin-top: 0;">Hi ${name},</p>
    <p>Welcome to <strong>Oratii</strong>! We are thrilled to have you on board.</p>
    <p>Oratii is your personal AI-powered speech, presentation, and interview coach designed to help you communicate with confidence and poise.</p>
    
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">Here is what you can do today:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
        <li><strong>Speech Coach:</strong> Analyze your speaking pace (WPM), clarity, and filler words in real time.</li>
        <li><strong>Presentation Audit:</strong> Upload slide decks (PPTX/PDF) to review slide engagement and delivery.</li>
        <li><strong>AI Mock Interviews:</strong> Practice voice-based job interviews and viva defenses with instant feedback.</li>
        <li><strong>Daily Challenge:</strong> Build a daily practice streak and earn XP rewards.</li>
      </ul>
    </div>

    <p>Ready to get started? Launch your first session right now from your personal dashboard.</p>
  `;

  await sendEmail(
    toEmail,
    'Welcome to Oratii — Elevate Your Speaking & Interview Skills',
    'Welcome to Oratii! 🎉',
    bodyContent,
    'Launch Dashboard',
    `${siteUrl}/dashboard`,
    '#0F172A',
    'Oratii <hello@oratii.in>',
    'hello@oratii.in'
  );
}

// 2. Login Security Alert Email
export async function sendLoginAlertEmail(
  toEmail: string,
  userName: string,
  ipAddress: string = 'Unknown',
  userAgent: string = 'Browser'
) {
  const siteUrl = getSiteUrl();
  const name = userName ? userName.split(' ')[0] : 'there';
  const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  const bodyContent = `
    <p style="margin-top: 0;">Hi ${name},</p>
    <p>We detected a recent sign-in to your <strong>Oratii</strong> account.</p>
    
    <div style="background-color: #F8FAFC; border-left: 4px solid #F2A93B; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 16px 20px; margin: 20px 0; border-radius: 0 12px 12px 0;">
      <p style="margin: 0 0 6px 0; font-size: 13px; color: #334155;"><strong>Date &amp; Time:</strong> ${loginTime} (IST)</p>
      <p style="margin: 0; font-size: 13px; color: #334155;"><strong>IP Address:</strong> ${ipAddress}</p>
    </div>

    <p style="font-size: 14px; color: #475569;">If this was you, no further action is needed! If you did not authorize this login or suspect unauthorized access, please update your account password immediately.</p>
  `;

  await sendEmail(
    toEmail,
    'Security Alert: Recent Sign-in to Your Oratii Account',
    'Security Alert: New Sign-in',
    bodyContent,
    'Manage Security',
    `${siteUrl}/dashboard`,
    '#0F172A',
    'Oratii Security <security@oratii.in>',
    'support@oratii.in'
  );
}

// 3. Payment Success Email
export async function sendPaymentSuccessEmail(toEmail: string, userName: string, planName: string, amount: number) {
  const siteUrl = getSiteUrl();
  const name = userName ? userName.split(' ')[0] : 'there';

  const bodyContent = `
    <p style="margin-top: 0;">Hi ${name},</p>
    <p>Thank you for your purchase! We successfully received your payment of <strong>₹${amount}</strong> for the <strong>${planName}</strong> credit pack.</p>
    
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size: 13px; color: #64748B; padding-bottom: 8px;">Package:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #0F172A; padding-bottom: 8px;">${planName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748B; padding-bottom: 8px;">Amount Paid:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #16A34A; padding-bottom: 8px;">₹${amount}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748B;">Status:</td>
          <td align="right" style="font-size: 13px; font-weight: 700; color: #16A34A;">Completed ✅</td>
        </tr>
      </table>
    </div>

    <p>Your practice credits have been added to your account instantly. You can now use them across all speech, presentation, and interview tools.</p>
  `;

  await sendEmail(
    toEmail,
    'Payment Confirmed — Your Oratii Credits Are Ready',
    'Payment Successful! 🎉',
    bodyContent,
    'Go to Dashboard',
    `${siteUrl}/dashboard`,
    '#16A34A',
    'Oratii Billing <hello@oratii.in>',
    'support@oratii.in'
  );
}

// 4. Payment Failed Email
export async function sendPaymentFailedEmail(toEmail: string, userName: string) {
  const siteUrl = getSiteUrl();
  const name = userName ? userName.split(' ')[0] : 'there';

  const bodyContent = `
    <p style="margin-top: 0;">Hi ${name},</p>
    <p>We encountered an issue processing your recent payment for Oratii practice credits.</p>
    <p>No funds were charged to your account. You can retry your transaction or select an alternative payment method from our pricing page.</p>
  `;

  await sendEmail(
    toEmail,
    'Action Required: Oratii Payment Unsuccessful',
    'Payment Attempt Issue',
    bodyContent,
    'Review Pricing & Plans',
    `${siteUrl}/pricing`,
    '#DC2626',
    'Oratii Support <support@oratii.in>',
    'support@oratii.in'
  );
}

// 5. Weekly Digest Email
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
  const siteUrl = getSiteUrl();
  const name = userName ? userName.split(' ')[0] : 'there';

  const bodyContent = `
    <p style="margin-top: 0;">Hi ${name}, 👋</p>
    <p>Here is your weekly speaking performance digest from <strong>Oratii</strong>. See how your vocal pacing, filler word control, and interview delivery improved this week!</p>

    <!-- Stats Grid -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
      <tr>
        <td width="50%" style="padding-right: 6px; padding-bottom: 12px;">
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
            <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Practice Drills</span>
            <div style="font-size: 22px; font-weight: 900; color: #0F172A; margin-top: 4px;">${stats.totalDrills} Completed</div>
          </div>
        </td>
        <td width="50%" style="padding-left: 6px; padding-bottom: 12px;">
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
            <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Avg Pacing</span>
            <div style="font-size: 22px; font-weight: 900; color: #4F46E5; margin-top: 4px;">${stats.avgWpm} WPM</div>
          </div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding-right: 6px;">
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
            <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Fillers Avoided</span>
            <div style="font-size: 22px; font-weight: 900; color: #16A34A; margin-top: 4px;">-${stats.fillersReduced} Words</div>
          </div>
        </td>
        <td width="50%" style="padding-left: 6px;">
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; text-align: center;">
            <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Practice Streak</span>
            <div style="font-size: 22px; font-weight: 900; color: #D97706; margin-top: 4px;">🔥 ${stats.streakDays} Days</div>
          </div>
        </td>
      </tr>
    </table>

    <div style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; padding: 16px 20px; margin-bottom: 16px;">
      <span style="font-size: 11px; font-weight: 900; color: #4338CA; text-transform: uppercase; letter-spacing: 0.5px;">🌟 Top Weekly Achievement</span>
      <p style="font-size: 14px; font-weight: 700; color: #1E1B4B; margin: 4px 0 0 0;">
        ${stats.topSkillImprovement}
      </p>
    </div>

    <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <span style="font-size: 11px; font-weight: 900; color: #B45309; text-transform: uppercase; letter-spacing: 0.5px;">💡 AI Coach Tip for Next Week</span>
      <p style="font-size: 13px; color: #78350F; line-height: 1.5; margin: 6px 0 0 0;">
        ${stats.aiCoachTip}
      </p>
    </div>
  `;

  await sendEmail(
    toEmail,
    `📊 Your Weekly Speaking Progress — ${stats.streakDays}-Day Streak! | Oratii`,
    'Your Weekly Performance Summary',
    bodyContent,
    'Launch Speech Coach',
    `${siteUrl}/speech-coach`,
    '#0F172A',
    'Oratii <hello@oratii.in>',
    'hello@oratii.in'
  );
}

// 6. Contact Support Notification Email
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

  const bodyContent = `
    <p style="margin-top: 0;"><strong>From:</strong> ${fromName} (&lt;${fromEmail}&gt;)</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 16px 0;" />
    <div style="font-size: 14px; color: #0F172A; line-height: 1.65; white-space: pre-wrap; background-color: #F8FAFC; padding: 18px; border-radius: 12px; border: 1px solid #E2E8F0;">${message}</div>
  `;

  await sendEmail(
    'support@oratii.in',
    `[Support Ticket] ${subject} - from ${fromName}`,
    'New User Inquiry',
    bodyContent,
    'Reply via Gmail',
    `mailto:${fromEmail}`,
    '#0F172A',
    'Oratii Support <support@oratii.in>',
    fromEmail
  );
}

export async function sendInterviewPrepReminderEmail() {
  console.log(`[Prep Break Reminder] Skipped email. 40-min prep break reminders are push notification only.`);
}




