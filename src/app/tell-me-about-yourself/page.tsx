import { Metadata } from 'next';
import Link from 'next/link';
import {
  Mic,
  Video,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  Play,
} from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'How to Answer "Tell Me About Yourself" (Scripts & AI Practice) | Oratii',
  description:
    'The proven Present-Past-Future formula for answering "Tell Me About Yourself" in job interviews. Includes word-for-word scripts for freshers, engineers, and career changers with live AI practice.',
  alternates: {
    canonical: `${siteUrl}/tell-me-about-yourself`,
  },
  keywords: [
    'tell me about yourself interview answer',
    'how to answer tell me about yourself freshers',
    'introduce yourself in interview',
    'tell me about yourself engineering fresher',
    '60 second elevator pitch interview',
    'self introduction in interview sample',
  ],
  openGraph: {
    title: 'How to Answer "Tell Me About Yourself" (Scripts & AI Practice) | Oratii',
    description:
      'Learn the 60-second Present-Past-Future framework for answering Tell Me About Yourself with word-for-word scripts and AI practice.',
    url: `${siteUrl}/tell-me-about-yourself`,
    siteName: 'Oratii',
    type: 'article',
  },
};

const tmayFaqs = [
  {
    q: 'How long should "Tell me about yourself" be?',
    a: 'Between 60 and 90 seconds (approximately 130 to 180 spoken words). Speaking under 45 seconds makes you appear underprepared, while speaking over 2 minutes causes the recruiter to lose focus.',
  },
  {
    q: 'What is the Present-Past-Future formula?',
    a: '1) Present (20s): Your current academic qualification or role and primary technical skills. 2) Past (25s): 1 or 2 relevant projects or accomplishments that prove your capabilities. 3) Future (15s): Why you want this specific position and how you will add value.',
  },
  {
    q: 'Should I mention personal hobbies or marital status?',
    a: 'No. Keep your answer 100% focused on your professional identity, projects, problem-solving skills, and relevance to the role you are interviewing for.',
  },
];

export default function TellMeAboutYourselfPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tmayFaqs.map((faq) => ({
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-6">
            <Clock size={14} />
            <span>The 60-Second Interview Formula</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            How to Answer &ldquo;Tell Me About Yourself&rdquo;
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            The #1 most asked question in every job interview. Use the 3-part Present-Past-Future formula, study word-for-word scripts, and test your 60-second delivery with real-time AI speech pacing.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/speech-coach"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-900 text-white hover:bg-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 transition-all shadow-md"
            >
              <Mic size={16} />
              <span>Record & Test 60-Second Pitch (Free)</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/interview"
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 transition-all"
            >
              Practice in Video AI Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Formula Breakdown */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            The Present-Past-Future Formula
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Never start with your childhood or high school grades. Structure your introduction chronologically like this:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4">
              1
            </div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Step 1 (20 Seconds)
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">The Present</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Who you are today: degree, specialization, and core focus area. Mention what you are building or studying right now.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4">
              2
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Step 2 (25 Seconds)
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">The Past</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              How you got here: 1 standout project, internship, or hackathon where you solved a real problem and learned core technical skills.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4">
              3
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Step 3 (15 Seconds)
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">The Future</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Why this opportunity: Connect your trajectory directly to why this company and team are the natural next step in your career.
            </p>
          </div>
        </div>
      </section>

      {/* Word-for-Word Scripts */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-amber-400">
              Word-for-Word Scripts
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Sample Answers by Experience Level
            </h2>
          </div>

          <div className="space-y-6">
            {/* Script 1: Fresher */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Script 1: College Fresher / Graduate
                </span>
                <span className="text-xs text-slate-400 font-medium">Duration: ~65 sec</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                &ldquo;I am a recent Computer Science graduate from Delhi Technological University with a focus on web technologies and distributed systems. During college, I developed a strong interest in backend optimization, which inspired my final-year project: an open-source analytics dashboard that processed 50,000 real-time events using Redis and Node.js with sub-50ms latency. Outside of coursework, I served as lead coordinator for our college coding club, organizing monthly technical workshops for 200+ junior students. I am excited about joining your team because you are scaling your enterprise cloud platform, and I want to bring my foundation in high-performance APIs to ship reliable features alongside your engineering leads.&rdquo;
              </p>
            </div>

            {/* Script 2: Career Changer */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Script 2: Career Changer / Self-Taught
                </span>
                <span className="text-xs text-slate-400 font-medium">Duration: ~70 sec</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                &ldquo;Over the past two years, I transitioned from mechanical engineering into software development after building automated workflow scripts that saved my previous team 10 hours a week. That experience led me to complete intensive full-stack certifications in TypeScript, Next.js, and Postgres. I have since shipped three production-grade web applications, including a full-featured e-commerce store with live payment processing and 99.8% test coverage. My engineering background gives me strong analytical debugging habits, and I am excited to apply that discipline to this frontend engineer role at your company.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Take the 60-Second Speedometer Test
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mt-2">
            Hit record in Oratii’s Speech Coach. Our live WPM speedometer tells you in real-time if you are rushing (over 160 WPM) or dragging (under 120 WPM), and lists every filler word you say.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/speech-coach"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-400 transition-all shadow-md"
            >
              <Mic size={16} />
              <span>Record My Intro in Speech Coach</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {tmayFaqs.map((faq, idx) => (
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

      {/* Footer Nav */}
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
          <Link href="/star-method-practice" className="hover:text-indigo-600 dark:hover:text-amber-400">
            STAR Method Answer Builder →
          </Link>
        </div>
      </section>
    </div>
  );
}
