import { Metadata } from 'next';
import Link from 'next/link';
import {
  Gauge,
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
} from 'lucide-react';
import WpmCalculatorTool from './WpmCalculatorTool';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Free Speech Speed (WPM) Calculator & Live Pacing Test | Oratii',
  description:
    'Test your speaking pace live in your browser. Measure Words Per Minute (WPM), count filler words, benchmark against the ideal job interview pace (130–150 WPM), and improve your verbal fluency for free.',
  alternates: {
    canonical: `${siteUrl}/tools/speech-speed-wpm-calculator`,
  },
  keywords: [
    'speech pace calculator',
    'words per minute speaking test',
    'speech speed wpm calculator',
    'ideal wpm for interview',
    'how many words per minute speaking',
    'speaking cadence test',
    'filler word counter',
    'public speaking pace test',
    'speech rate analyzer online',
  ],
  openGraph: {
    title: 'Free Speech Speed (WPM) Calculator & Live Pacing Test | Oratii',
    description:
      'Measure your speaking speed live with our free WPM speedometer. Real-time words per minute calculation, filler word alerts, and job interview benchmarks.',
    url: `${siteUrl}/tools/speech-speed-wpm-calculator`,
    siteName: 'Oratii',
    type: 'website',
  },
};

const wpmBenchmarks = [
  {
    useCase: 'Job & Campus Placement Interviews',
    idealWpm: '130 – 150 WPM',
    perception: 'Confident, structured, composed, authoritative',
    risk: 'Above 165 WPM sounds anxious and rehearsed; below 115 WPM sounds hesitant or unsure.',
  },
  {
    useCase: 'Technical Explanations & System Architecture',
    idealWpm: '115 – 135 WPM',
    perception: 'Deliberate, methodical, easy to digest high cognitive density',
    risk: 'Speaking too fast causes interviewers to lose track of algorithmic trade-offs.',
  },
  {
    useCase: 'Executive Keynotes & Stage Speeches',
    idealWpm: '120 – 140 WPM',
    perception: 'Inspirational, gravitas, commanding presence',
    risk: 'Auditorium acoustics require slower delivery with intentional pauses.',
  },
  {
    useCase: 'Podcasts & Casual Storytelling',
    idealWpm: '145 – 165 WPM',
    perception: 'Dynamic, engaging, friendly, conversational',
    risk: 'Listener playback speeds (1.2x/1.5x) mean clear diction is critical.',
  },
];

const faqs = [
  {
    q: 'What is a normal speaking speed in Words Per Minute (WPM)?',
    a: 'For English speakers, the average conversational speaking rate is between 130 and 150 words per minute (WPM). Audiobooks and podcast hosts typically average 150–160 WPM, while keynote speakers and technical interview candidates speak slightly slower at 120–140 WPM to maximize comprehension.',
  },
  {
    q: 'What is the best speaking speed for a job interview?',
    a: 'The gold standard for job and campus placement interviews is 135 to 150 WPM. Under interview anxiety, heart rates elevate and candidates subconsciously accelerate past 180 WPM, causing rambling and filler words. Maintaining 140 WPM signals emotional control, maturity, and structured thinking.',
  },
  {
    q: 'How does this free Speech Speed Calculator measure WPM?',
    a: 'Our browser-based calculator uses the native Web Speech API to transcribe your spoken words live. It continuously divides the count of recognized words by the elapsed time in minutes: WPM = (Total Spoken Words) ÷ (Elapsed Seconds ÷ 60). It also highlights common filler words (um, uh, like, basically) in real time.',
  },
  {
    q: 'How do I slow down my speech if I talk too fast?',
    a: 'Use the "Period-Pause Technique": whenever you reach the end of a sentence or a major thought, take a full 1-second breath instead of filling the silence with "um" or "like". Silent pauses project confidence, lower your heart rate, and give recruiters time to process your points.',
  },
  {
    q: 'Do I need to create an account or pay to use this tool?',
    a: 'No. The Oratii Speech Speed WPM Calculator is 100% free and runs directly in your web browser with zero signup, payment, or credit card required.',
  },
];

