import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Oratii Terms of Service - Legal agreement governing user accounts, subscription billing, and AI speech coaching usage.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <div className="flex-1 max-w-4xl mx-auto py-12 px-4 sm:px-6 text-slate-800 animate-fade-in relative">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
              📜 Platform Agreement
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-500 font-medium">
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
              <p className="text-slate-700 font-medium">
                Oratii provides an AI-powered public speaking, slide deck analysis, and Viva Q&A defense practice platform. Features include real-time WPM pacing metrics, filler word detection, text density heatmaps, and simulated committee Q&A.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">3. User Accounts & Security</h2>
              <p className="text-slate-700 font-medium">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify Oratii immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 mb-3">4. Subscription Tiers & Billing</h2>
              <p className="text-slate-700 font-medium">
                Oratii offers Free Starter tiers and Pro subscription plans. Subscriptions renew automatically based on your selected billing cycle (monthly or annual) unless cancelled prior to the renewal date. Payments are securely processed via Razorpay or Stripe.
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
                For questions or legal notices regarding these Terms, please contact us at <a href="mailto:support@oratii.ai" className="font-bold text-[#151930] underline">support@oratii.ai</a> or submit a message on our <Link href="/support" className="font-bold text-[#151930] underline">Support Page</Link>.
              </p>
            </section>

          </div>
      </div>
      <Footer />
    </div>
  );
}
