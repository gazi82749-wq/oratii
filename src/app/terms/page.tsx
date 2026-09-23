import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { FileText, ShieldAlert, CheckCircle, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Oratii Terms of Service - Platform user agreement, AI coaching disclaimers, credit usage terms, and legal governing terms.',
  openGraph: {
    title: 'Terms of Service | Oratii AI Speech Coach',
    description: 'Read the platform terms of service governing user accounts, credit purchases, and AI evaluation services.',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] w-full">
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
          <p className="text-sm text-slate-500 font-normal">
            Last Updated: September 2026 • Effective Immediately
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed mb-16">
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-700 font-medium">
              By accessing, browsing, registering for, or using the Oratii platform, website, or AI coaching tools (&quot;Service&quot;), you (&quot;User&quot;) agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must immediately discontinue use of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">2. Description of Platform Services</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              Oratii is an AI-powered public speaking, PowerPoint presentation analysis, mock job interview, and viva Q&amp;A practice software. Features include real-time vocal WPM pacing graphs, filler word detection in English and Hinglish, IELTS/CEFR speaking band evaluations, presentation slide density metrics, STAR method interview feedback, and on-device pose tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">3. User Accounts &amp; Security</h2>
            <div className="space-y-2 text-slate-700 font-medium">
              <p>a. You must provide accurate and complete registration information during account sign-up.</p>
              <p>b. You are solely responsible for keeping your login credentials confidential and for all activities that occur under your account.</p>
              <p>c. Oratii reserves the right to suspend or terminate accounts that violate our terms, engage in automated bot scraping, or attempt unauthorized platform manipulation.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">4. Credit Purchases &amp; Billing Terms</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                <strong>a. Free Trial Credits:</strong> Newly registered accounts receive 5 complimentary trial credits to evaluate platform features.
              </p>
              <p>
                <strong>b. Pay-As-You-Go Credit Sachets:</strong> Users can purchase credit sachets (e.g. ₹49, ₹99, ₹199, ₹1499). These are one-time payments with zero recurring subscription auto-debits. Credits are credited to your account immediately upon payment verification via Razorpay.
              </p>
              <p>
                <strong>c. Refund Policies:</strong> All credit purchases and eligible refund requests are strictly subject to our <Link href="/refund-policy" className="font-bold text-indigo-700 underline">Cancellation &amp; Refund Policy</Link>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">5. Intellectual Property Rights</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                <strong>a. User Content Ownership:</strong> You retain 100% full copyright and ownership of all presentation decks (.pptx, PDF), resume documents, vocal audio recordings, and text responses submitted to the Service.
              </p>
              <p>
                <strong>b. Platform Rights:</strong> Oratii retains all rights, title, trademarks, algorithms, source code, UI designs, and intellectual property in and to the platform and software.
              </p>
            </div>
          </section>

          {/* Section 6: AI Output Disclaimer */}
          <section className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6">
            <h2 className="text-lg font-extrabold text-amber-900 mb-2 flex items-center gap-2">
              <ShieldAlert size={20} className="text-amber-700" /> 6. AI Output &amp; Coaching Disclaimer
            </h2>
            <p className="text-amber-950 text-xs sm:text-sm font-medium leading-relaxed">
              Oratii uses automated artificial intelligence models to provide speech, presentation, and interview feedback. All scores, WPM metrics, band ratings, and suggestions are provided <strong>strictly for educational, self-improvement, and practice guidance purposes</strong>. Oratii makes no guarantees regarding specific academic exam marks, university viva results, job interview selections, or corporate hiring decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">7. Limitation of Liability</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              To the maximum extent permitted by applicable law, Oratii, its founders, and operators shall not be liable for any indirect, incidental, special, or consequential damages resulting from platform downtime, payment processing delays, or reliance on AI-generated evaluations.
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
            <h2 className="text-xl font-black text-slate-950 mb-3">9. Contact Information</h2>
            <p className="text-slate-700 font-medium leading-relaxed">
              If you have any questions or legal inquiries regarding these Terms of Service, please contact us at <a href="mailto:support@oratii.in" className="font-bold text-indigo-700 underline">support@oratii.in</a> or visit our <Link href="/support" className="font-bold text-indigo-700 underline">Support Page</Link>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
