import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { FileText, ShieldAlert, CheckCircle, Scale, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Oratii AI Speech & Interview Coach',
  description: 'Oratii Terms of Service - Platform user agreement, AI coaching disclaimers, credit sachet terms, liability limitations, and legal governing terms.',
  openGraph: {
    title: 'Terms of Service | Oratii AI Speech & Interview Coach',
    description: 'Read the platform terms of service governing user accounts, credit purchases, AI coaching evaluations, and liability protections.',
    url: 'https://oratii.in/terms',
  },
  alternates: {
    canonical: 'https://oratii.in/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] w-full font-sans antialiased text-slate-900">
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 text-slate-800 animate-fade-in relative">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <FileText size={13} className="text-slate-800" />
            <span>Platform User Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Last Updated: October 2026 • Effective Immediately
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed mb-16">
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-700 font-medium">
              By accessing, registering for, browsing, or using the Oratii platform, website, or AI coaching tools (&quot;Service&quot;), you (&quot;User&quot;) agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must immediately discontinue use of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">2. Description of Platform Services &amp; Active Tiers</h2>
            <p className="text-slate-700 font-medium leading-relaxed mb-3">
              Oratii provides AI-powered speech delivery and voice mock interview software. Active features include real-time vocal WPM pacing, filler word detection, CEFR/IELTS speaking band benchmarks, STAR method interview evaluation, and daily habit drills.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 font-medium">
              <p>
                <strong>Unreleased / Roadmap Modules:</strong> Modules badged as &quot;Coming Soon&quot; or under development—including Presentation Slide Deck Audits (`/presentation`), Academic Viva Defense (`/viva`), and Trainer Academy Cohorts (`/trainer`)—are provided for preview and roadmap demonstration only. They do not constitute part of the active paid SLA until public release.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">3. User Accounts &amp; Platform Security</h2>
            <div className="space-y-2 text-slate-700 font-medium">
              <p>a. You must provide accurate and complete registration information during account creation.</p>
              <p>b. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account.</p>
              <p>c. Oratii reserves the right to suspend or terminate accounts that engage in automated bot scraping, unauthorized API reverse engineering, or platform abuse.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">4. Pay-As-You-Go Credit Sachets &amp; Billing Terms</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                <strong>a. Starter Free Credits:</strong> Newly registered accounts automatically receive 10 complimentary trial credits per month to test AI speech and interview coaching.
              </p>
              <p>
                <strong>b. Pay-As-You-Go Credit Top-Ups:</strong> Users can purchase credit sachets (such as Pro 40 Credits for ₹149 or Premium 200 Credits for ₹499). These are one-time payments with <strong>zero recurring auto-debits or subscription lock-ins</strong>. Purchased credits never expire.
              </p>
              <p>
                <strong>c. Refunds &amp; Cancellations:</strong> All purchases are governed by our <Link href="/refund-policy" className="font-bold text-indigo-700 underline">Cancellation &amp; Refund Policy</Link>, which includes a 7-day unused credit refund guarantee.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">5. Intellectual Property Rights</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                <strong>a. User Content Ownership:</strong> You retain 100% full copyright and ownership over all original speech audio recordings, transcripts, and text responses submitted to the Service.
              </p>
              <p>
                <strong>b. Platform Intellectual Property:</strong> Oratii retains all rights, title, trademarks, algorithms, source code, UI designs, and intellectual property in and to the platform.
              </p>
            </div>
          </section>

          {/* Section 6: AI Output Disclaimer */}
          <section className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6">
            <h2 className="text-lg font-extrabold text-amber-900 mb-2 flex items-center gap-2">
              <ShieldAlert size={20} className="text-amber-700" /> 6. AI Output &amp; Coaching Disclaimer
            </h2>
            <p className="text-amber-950 text-xs sm:text-sm font-medium leading-relaxed">
              Oratii utilizes automated artificial intelligence models to generate vocal pacing graphs, filler word metrics, CEFR/IELTS band estimates, and STAR interview evaluations. All scores, feedback, and suggestions are provided <strong>strictly for educational, self-improvement, and practice guidance purposes</strong>. Oratii makes no guarantees regarding specific academic exam marks, university viva defense grades, campus placement selections, or official corporate hiring decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">7. Limitation of Liability</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              To the maximum extent permitted by applicable law, Oratii, its founders, operators, and affiliates shall not be liable for any indirect, incidental, special, or consequential damages resulting from platform downtime, payment processing delays, or reliance on AI-generated coaching evaluations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3 flex items-center gap-2">
              <Scale size={20} className="text-indigo-600" /> 8. Governing Law &amp; Jurisdiction
            </h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any legal disputes or claims arising under these terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">9. Legal Contact</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              For legal inquiries or questions regarding these Terms of Service, please contact us at <a href="mailto:support@oratii.in" className="font-bold text-indigo-700 underline">support@oratii.in</a> or visit our <Link href="/support" className="font-bold text-indigo-700 underline">Support Desk</Link>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
