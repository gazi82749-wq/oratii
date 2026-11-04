import { Metadata } from 'next';
import Link from 'next/link';
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Mic,
  ShieldCheck,
  Award,
  Video,
  Clock,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Campus Placement Interview Practice for Freshers | Oratii',
  description:
    'Prepare for engineering & college campus placement interviews. Practice common HR and technical questions with AI video interviewers, get instant STAR feedback, and speak with confidence.',
  alternates: {
    canonical: `${siteUrl}/campus-placement-interview`,
  },
  keywords: [
    'campus placement interview practice',
    'interview preparation for freshers',
    'campus placement hr questions',
    'engineering interview practice AI',
    'TCS Infosys interview prep freshers',
    'mock interview for college students',
    'tell me about yourself campus placement',
  ],
  openGraph: {
    title: 'Campus Placement Interview Practice for Freshers | Oratii',
    description:
      'Prepare for campus placements with AI mock interviews, real-time vocal pacing telemetry, and STAR framework feedback.',
    url: `${siteUrl}/campus-placement-interview`,
    siteName: 'Oratii',
    type: 'article',
  },
};

const placementFaqs = [
  {
    q: 'What is the format of campus placement interviews?',
    a: 'Most campus drives (IT service firms like TCS, Infosys, Cognizant, as well as product startups) follow a 3-stage process: 1) Online Assessment (Aptitude & Coding), 2) Technical Round (Project review, core CS/Engineering fundamentals), and 3) HR / Managerial Round (Cultural fit, communication fluency, behavioral scenarios).',
  },
  {
    q: 'How does Oratii help freshers with campus placements?',
    a: 'Oratii simulates realistic dual-pane video interviews with AI recruiters (Sarah Jenkins and Marcus Vance). It scores your answers against the STAR method (Situation, Task, Action, Result), monitors your words-per-minute (WPM) to prevent nervous rushing, and flags filler words like "um" and "uh" in real-time.',
  },
  {
    q: 'How should a fresher explain their final-year project?',
    a: 'Use the 60-Second Architecture Rule: State the problem statement (10s), your specific tech stack and personal contribution (30s), the biggest challenge you solved (15s), and the quantifiable result or demo outcome (5s). Avoid deep diving into code unless asked.',
  },
  {
    q: 'Is Oratii free for college students?',
    a: 'Yes, Oratii offers a free tier allowing students to practice interview rounds, receive AI answer diagnostics, and run live speech pacing evaluations directly in their browser without payment or credit card.',
  },
];

