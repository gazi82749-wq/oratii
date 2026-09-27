import { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, ArrowRight, CheckCircle2, Award, Sparkles, Mic } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'IELTS & CEFR Speaking Practice Online | Oratii AI',
  description: 'Practice IELTS speaking test topics with real-time AI band score feedback, WPM pacing telemetry, filler word detection, and vocal clarity audits.',
  keywords: ['ielts speaking practice online', 'ielts speaking ai band score', 'cefr speaking test online', 'english fluency practice', 'public speaking ielts'],
  alternates: {
    canonical: 'https://oratii.in/for/ielts-speaking',
  },
  openGraph: {
    title: 'IELTS & CEFR Speaking Practice Online | Oratii AI',
    description: 'Get instant vocal feedback on IELTS speaking topics with live AI pacing and fluency telemetry.',
    url: 'https://oratii.in/for/ielts-speaking',
  },
};

export default function IeltsSpeakingSeoPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://oratii.in' },
      { '@type': 'ListItem', 'position': 2, 'name': 'For', 'item': 'https://oratii.in/for/ielts-speaking' },
      { '@type': 'ListItem', 'position': 3, 'name': 'IELTS Speaking Practice', 'item': 'https://oratii.in/for/ielts-speaking' }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="flex-1 w-full">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-emerald-50 via-slate-50 to-[#F8FAFC] py-16 sm:py-24 px-4 sm:px-8 border-b border-emerald-100 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-900 text-xs font-black uppercase tracking-widest shadow-2xs">
              <GraduationCap size={14} className="text-emerald-600 animate-pulse" />
              <span>Tailored Solution for Language Learners</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-tight">
              IELTS &amp; CEFR Speaking <br />
              <span className="text-emerald-600">Practice Online</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Improve your speaking band score with objective AI telemetry on vocal pacing, filler words, and uninterrupted fluency.
            </p>

            <div className="pt-4">
              <Link
                href="/speech-coach"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all cursor-pointer group"
              >
                <Mic size={18} className="text-[#F2A93B]" />
                Start IELTS Speech Practice <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Breakdown */}
        <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426]">Key Speaking Telemetry Features</h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Master the key criteria evaluated in official speaking examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900">Fluency &amp; Coherence</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Maintain steady 130–150 WPM delivery without long unnatural pauses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Award size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900">Crutch Word Reduction</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Flag and eliminate repetitive filler words like &quot;basically&quot;, &quot;um&quot;, and &quot;like&quot;.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900">Cue Card Simulation</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Practice 1 to 2 minute continuous speech prompts with live audio feedback.
              </p>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium text-center max-w-3xl mx-auto">
            <strong>Disclaimer:</strong> Oratii is an independent AI speech coaching tool designed for self-improvement and practice. Oratii is not affiliated with, endorsed by, or certified by IELTS, Cambridge Assessment English, IDP, or the British Council. All score estimates are provided strictly for practice guidance.
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
