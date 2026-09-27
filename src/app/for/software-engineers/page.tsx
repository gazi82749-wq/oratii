import { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, ArrowRight, CheckCircle2, Trophy, Sparkles, Code2 } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AI Voice Mock Interview Practice for Software Engineers | Oratii',
  description: 'Practice tech system architecture and behavioral HR mock interviews with real-time AI feedback. Audit your STAR framework structure, technical depth, and vocal clarity.',
  keywords: ['software engineer mock interview', 'ai tech interview practice', 'system design mock interview', 'star method interview audit', 'coding interview behavioral prep'],
  alternates: {
    canonical: 'https://oratii.in/for/software-engineers',
  },
  openGraph: {
    title: 'AI Voice Mock Interview for Software Engineers | Oratii',
    description: 'Practice tech behavioral and architecture questions out loud with instant AI evaluation.',
    url: 'https://oratii.in/for/software-engineers',
  },
};

export default function SoftwareEngineersSeoPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://oratii.in' },
      { '@type': 'ListItem', 'position': 2, 'name': 'For', 'item': 'https://oratii.in/for/software-engineers' },
      { '@type': 'ListItem', 'position': 3, 'name': 'Software Engineers', 'item': 'https://oratii.in/for/software-engineers' }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'How does Oratii help software engineers in behavioral interview rounds?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Oratii evaluates your spoken answers against the STAR method (Situation, Task, Action, Result), scoring technical specificity, metrics provided, and vocal confidence.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Can I practice technical system architecture deep dives?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Yes! Oratii asks technical follow-up probes based on your role, evaluating your trade-off explanations, edge case handling, and architectural reasoning.'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1 w-full">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-indigo-50 via-slate-50 to-[#F8FAFC] py-16 sm:py-24 px-4 sm:px-8 border-b border-indigo-100 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-900 text-xs font-black uppercase tracking-widest shadow-2xs">
              <Code2 size={14} className="text-indigo-600 animate-pulse" />
              <span>Tailored Solution for Tech Candidates</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-tight">
              AI Voice Mock Interview <br />
              <span className="text-indigo-600">For Software Engineers</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Stop freezing on behavioral HR questions or system architecture trade-offs. Practice out loud with dynamic AI probes and instant STAR method scoring.
            </p>

            <div className="pt-4">
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all cursor-pointer group"
              >
                <Briefcase size={18} className="text-[#F2A93B]" />
                Start Software Engineer Mock <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426]">Why Tech Candidates Use Oratii</h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Master both behavioral HR probes and technical architecture deep dives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Trophy size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900">STAR Method Audit</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Ensure your responses clearly state Situation, Task, Action, and Quantitative Result.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Code2 size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900">Technical Depth Score</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Receive instant evaluation on architectural trade-offs, edge cases, and technical metrics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900">Adaptive Follow-Up Probes</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Experience unscripted follow-up questions when your answer lacks detail or impact.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
