import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, Cpu, Eye, CheckCircle2, FileText, Server, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security & Ethics Center',
  description: 'Oratii AI Security & Ethics Commitments. Learn about our on-device WASM privacy, zero-retention AI data processing, and unbiased scoring guarantees.',
  openGraph: {
    title: 'Security & Ethics Center | Oratii AI',
    description: 'Learn how Oratii enforces enterprise-grade security, WASM browser processing, zero-retention AI privacy, and ethical AI evaluation.',
  },
};

export default function SecurityEthicsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-900 w-full">
      
      <div className="flex-1 w-full max-w-5xl mx-auto py-12 sm:py-16 px-4 sm:px-6 relative">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-8 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
            <ShieldCheck size={16} className="text-indigo-600" /> Enterprise Security & AI Ethics Guarantee
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
            Security & Ethics Center
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl font-medium leading-relaxed">
            Our commitment to enterprise-grade data protection, zero-retention privacy, on-device WASM processing, and unbiased AI scoring.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Pillar 1: On-Device WASM Privacy */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-900 flex items-center justify-center mb-5 border border-indigo-200 shadow-xs">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 mb-2">1. On-Device WASM Video Telemetry</h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Raw webcam feeds during slide rehearsals never leave your device. All posture tracking, gaze vectors, and gesture analyses run entirely in your browser using local WebAssembly (WASM) models.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-extrabold text-indigo-700">
              <CheckCircle2 size={14} className="text-emerald-600" /> 100% On-Device Video Privacy
            </div>
          </div>

          {/* Pillar 2: Zero-Retention AI Privacy */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-900 flex items-center justify-center mb-5 border border-amber-200 shadow-xs">
              <Lock size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 mb-2">2. Zero-Retention AI Data Policy</h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Your speech audio clips, transcripts, and PowerPoint/PDF slide decks are processed under Enterprise Zero-Retention API agreements. Your data is <strong>never sold, leased, or used to train public AI models</strong>.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-extrabold text-amber-700">
              <CheckCircle2 size={14} className="text-emerald-600" /> Zero Model Training Guarantee
            </div>
          </div>

          {/* Pillar 3: Unbiased Ethical Evaluation */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-900 flex items-center justify-center mb-5 border border-emerald-200 shadow-xs">
              <Eye size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 mb-2">3. Unbiased Ethical AI Scoring</h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Our AI Job Interviewer and Speech Coach evaluate speech purely on merit—focusing strictly on WPM pacing, filler word frequency, and STAR method response structure without demographic, accent, or background bias.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-extrabold text-emerald-700">
              <CheckCircle2 size={14} className="text-emerald-600" /> Merit-Based Objective Feedback
            </div>
          </div>

          {/* Pillar 4: Encryption & Rate Limiting */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-900 flex items-center justify-center mb-5 border border-purple-200 shadow-xs">
              <Server size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 mb-2">4. SSL/TLS Encryption & Hardened API</h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                All client-to-server traffic is encrypted using 256-bit SSL/TLS protocol. API routes enforce strict rate limiting, server-side session authentication, and prompt sanitization against injection attacks.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-extrabold text-purple-700">
              <CheckCircle2 size={14} className="text-emerald-600" /> 256-bit SSL Data Encryption
            </div>
          </div>

        </div>

        {/* Detailed Commitments Document */}
        <div className="space-y-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm mb-16 text-sm sm:text-base leading-relaxed">
          <section>
            <h3 className="text-lg font-black text-slate-950 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" /> AI Ethics & Responsible Disclosure Statement
            </h3>
            <p className="text-slate-700 font-medium mb-3">
              Oratii is committed to transparent, responsible AI development. We continuously audit our prompt pipelines and scoring algorithms to ensure user evaluation is constructive, objective, and supportive.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 font-medium">
              <li><strong>No Secret Data Sharing:</strong> We do not sell user behavioral data or speech transcripts to data brokers.</li>
              <li><strong>Secure Third-Party Gateway:</strong> Payments are processed via PCI-DSS compliant Razorpay servers; no credit card details are stored locally.</li>
              <li><strong>User Right to Erasure:</strong> Users can request full deletion of their session history and profile data at any time under GDPR/CCPA standards.</li>
            </ul>
          </section>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-sm mb-1">Security or Ethics Question?</p>
              <p className="text-xs text-slate-600 font-medium">
                Contact our security compliance team at <a href="mailto:security@oratii.ai" className="font-bold underline text-indigo-700">security@oratii.ai</a>
              </p>
            </div>
            <Link
              href="/support"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              Contact Support
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