export default function CampusPlacementPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: placementFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-100 selection:text-amber-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-transparent to-transparent dark:from-indigo-950/20 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-6">
            <GraduationCap size={14} />
            <span>2026 Campus Placement & Fresher Interview Guide</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] max-w-4xl">
            Campus Placement Interview Practice for Freshers
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Overcome interview nervousness, master the top HR questions, and practice speaking with adaptive AI recruiters before your campus drive.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/interview"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-900 text-white hover:bg-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Video size={16} />
              <span>Start Free AI Placement Mock</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/hr-interview-questions-freshers"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-xs"
            >
              <span>Explore Top 10 HR Questions</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>STAR Framework Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>Live WPM Speedometer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>Filler Word Detection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>100% Free In-Browser</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Campus Placement Rounds */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            What Campus Recruiters Actually Evaluate
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Companies reject 70% of technically qualified students in personal interview rounds due to nervous pacing, rambling answers, and lack of structure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Technical Discussion</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Recruiters test if you understand your final-year project and core fundamentals (Data Structures, DBMS, OOPs) or if you merely memorized definitions.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Key Metric: Technical clarity without excessive jargon
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">HR & Fit Evaluation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Assesses attitude, adaptability, willingness to relocate, and communication confidence. Questions like &ldquo;Tell me about yourself&rdquo; set the tone for the entire interview.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              Key Metric: 130–160 WPM pacing with zero crutch words
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Behavioral / STAR Round</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Focuses on how you handle team conflict, tight project deadlines, and mistakes. Evaluators look for concrete actions rather than theoretical statements.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Key Metric: 50% answer focus on personal Action
            </div>
          </div>
        </div>
      </section>

      {/* 5 Frequent Placement Questions & Strategy */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-amber-400">
                Core Question Bank
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                Top 5 Campus Interview Questions for Freshers
              </h2>
            </div>
            <Link
              href="/interview"
              className="text-xs font-bold text-indigo-900 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              Practice all in AI Studio <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {[
              {
                q: '1. Tell me about yourself and your academic journey.',
                tip: 'Apply the Present-Past-Future rule. State your degree/specialization, highlight 1 primary technical project, and explain why you want to begin your career with this company. Keep it under 75 seconds.',
                idealDuration: '60–75 sec',
              },
              {
                q: '2. Walk me through your final-year project. What was your personal contribution?',
                tip: 'Never say "we built everything together". State the overall project goal in 1 sentence, then specify your exact module (e.g. database schema, API integration, UI state management) and how you debugged a critical issue.',
                idealDuration: '90–120 sec',
              },
              {
                q: '3. Why do you want to join our company instead of other recruiters?',
                tip: 'Mention a specific product, engineering blog post, or training initiative the company runs. Show you did 15 minutes of research beyond reading their Wikipedia page.',
                idealDuration: '45–60 sec',
              },
              {
                q: '4. Describe a situation where a group project member did not contribute. How did you handle it?',
                tip: 'Use the STAR method. Avoid attacking your peer. Focus on how you redistributed tasks, set an intermediate checkpoint, and ensured the project was delivered on time.',
                idealDuration: '60–90 sec',
              },
              {
                q: '5. Are you comfortable with relocation and rotational shifts?',
                tip: 'Be upfront and positive. Emphasize that as a fresher, your priority is rapid career learning and hands-on production exposure.',
                idealDuration: '30–45 sec',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {item.q}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md self-start sm:self-auto">
                    Target: {item.idealDuration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-slate-100">Winning Strategy:</strong> {item.tip}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    AI Evaluator: Tests STAR structure & vocal cadence
                  </span>
                  <Link
                    href={`/interview?role=Software%20Engineer&focus=${encodeURIComponent(item.q)}`}
                    className="text-xs font-bold text-indigo-700 dark:text-amber-400 hover:text-indigo-900 dark:hover:text-amber-300 inline-flex items-center gap-1"
                  >
                    Practice with AI <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Placement Readiness Checklist */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Self-Audit Checklist
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Are You Ready for Day 1 Campus Drives?
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Verify these 5 telemetry benchmarks before sitting in front of your campus placement panel:
            </p>

            <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Vocal Speed:</strong> Kept between 130–160 words per minute without nervous speed bursts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Filler Frequency:</strong> Under 2% filler word density (eliminating &ldquo;um&rdquo;, &ldquo;actually&rdquo;, &ldquo;basically&rdquo;).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>STAR Method Balance:</strong> Spent at least 50% of behavioral response time detailing what <em>you</em> did (Action).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>60-Second Intro:</strong> Answered &ldquo;Tell me about yourself&rdquo; smoothly in under 75 seconds without reciting your CV.</span>
              </li>
            </ul>

            <div className="mt-8">
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-400 transition-all shadow-md"
              >
                <span>Test My Readiness in AI Studio</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions on Campus Placement Interviews
        </h2>

        <div className="space-y-4">
          {placementFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"
            >
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={16} className="text-indigo-600 dark:text-amber-400 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Links Footer Cluster */}
      <section className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Related Interview Prep Resources
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Link
              href="/hr-interview-questions-freshers"
              className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
            >
              Top 10 HR Interview Questions for Freshers →
            </Link>
            <Link
              href="/star-method-practice"
              className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
            >
              STAR Method Interview Builder & Practice →
            </Link>
            <Link
              href="/tell-me-about-yourself"
              className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
            >
              How to Answer &ldquo;Tell Me About Yourself&rdquo; →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

