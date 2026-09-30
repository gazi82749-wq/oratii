import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Receipt, CheckCircle, Clock, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy',
  description: 'Oratii cancellation, refund, and digital product delivery policy for AI speech coaching credits and subscription packages.',
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
            <span>Merchant Fulfillment &amp; Billing Terms</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Last Updated: September 2026 • Effective Immediately
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed mb-16">

          {/* Quick Summary Card */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm relative">
            <h2 className="text-lg font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" /> Instant Digital Delivery Guarantee
            </h2>
            <p className="text-slate-700 font-normal leading-relaxed">
              All Oratii services—including our <strong>Pay-As-You-Go Credit Sachets (₹49, ₹99, ₹199, ₹1499)</strong> and subscriptions—are <strong>100% digital software services</strong>. Upon successful online payment verification via our payment gateway (Razorpay), your purchased credits are automatically deposited into your account dashboard immediately with zero shipping delay.
            </p>
          </section>

          {/* Section 1: Cancellation Policy */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">1. Cancellation Policy</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                <strong>a. Pay-As-You-Go Sachets:</strong> Credit sachets are one-time, non-recurring purchases. Because there are no recurring subscription charges or auto-debits, no manual cancellation is required.
              </p>
              <p>
                <strong>b. Subscription Plans (if active):</strong> You may cancel any recurring subscription at any time via your Account Settings. Upon cancellation, you will retain full access until the end of your prepaid billing period, and no further charges will be made.
              </p>
            </div>
          </section>

          {/* Section 2: Refund Eligibility */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">2. Refund Eligibility &amp; Criteria</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                We strive for 100% customer satisfaction. You are eligible to request a full refund under the following verified conditions:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Duplicate Charges:</strong> If your bank account or UPI was charged multiple times due to a payment gateway processing error or network failure.
                </li>
                <li>
                  <strong>Unused Credits (7-Day Window):</strong> If you purchased a credit package and have not consumed any of the credits, you may request a 100% refund within <strong>7 calendar days</strong> of purchase.
                </li>
                <li>
                  <strong>Platform Outage:</strong> If verified technical platform downtime prevented credit delivery or AI processing and our support team is unable to resolve the issue within 48 hours.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Non-Refundable Items */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3">3. Non-Refundable Cases</h2>
            <div className="space-y-3 text-slate-700 font-medium">
              <p>
                Refunds cannot be granted under the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Credits that have already been consumed for speech evaluations (as third-party AI compute costs are incurred immediately upon execution).</li>
                <li>Refund requests submitted after 7 calendar days from the purchase date.</li>
                <li>Accounts terminated due to violations of our Terms of Service (such as fraudulent chargeback attempts or bot scraping).</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Refund Process & Timeline */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-black text-slate-950 mb-3 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" /> 4. Refund Processing &amp; Settlement Timeline
            </h2>
            <p className="text-slate-700 font-medium mb-3">
              When a refund request is approved:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-700 font-medium">
              <li>Our support team reviews and approves eligible requests within <strong>24 to 48 business hours</strong>.</li>
              <li>Refunds are initiated directly back to your <strong>original payment method</strong> (UPI, Credit/Debit Card, Net Banking) via Razorpay.</li>
              <li>Bank settlement typically takes <strong>5 to 7 business days</strong> to reflect in your account, depending on your issuing bank.</li>
            </ol>
          </section>

          {/* Section 5: How to Initiate a Refund */}
          <section>
            <h2 className="text-xl font-black text-slate-950 mb-3 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-600" /> 5. How to Submit a Refund Request
            </h2>
            <p className="text-slate-700 font-medium mb-3">
              To request a refund or report a billing discrepancy, please submit your request with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium mb-4">
              <li>Your Registered Account Email Address</li>
              <li>Razorpay Payment ID (e.g., <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs font-mono">pay_...</code>)</li>
              <li>A brief description of the issue or refund reason</li>
            </ul>
            <div className="bg-white border border-slate-200 p-4 rounded-xl text-xs font-medium text-slate-700">
              <p>Email your request to: <a href="mailto:support@oratii.in" className="font-bold underline text-indigo-700">support@oratii.in</a></p>
              <p className="mt-1">Or visit our: <Link href="/support" className="font-bold underline text-indigo-700">Oratii Help &amp; Support Center</Link></p>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
