import { Metadata } from 'next';
import Link from 'next/link';
import {
  Timer,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Mic,
  Award,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  BookOpen,
  Volume2,
  Target,
  Sliders,
  Zap,
  Gauge,
  Compass,
} from 'lucide-react';
import ModernBackgroundAnimation from '@/components/ui/ModernBackgroundAnimation';
import ElevatorPitchTool from './ElevatorPitchTool';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Free Elevator Pitch Timer & Structurer (30s, 60s, 90s) | Oratii',
  description:
    'Time, structure, and practice your 30-second, 60-second, or 90-second elevator pitch with real-time pacing cues, live mic transcription, word count estimators, and AI coaching benchmarks on Oratii.',
  alternates: {
    canonical: `${siteUrl}/tools/elevator-pitch-timer`,
  },
  keywords: [
    'elevator pitch timer',
    '30 second elevator pitch generator',
    '60 second pitch timer',
    'elevator pitch structurer',
    'elevator pitch 30 60 90',
    'how to structure an elevator pitch',
    'elevator pitch words per minute',
    'elevator pitch template for interview',
    'elevator pitch practice online',
    '30 second introduction timer',
    'tell me about yourself timer',
  ],
  openGraph: {
    title: 'Free Elevator Pitch Timer & Structurer (30s, 60s, 90s) | Oratii',
    description:
      'Master your 30s, 60s, or 90s elevator pitch. Free countdown stopwatch with segment pacing cues, live speech recognition, script builder, and job interview benchmarks.',
    url: `${siteUrl}/tools/elevator-pitch-timer`,
    siteName: 'Oratii',
    type: 'website',
  },
};

const pitchDurationsGuide = [
  {
    duration: '30 Seconds',
    name: 'The Networking Handshake / Quick Hook',
    words: '65 – 75 words',
    speed: '135 – 145 WPM',
    bestFor: 'Career fairs, cocktail networking, elevator rides, quick intros',
    structure: 'Hook & Identity (0–8s) → Core Value & Proof (8–22s) → Clear Ask (22–30s)',
    keyTip: 'Cut all biographical fluff. One sentence on who you are, one sentence on what you solve, and one clear ask.',
  },
  {
    duration: '60 Seconds',
    name: 'The Classic Interview / "Tell Me About Yourself"',
    words: '130 – 150 words',
    speed: '135 – 150 WPM',
    bestFor: 'Job interview openings, investor meetups, pitch showcases, team all-hands',
    structure: 'Hook & Context (0–12s) → Method/Mechanism (12–32s) → Metric/Proof (32–48s) → Next Step (48–60s)',
    keyTip: 'Include exactly one concrete metric (e.g. "reduced latency by 32%") to anchor your credibility in memory.',
  },
  {
    duration: '90 Seconds',
    name: 'The Pitch Competition / Deep Introduction',
    words: '195 – 225 words',
    speed: '130 – 145 WPM',
    bestFor: 'Startup demo days, academic thesis defenses, product launches, panel openings',
    structure: 'The Problem & Story (0–18s) → The Innovation (18–45s) → Traction & Differentiator (45–72s) → Vision & Close (72–90s)',
    keyTip: 'Use conversational pauses between sections to let complex technical details settle with the audience.',
  },
];