export default function SpeechSpeedWpmCalculatorPage() {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Speech Speed (WPM) Calculator',
    url: `${siteUrl}/tools/speech-speed-wpm-calculator`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free real-time browser speech speed calculator and words-per-minute pacing test. Measures spoken WPM, tracks filler words, and benchmarks against ideal job interview cadences.',
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
    <div className="min-h-screen bg-[#0B0E1B] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide uppercase mb-6 animate-fade-in">
          <Gauge size={14} />
          <span>100% Free Browser Tool • No Signup Required</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight mb-5">
          Free Speech Speed <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#F2A93B] to-orange-400">(WPM) Calculator</span> &amp; Pacing Test
        </h1>

        <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Measure your spoken Words Per Minute live with our interactive speedometer. Discover whether you speak too fast, too slow, or at the optimal 130–150 WPM interview cadence.
        </p>

        {/* The Live Interactive Speedometer & Testing Suite */}
        <WpmCalculatorTool />
      </section>

      {/* Section 2: WPM Reference Benchmark Guide */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
            What Is the Ideal Speaking Pace for Different Settings?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Speaking cadence is not one-size-fits-all. Pacing shifts depending on cognitive load and audience context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wpmBenchmarks.map((bench, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-white">{bench.useCase}</h3>
                <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-lg text-xs font-mono font-bold text-amber-400">
                  {bench.idealWpm}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-2">
                <strong className="text-emerald-400">Recruiter Perception:</strong> {bench.perception}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-rose-400">Pacing Risk:</strong> {bench.risk}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: The Mathematical WPM Formula & Speed Science */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-amber-950/20 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4 flex items-center gap-2.5">
              <BookOpen className="text-amber-400" size={26} />
              The Science of Words Per Minute (WPM)
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Words Per Minute (WPM) measures the rate of verbal output. In psychology and linguistics, human working memory processes spoken speech most effectively at <strong>140 to 160 WPM</strong>. Above 180 WPM, listener comprehension drops by up to 40% as cognitive load increases.
            </p>

            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl mb-6 font-mono text-xs sm:text-sm text-amber-300 flex items-center justify-between">
              <span>WPM = (Total Spoken Words) ÷ (Elapsed Time in Seconds ÷ 60)</span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              3 Techniques to Slow Down When Interview Anxiety Hits:
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>The 2-Second Water Sip / Pause:</strong> Before answering any complex question, take 2 seconds of silence or a sip of water. It resets your vocal cords and signals composure.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Enunciate Consonants:</strong> Fast speakers blur their T&apos;s, D&apos;s, and P&apos;s. Deliberately articulating word endings naturally anchors your speech to a steady 140 WPM.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Structure with the STAR Method:</strong> When you know your story framework in advance (Situation $\to$ Task $\to$ Action $\to$ Result), you avoid the anxious nervous rushing that causes filler words.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Related Preparation Hubs (Internal Linking) */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-800/80">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
          Explore Free Interview &amp; Speech Guides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/tell-me-about-yourself"
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
          >
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
              &ldquo;Tell Me About Yourself&rdquo;
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The 60-second Present-Past-Future script and pacing test.
            </p>
          </Link>
          <Link
            href="/star-method-practice"
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
          >
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
              STAR Method Practice
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Master behavioral interviews with the 50% Action Rule.
            </p>
          </Link>
          <Link
            href="/campus-placement-interview"
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
          >
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
              Campus Placement Prep
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineering placement rounds, questions, and readiness rubric.
            </p>
          </Link>
          <Link
            href="/hr-interview-questions-freshers"
            className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
          >
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
              Top HR Questions
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              10 most common fresher questions with sample answers.
            </p>
          </Link>
        </div>
      </section>

      {/* Section 5: FAQs with JSON-LD Schema */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="text-amber-400" size={26} />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-left"
            >
              <h3 className="text-sm sm:text-base font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Conversion Section */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center border-t border-slate-800/80">
        <div className="bg-gradient-to-b from-amber-500/10 via-slate-900/90 to-slate-950 border border-amber-500/30 rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Ready to Practice Full AI Mock Interviews?
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Move beyond words-per-minute. Practice interactive video interviews with real-time AI feedback on posture, filler words, vocal inflection, and STAR delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/interview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl transition-all shadow-xl shadow-amber-500/20"
            >
              <Mic size={18} />
              <span>Start Free AI Mock Interview</span>
            </Link>
            <Link
              href="/speech-coach"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-colors border border-slate-700"
            >
              <span>Explore AI Speech Coach</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
