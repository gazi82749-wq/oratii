import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy',
  description: 'Oratii cancellation, refund, and digital delivery policy for AI speech coaching credits and subscription packages.',
  openGraph: {
    title: 'Cancellation & Refund Policy | Oratii',
    description: 'Understand how Oratii handles payment cancellations, digital delivery of AI credits, and refund requests.',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] w-full">
      <div className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 text-slate-800 animate-fade-in relative">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Receipt size={13} className="text-slate-800" />
            <span>Fulfillment &amp; Billing Terms</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Last Updated: August 2026 • Effective Immediately
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed mb-16">

          {/* Quick Summary Card */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm relative">
            <h2 className="text-lg font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" /> Digital Delivery Guarantee
            </h2>
            <p className="text-slate-700 font-normal leading-relaxed">
              All Oratii services, including <strong>Pay-As-You-Go Credit Sachets (₹49, ₹99, ₹199, ₹1499)</strong> and subscriptions, are <strong>100% digital goods</strong>. Upon successful payment verification via our payment gateway (Razorpay), your purchased credits are automatically deposited into your account dashboard immediately with zero shipping delay.
            </p>
          </section>

          {/* Section 1: Cancellation Policy */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">1. Cancellation Policy</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                <strong>a. Pay-As-You-Go Sachets:</strong> Credit sachets are one-time, non-recurring purchases. Since there is no recurring auto-debit, you never need to manually cancel a subscription to prevent future unexpected charges.
              </p>
              <p>
                <strong>b. Subscriptions (if applicable):</strong> You may cancel any active subscription tier at any time from your Account Settings. Upon cancellation, you will continue to enjoy access until the end of your current billing cycle, and no further renewals will occur.
              </p>
            </div>
          </section>

          {/* Section 2: Refund Eligibility */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">2. Refund Eligibility & Criteria</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                We strive for 100% customer satisfaction. You are eligible to request a full or prorated refund under the following conditions:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Duplicate or Erroneous Transactions:</strong> If your account or bank was charged multiple times due to a network glitch or timeout during payment processing.
                </li>
                <li>
                  <strong>Unused Credits (7-Day Window):</strong> If you purchased a credit package and have not consumed any of the purchased credits, you may request a 100% refund within <strong>7 calendar days</strong> of the transaction date.
                </li>
                <li>
                  <strong>Critical Platform Service Failure:</strong> If technical downtime or verified AI service failure prevented you from utilizing the coaching tools and our engineering team is unable to resolve the issue within 48 hours.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Non-Refundable Items */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">3. Non-Refundable Circumstances</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                Refunds cannot be issued under the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Credits that have already been consumed for AI speech evaluations, PPT slide analyses, or mock viva interview sessions (as third-party LLM and speech computation costs are incurred immediately upon execution).</li>
                <li>Refund requests made after 7 calendar days from the date of purchase.</li>
                <li>Accounts terminated due to violations of our Terms of Service (e.g., abusive behavior, automated bot scraping, or payment fraud).</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Refund Process & Timeline */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-black text-slate-950 mb-3 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" /> 4. Refund Processing Timeline
            </h2>
            <p className="text-slate-700 font-medium mb-3">
              Once your refund request is submitted and approved by our billing team:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-700 font-medium">
              <li>Our team inspects and approves eligible requests within <strong>24 to 48 business hours</strong>.</li>
              <li>Refunds are credited directly back to the <strong>original payment method</strong> (UPI, Credit/Debit Card, Net Banking) via Razorpay.</li>
              <li>Bank settlement typically takes <strong>5 to 7 business days</strong> depending on your issuing bank.</li>
            </ol>
          </section>

          {/* Section 5: How to Request a Refund */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-600" /> 5. How to Initiate a Refund
            </h2>
            <p className="text-slate-700 font-medium mb-3">
              To request a refund or report a billing discrepancy, please submit your request with your:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium mb-4">
              <li>Registered Account Email Address</li>
              <li>Razorpay Payment ID (e.g., <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">pay_...</code>)</li>
              <li>Brief reason for the refund request</li>
            </ul>
            <p className="text-slate-700 font-medium">
              Submit your request through our <Link href="/support" className="font-bold text-indigo-700 hover:underline">Support & Help Center</Link> or by emailing us directly with the subject <em>&quot;Refund Request - [Your Email]&quot;</em>.
            </p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
