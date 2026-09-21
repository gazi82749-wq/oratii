import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Oratii Terms of Service - Legal agreement governing user accounts, subscription billing, and AI speech coaching usage.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] w-full">
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 text-slate-800 animate-fade-in relative">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <FileText size={13} className="text-slate-800" />
              <span>Platform Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-500 font-normal">
              Last Updated: August 2026 • Effective Immediately
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 text-sm sm:text-base leading-relaxed mb-16">
            
            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">1. Acceptance of Terms</h2>
              <p className="text-slate-700 font-medium">
                By accessing or using the Oratii website, mobile applications, or AI coaching services (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">2. Description of Service</h2>
              <p className="text-slate-700 font-medium leading-relaxed">
                Oratii provides an AI-powered public speaking, PowerPoint slide deck analysis, Mock Interview Studio, and Viva Q&amp;A defense practice platform. Features include real-time WPM pacing metrics, filler word detection in English and Hinglish, CEFR and IELTS speaking band assessments, PowerPoint (PPTX) and PDF slide density heatmaps, STAR method campus placement simulations (including high-stakes presets for Top Tech MNCs, SDE-1, Data Analyst, and MBA defenses), a structured Daily Challenge curriculum, educational institution and trainer batch portals, and on-device WebAssembly (WASM) camera posture telemetry.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">3. User Accounts & Security</h2>
              <p className="text-slate-700 font-medium">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify Oratii immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">4. Trial Credits & Credit Packages</h2>
              <p className="text-slate-700 font-medium">
                Oratii provides 5 Free Trial Credits upon account creation. Additional credit packages can be purchased on a pay-as-you-go basis without recurring monthly subscription traps. Payments are securely processed via Razorpay. All purchases and eligible refund requests are governed by our <Link href="/refund-policy" className="font-bold text-[#151930] underline">Cancellation &amp; Refund Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">5. Intellectual Property Rights</h2>
              <p className="text-slate-700 font-medium">
                You retain full ownership of all audio recordings, presentation slides (PPTX/PDF), and speech transcripts uploaded to Oratii. Oratii retains all rights, title, and interest in and to the platform, branding, algorithms, and AI coaching software.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">6. Limitation of Liability</h2>
              <p className="text-slate-700 font-medium">
                To the maximum extent permitted by law, Oratii and its operators shall not be liable for indirect, incidental, or consequential damages resulting from platform downtime, AI generation inaccuracies, or data loss.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">7. Contact & Notices</h2>
              <p className="text-slate-700 font-medium">
                For questions or legal notices regarding these Terms, please contact us at <a href="mailto:support@oratii.app" className="font-bold text-[#151930] underline">support@oratii.app</a> or submit a message on our <Link href="/support" className="font-bold text-[#151930] underline">Support Page</Link>.
              </p>
            </section>

          </div>
      </div>
      <Footer />
    </div>
  );
}
