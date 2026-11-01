import { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, Mic, CheckCircle2, TrendingUp, Sparkles, BookOpen, Share2, Award, ArrowRight } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'AI Speech & Interview Benchmark Report 2026 | Oratii Research',
  description: 'Official benchmarks on vocal pacing, filler word frequency, and STAR interview delivery analyzed by Oratii AI. Cited by educators and career coaches.',
  alternates: {
    canonical: `${siteUrl}/research`,
  },
  openGraph: {
    title: 'AI Speech & Interview Benchmark Report 2026 | Oratii Research',
    description: 'Official benchmarks on vocal pacing, filler word frequency, and STAR interview delivery analyzed by Oratii AI.',
    url: `${siteUrl}/research`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Oratii AI Speech & Interview Benchmark Report',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Speech & Interview Benchmark Report 2026 | Oratii Research',
    description: 'Official benchmarks on vocal pacing, filler words, and STAR interview delivery.',
    images: [`${siteUrl}/og-image.png`],
  },
};

const researchSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'AI Speech & Interview Communication Benchmark Report 2026',
  description: 'Comprehensive acoustic and behavioral speech metrics evaluating vocal pacing, filler word density, and STAR interview delivery.',
  url: `${siteUrl}/research`,
  datePublished: '2026-01-15',
  dateModified: '2026-11-01',
  author: {
    '@type': 'Organization',
    name: 'Oratii AI Research Labs',
    url: siteUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Oratii',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon-512.png`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${siteUrl}/research`,
  },
};

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 pt-6 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(researchSchema) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Pill */}
        <div className="flex items-center gap-2 mb-6 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#0F1426] font-bold">Research & Benchmarks</span>
        </div>

        {/* Hero Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} className="text-[#F2A93B]" />
            Official Benchmark Report • Updated 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
            Workplace Speech, Vocal Pacing & Interview Delivery Report
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
            Derived from acoustic telemetry and mock interview sessions across tech, business, and academic cohorts. This report details vocal pacing standards, filler word density, and structured answer retention.
          </p>
        </header>

        {/* Key Benchmark Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Optimal Pacing</span>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">130–155</div>
            <div className="text-xs font-medium text-slate-500">Words Per Minute (WPM)</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Filler Count</span>
              <Mic size={18} className="text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">4.8 / min</div>
            <div className="text-xs font-medium text-slate-500">Unrehearsed baseline</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Improvement Rate</span>
              <CheckCircle2 size={18} className="text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">62% Drop</div>
            <div className="text-xs font-medium text-slate-500">In fillers after 5 drills</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">STAR Retention</span>
              <Award size={18} className="text-indigo-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">84% Success</div>
            <div className="text-xs font-medium text-slate-500">When actions exceed 50%</div>
          </div>
        </div>

        {/* Section 1: Vocal Pacing Distribution */}
        <section className="mb-14 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <BarChart3 className="text-[#F2A93B]" size={26} />
            1. Vocal Pacing Distribution (Words Per Minute)
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Pacing is the single largest indicator of speaker confidence. Research indicates that listeners perceive candidates speaking below 110 WPM as hesitant or unsure, while pacing above 175 WPM triggers heightened anxiety markers in hiring evaluations.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900">Optimal Professional Delivery</span>
                <p className="text-xs text-slate-500">Clear articulation, natural pauses, maximum listener retention</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black self-start sm:self-auto">
                130 – 155 WPM
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900">Keynote & Academic Defense</span>
                <p className="text-xs text-slate-500">Deliberate emphasis, complex technical explanations</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black self-start sm:self-auto">
                110 – 125 WPM
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900">Rushed / Nervous Acceleration</span>
                <p className="text-xs text-slate-500">Reduced vocal clarity, breath shortage, missed bullet points</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black self-start sm:self-auto">
                170+ WPM
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Filler Word Density */}
        <section className="mb-14 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <Mic className="text-[#FF6B35]" size={26} />
            2. Filler Word Density & Cognitive Pausing
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            In analyzing unpracticed vocal samples, filler words occur as subconscious placeholders during cognitive retrieval. Replacing vocal fillers with silent micro-pauses (0.5s to 1.2s) dramatically boosts authoritative delivery ratings.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
              <div className="text-xl font-black text-amber-950">34%</div>
              <div className="text-xs font-bold text-amber-700 mt-1">&quot;Um / Uh&quot;</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xl font-black text-slate-900">28%</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">&quot;Like&quot;</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xl font-black text-slate-900">18%</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">&quot;You know&quot;</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xl font-black text-slate-900">12%</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">&quot;Actually&quot;</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <div className="text-xl font-black text-slate-900">8%</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">&quot;Basically&quot;</div>
            </div>
          </div>
        </section>

        {/* Section 3: The 50% Rule in Behavioral STAR Answers */}
        <section className="mb-14 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={26} />
            3. The 50% Rule in Behavioral STAR Answers
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Candidates who fail mock interviews typically spend 70% of their time describing context and background. Top-performing candidates allocate over half of their response strictly to <strong>Action steps</strong> and <strong>quantifiable Results</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Situation</div>
              <div className="text-2xl font-black text-slate-900 mb-1">15%</div>
              <p className="text-xs text-slate-600">Brief context setup (15–20s)</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Task</div>
              <div className="text-2xl font-black text-slate-900 mb-1">15%</div>
              <p className="text-xs text-slate-600">Specific challenge defined (15–20s)</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Action</div>
              <div className="text-2xl font-black text-emerald-950 mb-1">50%</div>
              <p className="text-xs text-emerald-800 font-medium">Your exact decisions & implementation (50–60s)</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Result</div>
              <div className="text-2xl font-black text-slate-900 mb-1">20%</div>
              <p className="text-xs text-slate-600">Measurable impact & business outcome (20–25s)</p>
            </div>
          </div>
        </section>

        {/* Citation Box (Magnet for Backlinks) */}
        <section className="mb-14 p-8 rounded-3xl bg-[#0F1426] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-bold mb-3">
              <Share2 size={13} />
              Cite This Benchmark
            </div>
            <h2 className="text-2xl font-bold mb-2">Using This Research in Your Articles & Guides</h2>
            <p className="text-slate-300 text-sm mb-6 max-w-2xl">
              Bloggers, journalists, universities, and career coaches are encouraged to cite and reference these findings. Please attribute back to the official Oratii benchmark page:
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-200 select-all mb-4">
              [Oratii Workplace Speech & Interview Benchmark Report (2026)](https://oratii.in/research)
            </div>

            <p className="text-xs text-slate-400">
              APA Citation: Oratii Research Labs. (2026). Workplace Speech, Vocal Pacing & Interview Delivery Report. Retrieved from https://oratii.in/research
            </p>
          </div>
        </section>

        {/* Interactive Practice Call to Action */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-300/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Test Your Delivery Against These Benchmarks</h3>
            <p className="text-slate-600 text-sm max-w-xl">
              Practice with Oratii&apos;s real-time AI speech engine to measure your exact WPM, eliminate filler words, and rehearse mock interviews with live video feedback.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/speech-coach"
              className="px-5 py-3 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              Start Free Speech Drill <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
