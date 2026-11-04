import { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Video,
  Target,
  BarChart3,
  HelpCircle,
  Layers,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'STAR Method Interview Practice Online & Examples | Oratii',
  description:
    'Master the STAR method (Situation, Task, Action, Result) for behavioral interviews. Learn the 50% Action Rule, explore real examples, and practice live with AI feedback.',
  alternates: {
    canonical: `${siteUrl}/star-method-practice`,
  },
  keywords: [
    'STAR method interview practice',
    'STAR method examples',
    'behavioral interview preparation',
    'STAR framework practice online',
    'STAR method for freshers',
    'situation task action result interview',
  ],
  openGraph: {
    title: 'STAR Method Interview Practice Online & Examples | Oratii',
    description:
      'Learn the STAR framework with real examples, the 50% Action Rule, and live AI video interview evaluation.',
    url: `${siteUrl}/star-method-practice`,
    siteName: 'Oratii',
    type: 'article',
  },
};

const starFaqs = [
  {
    q: 'What is the STAR method in job interviews?',
    a: 'STAR stands for Situation, Task, Action, and Result. It is a structured storytelling framework recommended by top companies (Google, Amazon, TCS, McKinsey) to answer behavioral interview questions like "Tell me about a time you solved a difficult problem."',
  },
  {
    q: 'What is the most common mistake candidates make using the STAR method?',
    a: 'Spending 70% of the time explaining the Situation and Task, leaving only 15 seconds to rush through the Action. Recruiters don’t hire you for your problem; they hire you for the specific actions you took to solve it.',
  },
  {
    q: 'How does Oratii evaluate STAR answers?',
    a: 'Oratii’s AI analyzes your recorded response to detect whether all 4 pillars are covered, measures the proportion of your answer dedicated to actionable steps (targeting the 50% Action rule), and monitors your vocal pacing to ensure a natural delivery.',
  },
];

export default function StarMethodPracticePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: starFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-6">
            <Target size={14} />
            <span>Behavioral Interview Mastery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            STAR Method Interview Practice & Formula
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Master the Situation, Task, Action, Result framework for behavioral interviews. Learn the 50% Action Rule and practice speaking your stories with real-time AI scoring.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-900 text-white hover:bg-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 transition-all shadow-md"
            >
              <Video size={16} />
              <span>Practice STAR with AI Interviewer</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/hr-interview-questions-freshers"
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 transition-all"
            >
              Top HR Questions
            </Link>
          </div>
        </div>
      </section>

      {/* The 4 Pillars & The 50% Rule */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            The Optimal STAR Breakdown: The 50% Action Rule
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Most candidates fail behavioral questions because they spend 80% of their time setting up context. Here is the mathematically optimal distribution for a 90-second response:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pillar 1</div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">15%</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">Situation</div>
            <p className="text-xs text-slate-500 mt-2">Set the scene in 1–2 sentences. Who, when, and where. Keep it ultra-concise.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pillar 2</div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">15%</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">Task</div>
            <p className="text-xs text-slate-500 mt-2">What was your specific objective, challenge, or bottleneck you needed to solve?</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-emerald-500 dark:border-emerald-500 shadow-sm relative">
            <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500 text-white">
              Most Critical
            </span>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pillar 3</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">50%</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">Action</div>
            <p className="text-xs text-slate-500 mt-2">Detailed breakdown of <em>what you personally did</em>. Tools, code, communication, steps.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pillar 4</div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">20%</div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">Result</div>
            <p className="text-xs text-slate-500 mt-2">Quantifiable outcome, lessons learned, and the business or project impact.</p>
          </div>
        </div>
      </section>

      {/* Real STAR Example: Before & After */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-amber-400">
              Interactive Teardown
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Weak Answer vs. Winning STAR Response
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Question: &ldquo;Tell me about a time you handled a difficult deadline.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 shadow-xs">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase mb-3">
                <AlertTriangle size={15} />
                <span>Weak / Unstructured Answer (Fails)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                &ldquo;Yeah, in our final year, we had so much work and very little time. Our project guide was constantly asking for updates and the database had bugs. We basically worked really hard overnight, ordered pizza, drank coffee, and somehow submitted it on the last day. It was super stressful but we did it.&rdquo;
              </p>
              <div className="mt-4 pt-3 border-t border-rose-100 dark:border-rose-900/30 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                Why it fails: 0% actionable personal contribution. Vague, passive, emotional rather than methodical.
              </div>
            </div>

            {/* Winning STAR */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-300 dark:border-emerald-800/60 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase mb-3">
                <CheckCircle2 size={15} />
                <span>High-Scoring STAR Response (Passes)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-indigo-600 dark:text-indigo-400">[Situation]</strong> During our 7th-semester capstone, our client requested 3 new payment API integrations 5 days before the final demo.{' '}
                <strong className="text-indigo-600 dark:text-indigo-400">[Task]</strong> As lead developer, I had to integrate and test the gateways without breaking our existing checkout flow.{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">[Action]</strong> I broke the API requirements into daily sprints, implemented automated mock unit tests to isolate webhook failures, and held a 15-minute daily sync with our tester to triage blockers.{' '}
                <strong className="text-indigo-600 dark:text-indigo-400">[Result]</strong> We completed integration 24 hours early with zero failed payment webhooks, earning the highest grade in our batch.
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-800/30 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Why it wins: Clear ownership, quantifiable outcome, and 50%+ spent on Action.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Put Your Behavioral Stories to the Test
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mt-2">
            Practice in Oratii’s AI Interview Studio. Our telemetry automatically tags your answer’s Situation, Task, Action, and Result balance in real-time.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-400 transition-all shadow-md"
            >
              <span>Practice STAR Questions in AI Studio</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions on the STAR Method
        </h2>
        <div className="space-y-4">
          {starFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={15} className="text-indigo-600 dark:text-amber-400 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 pl-5 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-10 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-4 justify-center">
          <Link href="/campus-placement-interview" className="hover:text-indigo-600 dark:hover:text-amber-400">
            Campus Placement Guide →
          </Link>
          <span>•</span>
          <Link href="/hr-interview-questions-freshers" className="hover:text-indigo-600 dark:hover:text-amber-400">
            Top 10 HR Interview Questions →
          </Link>
          <span>•</span>
          <Link href="/tell-me-about-yourself" className="hover:text-indigo-600 dark:hover:text-amber-400">
            How to Answer &ldquo;Tell Me About Yourself&rdquo; →
          </Link>
        </div>
      </section>
    </div>
  );
}

