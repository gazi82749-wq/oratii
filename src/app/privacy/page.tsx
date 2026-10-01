import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Lock, ShieldCheck, Mail, FileText, Cpu, Server, CheckCircle2, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Oratii AI Speech & Interview Coach',
  description: 'Oratii Privacy Policy. Comprehensive data protection, voice recording security, on-device WASM privacy, DPDP Act 2023, IT Act 2000, and GDPR compliance.',
  openGraph: {
    title: 'Privacy Policy | Oratii AI Speech & Interview Coach',
    description: 'Learn how Oratii protects your voice recordings, user privacy, and telemetry data under applicable data privacy laws.',
    url: 'https://oratii.in/privacy',
  },
  alternates: {
    canonical: 'https://oratii.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] w-full font-sans antialiased text-slate-900">
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 text-slate-800 animate-fade-in relative">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Lock size={13} className="text-slate-800" />
            <span>Voice &amp; Data Privacy Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Last Updated: October 2026 • Effective Immediately
          </p>
        </div>

        {/* Core Guarantee Card */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed mb-16">
          <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm relative">
            <h2 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" /> Our Core Privacy Commitment
            </h2>
            <p className="text-slate-700 font-normal leading-relaxed">
              At <strong>Oratii</strong> (&quot;Platform&quot;, &quot;We&quot;, &quot;Us&quot;), your trust and privacy are fundamental. Your audio speech recordings and interview responses contain your personal intellectual property. We process your data strictly to deliver real-time AI speech coaching, vocal pacing, filler word detection, and interview evaluations. <strong>Your voice recordings, transcripts, and personal data are never sold, rented, leased, or used to train public third-party AI models.</strong>
            </p>
          </section>

          {/* Section 1: Active Services vs Unreleased Features */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">1. Scope of Platform Services</h2>
            <p className="text-slate-700 font-medium leading-relaxed mb-3">
              This Privacy Policy applies to all active modules on the Oratii platform, including the <strong>AI Speech Delivery Coach (`/speech-coach`)</strong>, <strong>AI Voice Mock Interviewer (`/interview`)</strong>, <strong>Daily Habit Challenge &amp; Streaks (`/challenge`)</strong>, and <strong>User Account &amp; Billing (`/pricing`, `/dashboard`)</strong>.
            </p>
            <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-4 text-xs sm:text-sm text-indigo-950 font-medium">
              <p>
                <strong>Unreleased / Roadmap Feature Notice:</strong> Features such as Presentation Slide Deck Audits (`/presentation`), Academic Viva Defense (`/viva`), and Trainer Cohort Portals (`/trainer`) marked as &quot;Coming Soon&quot; or under roadmap preview are subject to progressive rollout. Privacy terms for these modules will apply automatically upon public availability.
              </p>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">2. Information We Collect</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                <strong>a. Speech &amp; Vocal Telemetry Data:</strong> When you record your voice during speech practice or mock interviews, audio streams are processed to calculate words-per-minute (WPM) pacing, filler word density, vocal pause duration, and acoustic telemetry.
              </p>
              <p>
                <strong>b. On-Device Camera Telemetry:</strong> Body posture, gaze vectors, and eye contact tracking run locally on your client device using WebAssembly (WASM) computer vision models. <strong>No raw camera video is ever recorded, uploaded, or transmitted to our servers.</strong>
              </p>
              <p>
                <strong>c. Account Information:</strong> Your full name, email address, password hash, authentication credentials, avatar URL, and user preferences stored securely via Supabase Auth.
              </p>
              <p>
                <strong>d. Payment &amp; Transaction Data:</strong> Online payments for pay-as-you-go credit sachets are processed through PCI-DSS certified payment gateway partners (including Razorpay). Oratii does not store card numbers, CVVs, or UPI PIN passwords on our servers. We store transaction IDs, amount paid in INR (₹), payment status, and credit allocation logs.
              </p>
            </div>
          </section>

          {/* Section 3: How We Use Your Data */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
              <li>To compute vocal pacing, filler word frequency, STAR interview scoring, and AI feedback.</li>
              <li>To manage your credit balance, XP gamification progress, streak tracking, and badges.</li>
              <li>To prevent platform abuse, enforce rate limits, and maintain system security.</li>
              <li>To send essential transactional notifications, billing receipts, and account updates via email or VAPID push notifications.</li>
            </ul>
          </section>

          {/* Section 4: Zero-Retention Third-Party AI API Processing */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">4. Zero-Retention Third-Party AI Processing</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              Oratii utilizes enterprise API endpoints (such as Deepgram for speech-to-text, and Google Gemini, Cerebras, Groq, and OpenRouter for natural language evaluation). All third-party processing operates under <strong>zero-data-retention agreements</strong>. Your prompt content and speech transcripts are processed transiently in memory to return feedback and are deleted immediately thereafter.
            </p>
          </section>

          {/* Section 5: Legal Compliance */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">5. Legal Compliance (DPDP Act 2023, IT Act 2000, GDPR &amp; CCPA)</h2>
            <p className="text-slate-700 font-medium leading-relaxed mb-3">
              We comply with the Digital Personal Data Protection (DPDP) Act 2023 (India), Information Technology Act 2000, EU GDPR, and California CCPA guidelines:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
              <li><strong>Right to Access &amp; Portability:</strong> You can view and export all your session reports and billing transactions from your account dashboard at any time.</li>
              <li><strong>Right to Erasure (Data Deletion):</strong> You may request complete deletion of your account and session history by emailing <a href="mailto:support@oratii.in" className="font-bold underline text-indigo-700">support@oratii.in</a>. All associated records will be permanently purged within 14 business days.</li>
              <li><strong>No Data Selling:</strong> We do not sell, rent, or trade personal information to third-party data brokers or advertisers under any circumstances.</li>
            </ul>
          </section>

          {/* Section 6: Data Security */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">6. Data Security &amp; Encryption</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              All data transmitted between your browser and Oratii servers is encrypted using 256-bit SSL/TLS protocol. Data stored in our Supabase PostgreSQL database is protected with Row Level Security (RLS) policies ensuring users can only access their own private session records.
            </p>
          </section>

          {/* Section 7: Privacy Contact */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">7. Data Protection Officer Contact</h2>
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 text-slate-900">
              <p className="font-extrabold text-sm mb-1">Grievance &amp; Data Privacy Officer</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                For privacy inquiries, data erasure requests, or compliance questions under applicable data privacy laws, please contact our compliance team:
              </p>
              <div className="text-xs font-medium space-y-1 text-slate-700">
                <p><strong>Email:</strong> <a href="mailto:support@oratii.in" className="font-bold underline text-indigo-700">support@oratii.in</a></p>
                <p><strong>Support Desk:</strong> <Link href="/support" className="font-bold underline text-indigo-700">Oratii Support Center</Link></p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
