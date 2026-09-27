import { Metadata } from 'next';
import Link from 'next/link';
import { Mic, Zap, ArrowRight, CheckCircle2, Gauge, BarChart3, HelpCircle, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Free Speech Speed & WPM Calculator Online | Oratii AI',
  description: 'Calculate your speaking speed in Words Per Minute (WPM) instantly. Test your mic live for free and get real-time feedback on your speech pacing.',
  keywords: ['speech wpm calculator', 'words per minute speaker', 'speaking speed test', 'how fast do I speak', 'speech pacing analyzer'],
  alternates: {
    canonical: 'https://oratii.in/tools/wpm-calculator',
  },
  openGraph: {
    title: 'Free Speech Speed & WPM Calculator | Oratii AI',
    description: 'Calculate your speaking speed in Words Per Minute (WPM) live. Get instant feedback on your pacing.',
    url: 'https://oratii.in/tools/wpm-calculator',
  },
};

export default function WpmCalculatorPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://oratii.in' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Tools', 'item': 'https://oratii.in/tools/wpm-calculator' },
      { '@type': 'ListItem', 'position': 3, 'name': 'Speech WPM Calculator', 'item': 'https://oratii.in/tools/wpm-calculator' }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'What is an optimal speaking speed in Words Per Minute (WPM)?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'The ideal speaking speed for public speeches and presentations is between 130 and 150 WPM. Speeches above 160 WPM sound rushed, while pacing under 110 WPM can cause listeners to lose focus.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How does the Oratii WPM Calculator measure speech pace?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Oratii uses Web Speech API and acoustic speech telemetry to count spoken words in real-time, dividing total word count by spoken duration to give instant WPM feedback.'
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
        <section className="bg-gradient-to-b from-teal-50 via-slate-50 to-[#F8FAFC] py-16 sm:py-24 px-4 sm:px-8 border-b border-teal-100 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 text-teal-800 text-xs font-black uppercase tracking-widest shadow-2xs">
              <Sparkles size={14} className="text-teal-600 animate-pulse" />
              <span>Free Online Speech Tool</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-tight">
              Free Speech Speed &amp; <br />
              <span className="text-teal-600">WPM Calculator</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Find out if you speak too fast or too slow. Test your voice live with real-time Words Per Minute (WPM) telemetry.
            </p>

            {/* Interactive Tool Banner */}
            <div className="pt-6">
              <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="text-teal-600" size={24} />
                    <span className="font-extrabold text-slate-900 text-sm">WPM Telemetry Engine</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-300">
                    Live Mic Enabled
                  </span>
                </div>

                <div className="py-4 text-center space-y-2">
                  <div className="text-5xl font-black text-[#0F1426]">
                    138 <span className="text-lg font-bold text-slate-500">WPM</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                    <CheckCircle2 size={14} /> Optimal Pacing Range (130-150 WPM)
                  </p>
                </div>

                <Link
                  href="/speech-coach"
                  className="w-full py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Mic size={18} className="text-[#F2A93B]" />
                  Start Full Live WPM Practice <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Informational Breakdown */}
        <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426]">Understanding Speech Rates</h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-xl mx-auto">
              How your speaking speed impacts audience comprehension and confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-black text-rose-600 uppercase tracking-widest block">Too Fast</span>
              <div className="text-2xl font-black text-slate-900">&gt; 160 WPM</div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Sounds nervous, rushed, or panicked. Listeners struggle to retain key points.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-2">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest block">Optimal Target</span>
              <div className="text-2xl font-black text-emerald-950">130 – 150 WPM</div>
              <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                Clear, engaging, and authoritative pacing for speeches, meetings, and interviews.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">Too Slow</span>
              <div className="text-2xl font-black text-slate-900">&lt; 110 WPM</div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Can sound hesitant or overly monotonous, causing the audience to lose attention.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
