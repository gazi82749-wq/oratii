import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Lock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Oratii voice & data privacy policy guarantee. Your speech recordings and presentation decks are never sold or used to train public AI models.',
  openGraph: {
    title: 'Privacy Policy | Oratii AI Speech Coach',
    description: 'Learn how Oratii protects your voice recordings, presentation slides, and account privacy.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] w-full">
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 text-slate-800 animate-fade-in relative">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
            <Lock size={13} className="text-slate-800" />
            <span>Voice & Data Privacy Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Last Updated: August 2026 • Effective Immediately
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed mb-16">
          
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden" style={{ isolation: 'isolate' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-[#F2A93B]"></div>
            <h2 className="text-lg font-black text-slate-950 mb-2 flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-600" /> Our Core Privacy Promise
            </h2>
            <p className="text-slate-700 font-medium">
              At <strong>Oratii</strong>, we understand that your speech recordings, presentation slides, and practice responses contain valuable ideas. Your voice recordings and uploaded decks are processed strictly for generating real-time coaching feedback and <strong>are never sold, leased, or used to train public third-party AI models</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">1. Information We Collect</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p><strong>a. Audio & Vocal Telemetry:</strong> When you use our Speech Coach, AI Job Interview Studio, or 20-Day Challenge, microphone audio is processed in real-time to evaluate WPM pacing, filler word density, vocal tone, and posture telemetry.</p>
              <p><strong>b. Presentation Slides & Resume Documents:</strong> Uploaded PowerPoint (PPTX), PDF decks, or Resume/CV documents are parsed solely to produce slide density scores, extract resume context, and generate simulated STAR method technical questions.</p>
              <p><strong>c. Account & Authentication Data:</strong> Full name, email address, and secure auth tokens collected during sign-up to manage your 10 free trial credits and account preferences.</p>
              <p><strong>d. Payment & Transaction Records:</strong> Credit top-up transactions are processed through encrypted payment gateway partners (such as Razorpay). Oratii does not store credit card numbers or banking passwords on our servers.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
              <li>To provide instant speech analysis, pacing graphs, and filler word reports.</li>
              <li>To generate customized Viva Defense questions from your presentation slides.</li>
              <li>To manage your free trial limits, subscription status, and XP gamification progress.</li>
              <li>To maintain platform security, prevent abuse, and deliver technical support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">3. Data Security & Storage</h2>
            <p className="text-slate-700 font-medium">
              All data transmissions are encrypted using SSL/TLS protocol. Speech recordings processed in memory are automatically purged after transcript generation unless explicitly saved to your personal session storage or Supabase profile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">4. Third-Party Integrations</h2>
            <p className="text-slate-700 font-medium">
              We integrate with trusted AI API providers (such as OpenAI and Groq) strictly to compute transcript analysis under zero-retention Enterprise Privacy Agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">5. User Rights & Contact</h2>
            <p className="text-slate-700 font-medium mb-4">
              Under applicable global privacy regulations (including GDPR and CCPA), you have the right to access, rectify, or delete your personal data.
            </p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-slate-900">
              <p className="font-extrabold text-sm mb-1">Have questions about your privacy?</p>
              <p className="text-xs text-slate-600 font-medium">
                Contact our privacy compliance officer at <a href="mailto:privacy@oratii.ai" className="font-bold underline text-[#151930]">privacy@oratii.ai</a> or reach out through our <Link href="/support" className="font-bold underline text-[#151930]">Support Page</Link>.
              </p>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
