import { Metadata } from 'next';
import Link from 'next/link';
import {
  Mic,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Trophy,
  BarChart3,
  ArrowRight,
  Lock,
  Target,
  Zap,
  Award,
  Flame,
  CheckCircle2
} from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About Us | Oratii Speech & Placement Lab',
  description: 'Learn why we built Oratii — the next-generation speech coach, mock interview lab, and educator studio empowering every speaker to lead the room.',
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-indigo-500/20">
      <main className="flex-1 w-full">
        {/* ── 1. Hero Section (Light Theme) ── */}
        <section className="relative bg-gradient-to-b from-indigo-50/80 via-slate-50 to-[#F8FAFC] py-16 sm:py-24 px-4 sm:px-8 border-b border-indigo-100/60 overflow-hidden">
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/40 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-200/40 blur-3xl rounded-full pointer-events-none" />
          
          <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest shadow-2xs">
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              <span>About Oratii</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto text-slate-950">
              Empowering every speaker to <br className="hidden sm:block" />
              <span className="text-indigo-600">
                master their message &amp; lead the room.
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              We built Oratii because public speaking, job interviews, and presentations shouldn&apos;t be intimidating. True vocal confidence comes from objective, data-driven practice.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/speech-coach"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Mic size={16} />
                Try Speech Drills
              </Link>
              <Link
                href="/trainer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-200 shadow-sm transition-all"
              >
                <GraduationCap size={16} className="text-indigo-600" />
                Explore Educator Studio
              </Link>
            </div>

            {/* Platform Stats Row (Clean White Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-12 max-w-4xl mx-auto border-t border-indigo-100/80">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">140 WPM</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ideal Pacing Target</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-amber-600">STAR</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interview Framework</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Privacy &amp; Security</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600">₹0 Free</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trainer Hub Setup</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Our Origin & Mission Story ── */}
        <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Story Card */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
                <Target size={13} className="text-indigo-600" /> Our Origin Story
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Why we created Oratii.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                Traditional public speaking and placement coaching is often expensive, subjective, and hard to schedule. Most candidates rely on rewatching painful video recordings or receiving vague advice like &quot;be more confident&quot;.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                We engineered Oratii as an intelligent, non-judgmental lab that operates 24/7. Whether you&apos;re an IELTS student, a job applicant preparing for HR &amp; tech rounds, or an executive delivering a high-stakes pitch, Oratii converts vocal delivery into objective telemetry.
              </p>
              
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-950 text-xs sm:text-sm font-semibold flex items-start gap-3">
                <Zap size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Our Goal:</strong> Eliminate speaking anxiety through real-time feedback on pacing, filler words, WPM telemetry, and structured Q&amp;A defense.
                </span>
              </div>
            </div>

            {/* Right Pillars Box */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Mic size={20} />
                </div>
                <h3 className="text-base font-black text-slate-900">Zero-Judgment Practice Space</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Practice speeches and interview answers privately as many times as you need without fear of mistakes.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-base font-black text-slate-900">Objective Speech Analytics</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Get instant data on Words Per Minute (WPM), filler crutch detection (&quot;um&quot;, &quot;matlab&quot;), and vocal clarity scores.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-base font-black text-slate-900">Empowering Speech Coaches &amp; Colleges</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Partner with educators to automate homework grading, track class performance, and co-brand student scorecards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Oratii Feature Ecosystem ── */}
        <section className="bg-slate-100/70 py-16 sm:py-20 px-4 sm:px-8 border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} className="text-indigo-600" /> Oratii Platform Features
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                An all-in-one speaking &amp; placement lab.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Four specialized engines designed to guide candidates from vocal pacing drills to executive boardrooms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: Speech Coach */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 transform hover:-translate-y-1">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                    <Mic size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Speech Coach</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Live vocal telemetry tracking WPM speed, pause frequency, and filler crutch words (&quot;um&quot;, &quot;like&quot;, &quot;matlab&quot;).
                  </p>
                </div>
                <Link
                  href="/speech-coach"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-600 hover:text-rose-800 transition-colors pt-2 border-t border-slate-100"
                >
                  Launch Speech Coach <ArrowRight size={13} />
                </Link>
              </div>

              {/* Feature 2: Placement & Mock Interview */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 transform hover:-translate-y-1">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                    <Briefcase size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Mock Interview Lab</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    STAR framework evaluation, HR &amp; Technical MNC interview simulations with instant scoring rubrics.
                  </p>
                </div>
                <Link
                  href="/interview"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 hover:text-amber-900 transition-colors pt-2 border-t border-slate-100"
                >
                  Start Mock Interview <ArrowRight size={13} />
                </Link>
              </div>

              {/* Feature 3: Daily Challenge */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 transform hover:-translate-y-1">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                    <Flame size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Daily Challenge &amp; XP</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Gamified 2-minute micro-drills to maintain speaking streaks, earn XP badges, and build daily vocal habits.
                  </p>
                </div>
                <Link
                  href="/challenge"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 hover:text-emerald-800 transition-colors pt-2 border-t border-slate-100"
                >
                  Try Daily Challenge <ArrowRight size={13} />
                </Link>
              </div>

              {/* Feature 4: Trainer Hub */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 transform hover:-translate-y-1">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Trainer Hub</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Free classroom portal for speech coaches &amp; academies to manage student batches and 1-click WhatsApp leaderboards.
                  </p>
                </div>
                <Link
                  href="/trainer"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors pt-2 border-t border-slate-100"
                >
                  Open Educator Studio <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Values & Security Standards (Light Theme Card) ── */}
        <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-white via-indigo-50/40 to-white rounded-3xl p-8 sm:p-12 shadow-xl border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-200/30 blur-3xl rounded-full pointer-events-none" />

            <div className="space-y-8 relative z-10">
              <div className="max-w-2xl space-y-3">
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                  Our Engineering Commitments
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                  Built on Trust, Privacy &amp; Data Security.
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  We treat speaker data with maximum security. Your vocal recordings and text transcripts are handled strictly under automated privacy rules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-indigo-100">
                <div className="bg-white p-5 rounded-2xl border border-indigo-100/80 shadow-2xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Lock size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">100% Privacy Guarantee</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Your vocal recordings and personal practice transcripts are strictly confidential with automated security &amp; data cleanup.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-indigo-100/80 shadow-2xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No Public Data Selling</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    We never sell user speech samples or personal interview data to third-party ad brokers.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-indigo-100/80 shadow-2xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Instant Credit Protection</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    If any network or speech processing error occurs during a drill, your credits are retained automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Bottom Call to Action Banner (Light Theme) ── */}
        <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-black uppercase tracking-wider">
            <Trophy size={14} className="text-amber-600" /> Start Practicing Today
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Ready to find your voice &amp; speak with confidence?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
            Join thousands of candidates, students, and speech coaches who use Oratii to master vocal pacing and interview readiness.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              Get 5 Free Welcome Credits <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-200 shadow-sm transition-all"
            >
              View Credit Plans
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