const faqs = [
  {
    q: 'How many words should be in a 30-second elevator pitch?',
    a: 'At the ideal conversational speaking speed of 135 to 150 words per minute (WPM), a 30-second elevator pitch should contain between 65 and 75 words. Speaking more than 85 words forces you to rush, while speaking fewer than 55 words leaves valuable airtime on the table.',
  },
  {
    q: 'What is the 4-part elevator pitch formula?',
    a: 'The gold standard framework consists of: 1) The Hook (who you are and the specific friction you eliminate), 2) The Mechanism (how you solve it uniquely), 3) The Quantified Proof (a tangible metric, traction stat, or milestone), and 4) The High-Impact Ask (the exact next step: an interview, 15-minute coffee, or demo).',
  },
  {
    q: 'What is the difference between a 30-second and a 60-second pitch?',
    a: 'A 30-second pitch is an interest-generator: its only objective is to earn permission for a longer conversation. A 60-second pitch has room to include your methodology and a concrete proof metric (such as a project result or revenue metric), making it ideal for job interview openings and investor introductions.',
  },
  {
    q: 'How does this free pitch timer help me stay on track?',
    a: 'Oratii’s Elevator Pitch Timer divides your 30s, 60s, or 90s countdown into visual milestone segments (Hook, Value, Proof, CTA). Audio chimes signal when it is time to transition phases, while live speech recognition analyzes your spoken words per minute and filler words in real time.',
  },
  {
    q: 'How do I stop rambling when introducing myself in job interviews?',
    a: 'Rambling happens when candidates recount their resume chronologically. Instead, use the 60-second Present-Past-Future formula: start with your current specialty (Present), anchor on one major quantified achievement (Past), and conclude with why this specific company aligns with your next step (Future).',
  },
  {
    q: 'Is this elevator pitch timer completely free to use?',
    a: 'Yes. The Oratii Elevator Pitch Timer & Structurer is 100% free and runs entirely in your web browser with zero signup, credit card, or installation required.',
  },
];

