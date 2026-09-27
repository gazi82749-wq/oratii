import { Metadata } from 'next';
import Link from 'next/link';
import { Mic, Zap, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Free Filler Word Counter Online | Oratii AI',
  description: 'Detect and count filler words ("um", "like", "basically", "you know") in real-time. Test your speech live with instant AI crutch-word telemetry.',
  keywords: ['filler word counter', 'detect filler words online', 'stop saying um', 'speech filler words detector', 'crutch word counter'],
  openGraph: {
    title: 'Free Filler Word Counter Online | Oratii AI',
    description: 'Detect and count filler words in your speech live. Eliminate "um", "like", and "basically".',
    url: 'https://oratii.in/tools/filler-word-counter',
  },
};

export default function FillerWordCounterPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Why do speakers use filler words like "um" and "basically"?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Filler words are vocal crutches used while the brain formulates the next thought. Pausing silently instead of using filler words makes you sound significantly more confident and composed.'
        }
      },
      {
        '@type': 'Question',
        'name': 'How does Oratii count filler words in real-time?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Oratii processes live microphone speech through continuous acoustic speech recognition, flagging filler words like "um", "uh", "basically", "like", and "you know" with timestamp telemetry.'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1 w-full">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-rose-50 via-slate-50 to-[#F8FAFC] py-16 sm:py-24 px-4 sm:px-8 border-b border-rose-100 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-rose-200 text-rose-800 text-xs font-black uppercase tracking-widest shadow-2xs">
              <Sparkles size={14} className="text-rose-600 animate-pulse" />
              <span>Free Online Speech Tool</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-tight">
              Free Online Filler Word <br />
              <span className="text-rose-600">Counter &amp; Detector</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Eliminate vocal crutches like &quot;basically&quot;, &quot;um&quot;, &quot;like&quot;, and &quot;you know&quot;. Test your mic live for instant filler word detection.
            </p>

            {/* Interactive Tool Banner */}
            <div className="pt-6">
              <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="text-rose-600" size={24} />
                    <span className="font-extrabold text-slate-900 text-sm">Filler Word Detection Engine</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px] border border-rose-300">
                    Live Mic Enabled
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                    <div className="text-2xl font-black text-rose-700">0</div>
                    <div className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">&quot;Basically&quot;</div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                    <div className="text-2xl font-black text-rose-700">0</div>
                    <div className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">&quot;Um / Uh&quot;</div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                    <div className="text-2xl font-black text-rose-700">0</div>
                    <div className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">&quot;You Know&quot;</div>
                  </div>
                </div>

                <Link
                  href="/speech-coach"
                  className="w-full py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Mic size={18} className="text-[#F2A93B]" />
                  Try Speech Coach Filler Audit <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Informational Breakdown */}
        <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426]">Common Vocal Crutches Detected</h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Oratii continuously monitors your live speech for top filler words in English and Hinglish.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['"Um" / "Uh"', '"Basically"', '"Like"', '"You Know"'].map((word, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <AlertCircle size={20} className="text-rose-500 shrink-0" />
                <div>
                  <div className="font-black text-slate-900 text-base">{word}</div>
                  <div className="text-xs text-slate-500 font-medium">Automatic detection</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
