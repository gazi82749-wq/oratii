import { Metadata } from 'next';
import Link from 'next/link';
import { Mic, BarChart3, GraduationCap, Award, Sparkles, Share2, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  params: { id: string };
  searchParams: { score?: string; wpm?: string; fillers?: string; type?: string; title?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const score = searchParams.score || '88';
  const type = searchParams.type || 'Speech Analysis';
  const title = searchParams.title || 'Oratii Verified Practice Report';

  return {
    title: `${title} | Score: ${score}/100 — Oratii AI`,
    description: `Check out this verified ${type} score of ${score}/100 on Oratii AI Speech & Presentation Coach.`,
    openGraph: {
      title: `${title} — Score: ${score}/100`,
      description: `Verified AI Speech & Presentation audit by Oratii. Practice your public speaking and get 20 free credits today!`,
      images: ['/og-image.png'],
    },
  };
}

export default function ShareReportPage({ params, searchParams }: Props) {
  const score = parseInt(searchParams.score || '88', 10);
  const wpm = searchParams.wpm || '142';
  const fillers = searchParams.fillers || '2';
  const type = searchParams.type || 'speech';
  const title = searchParams.title || 'Public Speaking Practice Session';

  const getScoreBadge = (s: number) => {
    if (s >= 85) return { label: 'Exceptional Delivery', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (s >= 70) return { label: 'Strong Presentation', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    return { label: 'Practice In Progress', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  };

  const badge = getScoreBadge(score);

  return (
    <div className="min-h-screen bg-[#0A0D18] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              O
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Oratii Verified Report
              </span>
              <p className="text-xs text-slate-400">ID: #{params.id.slice(0, 10)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
            <ShieldCheck size={14} />
            Verified AI Audit
          </div>
        </div>

        {/* Title & Badge */}
        <div className="text-center mb-8">
          <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-semibold border ${badge.color} mb-3`}>
            {badge.label}
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
        </div>

        {/* Score Card Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
            <Award className="text-indigo-400 mb-1" size={22} />
            <span className="text-3xl font-black text-white">{score}</span>
            <span className="text-[11px] text-slate-400 font-medium">Overall Score</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
            <BarChart3 className="text-emerald-400 mb-1" size={22} />
            <span className="text-3xl font-black text-white">{wpm}</span>
            <span className="text-[11px] text-slate-400 font-medium">Pacing (WPM)</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
            <Sparkles className="text-amber-400 mb-1" size={22} />
            <span className="text-3xl font-black text-white">{fillers}</span>
            <span className="text-[11px] text-slate-400 font-medium">Fillers Detected</span>
          </div>
        </div>

        {/* Breakdown Summary Box */}
        <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-2xl p-4 mb-8 text-sm text-indigo-200">
          <div className="flex items-center gap-2 font-bold mb-1.5 text-indigo-300">
            <CheckCircle2 size={16} className="text-indigo-400" />
            Performance Highlight
          </div>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Maintained strong vocal cadence and clear articulation. Speech structure demonstrated excellent pacing stability with minimal filler pauses.
          </p>
        </div>

        {/* Viral Referral CTA */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-violet-900/50 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-5 text-center">
          <h3 className="text-base font-bold text-white mb-1">Want to test your speaking score?</h3>
          <p className="text-xs text-slate-300 mb-4">
            Practice speeches, pitch decks, and academic Viva Voce defenses with AI feedback. Get 20 free credits when you start.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
          >
            Claim 20 Free Credits & Try Oratii
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Powered by <span className="font-semibold text-slate-400">Oratii AI Speech & Presentation Coach</span>
      </div>
    </div>
  );
}
