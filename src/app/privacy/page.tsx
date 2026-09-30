import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Lock, ShieldCheck, Mail, FileText, Cpu, Server, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Oratii Privacy Policy. Learn how we protect your vocal recordings and personal data under DPDP, IT Act 2000, and GDPR.',
  openGraph: {
    title: 'Privacy Policy | Oratii AI Speech Coach',
    description: 'Learn how Oratii protects your voice recordings and account privacy.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] w-full">
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
          <p className="text-sm text-slate-500 font-normal">
            Last Updated: September 2026 • Effective Immediately
          </p>
        </div>

        {/* Core Guarantee Card */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed mb-16">
          <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm relative">
            <h2 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" /> Our Core Privacy Commitment
            </h2>
            <p className="text-slate-700 font-normal leading-relaxed">
              At <strong>Oratii</strong> (&quot;Platform&quot;, &quot;We&quot;, &quot;Us&quot;), your trust is our top priority. Your audio speech recordings contain your valuable intellectual property. We process your data strictly to generate real-time coaching feedback and telemetry. <strong>Your voice recordings and transcripts are never sold, rented, leased, or used to train public third-party AI models.</strong>
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">1. Information We Collect</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                <strong>a. Speech &amp; Vocal Telemetry Data:</strong> When you record your voice during speech practice, audio streams are transcribed and evaluated in real-time to compute words-per-minute (WPM) pacing, filler word density, vocal pitch, and acoustic metrics.
              </p>
              <p>
                <strong>b. On-Device Camera Telemetry:</strong> Body posture, gaze alignment, and eye contact telemetry are calculated locally on your device using WebAssembly (WASM) computer vision models. <strong>No raw camera video is ever uploaded or recorded on our servers.</strong>
              </p>
              <p>
                <strong>c. Account Information:</strong> Your full name, email address, authentication credentials, and user preferences collected during registration via Supabase Auth.
              </p>
              <p>
                <strong>d. Payment &amp; Billing Data:</strong> Online payments are processed through PCI-DSS certified payment gateway partners (including Razorpay). Oratii does not store card numbers, CVVs, or banking passwords on our servers. We store transaction IDs, amount paid, and credit allocation status.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
              <li>To evaluate vocal pacing, filler word frequency, and posture.</li>
              <li>To manage your credit balance, subscription status, and XP gamification progress.</li>
              <li>To enforce rate limits, prevent platform abuse, and maintain platform security.</li>
              <li>To send essential transactional notifications, billing receipts, and account updates.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">3. Zero-Retention Third-Party AI API Processing</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              Oratii utilizes enterprise API endpoints (such as Deepgram for speech-to-text, and Groq, Gemini, and OpenRouter for natural language evaluation). All third-party processing operates under <strong>zero-data-retention agreements</strong>. Your prompt content and speech transcripts are processed transiently in memory to return feedback and are deleted immediately thereafter.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">4. Legal Compliance (DPDP Act, IT Act, GDPR &amp; CCPA)</h2>
            <p className="text-slate-700 font-medium leading-relaxed mb-3">
              We comply with the Indian Digital Personal Data Protection (DPDP) Act 2023, Information Technology Act 2000, EU GDPR, and California CCPA guidelines:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
              <li><strong>Right to Access &amp; Portability:</strong> You can view all your session analytics and reports at any time from your account dashboard.</li>
              <li><strong>Right to Erasure (Data Deletion):</strong> You may request full deletion of your account and session history by emailing <a href="mailto:support@oratii.in" className="font-bold underline text-indigo-700">support@oratii.in</a>. All associated records will be purged within 14 business days.</li>
              <li><strong>No Data Selling:</strong> We do not sell or rent personal information to third-party data brokers or advertisers under any circumstances.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">5. Data Security</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              All communications between your client browser and Oratii servers are encrypted using 256-bit SSL/TLS protocol. Data stored in our database (Supabase) is protected with strict Row Level Security (RLS) policies ensuring users can only access their own data.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">6. Privacy Policy Contact</h2>
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 text-slate-900">
              <p className="font-extrabold text-sm mb-1">Grievance &amp; Privacy Officer Contact</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                For questions, data deletion requests, or privacy concerns under applicable privacy laws, please contact our privacy compliance team:
              </p>
              <div className="text-xs font-medium space-y-1 text-slate-700">
                <p><strong>Email:</strong> <a href="mailto:support@oratii.in" className="font-bold underline text-indigo-700">support@oratii.in</a></p>
                <p><strong>Website Support:</strong> <Link href="/support" className="font-bold underline text-indigo-700">Oratii Support Center</Link></p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