export default function ElevatorPitchTimerPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Elevator Pitch Timer & Structurer',
    url: `${siteUrl}/tools/elevator-pitch-timer`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free browser elevator pitch timer and 4-part structurer for 30s, 60s, and 90s pitches. Features segment pacing cues, live Web Speech transcription, word count calculator, and job interview benchmarks.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-900 overflow-x-hidden selection:bg-[#FEF7ED] selection:text-[#D98200]">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section with Oratii Modern Animated Canvas */}
      <ModernBackgroundAnimation variant="hero" className="pt-8 sm:pt-16 pb-10 sm:pb-14 px-3 sm:px-6 w-full overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#FEF7ED] border border-[#F2A93B]/40 text-[#D98200] text-[11px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest mb-4 shadow-2xs max-w-full truncate">
            <Sparkles size={13} className="text-[#F2A93B] animate-pulse shrink-0" />
            <span className="truncate">100% Free Browser Tool • No Signup Required</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-[1.2] max-w-4xl mx-auto mb-3 sm:mb-4 px-2">
            Elevator Pitch Timer &amp; <span className="text-[#D98200]">Structurer</span> (30s / 60s / 90s)
          </h1>

          <p className="text-slate-600 text-xs sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            Rehearse and perfect your elevator pitch with visual milestone pacing cues, live mic transcription, audio transition chimes, and word count estimators.
          </p>

          {/* The Live Interactive Pitch Suite */}
          <ElevatorPitchTool />
        </div>
      </ModernBackgroundAnimation>

      {/* Section 2: 30s vs 60s vs 90s Elevator Pitch Science Guide */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
            Cadence &amp; Duration Guide
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426] tracking-tight mb-3">
            How to Choose Between a 30s, 60s, or 90s Elevator Pitch
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Speaking cadence determines whether you captivate an audience or get tuned out. Compare the exact word count limits and pacing structures below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pitchDurationsGuide.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#FEF7ED] border border-[#F2A93B]/40 text-[#D98200] text-xs font-black">
                    {item.duration}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {item.speed}
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#0F1426] mb-2 leading-snug">
                  {item.name}
                </h3>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-semibold mb-3">
                  🎯 <strong>Target Length:</strong> {item.words}
                </div>

                <p className="text-xs text-slate-600 mb-3 font-medium leading-relaxed">
                  <strong>Best for:</strong> {item.bestFor}
                </p>

                <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
                  <strong>Roadmap:</strong> {item.structure}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-medium text-slate-500 italic">
                💡 {item.keyTip}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: The 4-Part Elevator Pitch Framework */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50/70 border-y border-slate-200/80 w-full">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2 block">
              Proven Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426] tracking-tight mb-3">
              The 4 Essential Blocks of an Unforgettable Pitch
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Every magnetic pitch follows an intentional psychological progression from problem to conviction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm mb-3">
                1
              </div>
              <h3 className="text-base font-black text-[#0F1426] mb-1">The Attention Hook</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Who you are and the sharp friction point you eliminate. Hook the listener in the first 8–12 seconds before cognitive fatigue sets in.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-black flex items-center justify-center text-sm mb-3">
                2
              </div>
              <h3 className="text-base font-black text-[#0F1426] mb-1">The Mechanism</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Your unique solution, tech stack, or methodology. Clearly articulate why your approach succeeds where standard solutions fail.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 font-black flex items-center justify-center text-sm mb-3">
                3
              </div>
              <h3 className="text-base font-black text-[#0F1426] mb-1">The Quantified Proof</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                One hard number or credential. Whether it is 32% latency reduction, $45,000 in pipeline, or 1,400 beta users, metrics make claims indelible.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-sm mb-3">
                4
              </div>
              <h3 className="text-base font-black text-[#0F1426] mb-1">The Clear Ask</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Never finish with awkward silence or &ldquo;that&apos;s all&rdquo;. Give the listener a crisp next step: a 15-minute coffee, a pilot demo, or an interview.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Common Pitfalls & Traps */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-red-600 mb-2 block">
            Mistakes to Avoid
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426] tracking-tight mb-3">
            Why 80% of Elevator Pitches Fall Flat
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Be mindful of these recurring delivery errors when practicing with your timer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-red-100 shadow-2xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 shrink-0 flex items-center justify-center mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F1426] mb-1">The Chronological Resume Trap</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Starting with &ldquo;I was born in Chicago, then in 2018 I attended high school...&rdquo; drains energy immediately. Start with your present specialty and biggest value proposition.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-red-100 shadow-2xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 shrink-0 flex items-center justify-center mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F1426] mb-1">The 200 WPM Speed-Racer Trap</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Trying to squeeze 180 words into a 30-second window sounds anxious and panicked. Use Oratii&apos;s live WPM speedometer to maintain a steady 135–150 WPM cadence.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-red-100 shadow-2xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 shrink-0 flex items-center justify-center mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F1426] mb-1">The Empty Buzzword Fog</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Saying &ldquo;I am a results-oriented synergist driving cross-functional paradigm shifts&rdquo; conveys zero actionable information. Replace buzzwords with concrete projects and tangible tools.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-red-100 shadow-2xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 shrink-0 flex items-center justify-center mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F1426] mb-1">The Missing Call to Action</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Concluding with an awkward pause or &ldquo;yeah, so that&apos;s pretty much me&rdquo; ruins an otherwise stellar introduction. Always close with a proactive question or invitation to sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Frequently Asked Questions (FAQ) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50/70 border-t border-slate-200/80 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426] tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Everything you need to know about crafting, timing, and delivering a pitch that wins interviews and deals.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
              >
                <h3 className="text-base sm:text-lg font-black text-[#0F1426] mb-2 flex items-start gap-2.5">
                  <HelpCircle size={18} className="text-[#F2A93B] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Next Stage AI Preparation Call to Action */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[#0F1426] to-slate-900 text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F2A93B]/20 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-3 block">
              Step Beyond The Timer
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
              Test Your Pitch with a Live AI Recruiter
            </h2>
            <p className="text-slate-300 text-xs sm:text-base font-medium leading-relaxed mb-8">
              Now that you&apos;ve perfected your 30s or 60s timing, experience a photorealistic mock interview. Get instant feedback on eye contact, vocal clarity, and recruiter follow-ups.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/interview"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F2A93B] hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Free Mock Interview</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/tools/speech-speed-wpm-calculator"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Gauge size={15} />
                <span>Test Vocal Speedometer</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

