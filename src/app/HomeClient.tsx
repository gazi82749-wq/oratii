'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mic, Video, MessageSquare, Briefcase, HelpCircle, Trophy, Flame, ArrowRight, CheckCircle2, AlertCircle, Sparkles, GraduationCap, Building2, Share2 } from 'lucide-react';
import HeroShowcase from '../components/HeroShowcase';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/Footer'), { ssr: true });

import { FadeUp, FadeInLeft, FadeInRight } from '@/components/ui/FadeUp';
import ModernBackgroundAnimation from '@/components/ui/ModernBackgroundAnimation';
import EducatorSwitchModal from '../components/EducatorSwitchModal';

export default function HomeClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showEducatorModal, setShowEducatorModal] = useState(false);
  
  // Interactive audience tab switcher
  const [activeAudienceTab, setActiveAudienceTab] = useState<'students' | 'professionals' | 'jobseekers'>('students');

  const heroPhrases = [
    { action: 'Crush your', target: 'voice mock interviews.', highlightBg: 'bg-[#FEF7ED] text-[#D98200] border-[#F2A93B]/40' },
    { action: 'Build your', target: 'daily speech habit.', highlightBg: 'bg-amber-50 text-amber-800 border-amber-200' },
    { action: 'Eliminate', target: 'filler words & pauses.', highlightBg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { action: 'Master your', target: 'public speaking skills.', highlightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then(
          ({ data }) => {
            if (data?.role) setUserRole(data.role);
          },
          () => {}
        );
      }
      setAuthLoading(false);
    }, () => {
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then(
          ({ data }) => {
            if (data?.role) setUserRole(data.role);
          },
          () => {}
        );
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-slate-900 overflow-x-hidden">
      <div className="flex-1">

      {/* 2. Hero Section */}
      <ModernBackgroundAnimation variant="hero" className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Headline & Subtitle */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <FadeUp delay={50}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF7ED] border border-[#F2A93B]/40 text-[#D98200] text-xs font-black uppercase tracking-widest mb-4 shadow-2xs">
                <Sparkles size={14} className="text-[#F2A93B] animate-pulse" />
                <span>AI Communication Practice</span>
              </div>
            </FadeUp>

            <FadeUp delay={150} className="w-full">
              {/* Dynamic Animated Headline for Mobile and Laptop */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-[1.2] mb-6 min-h-[110px] sm:min-h-[160px] text-center lg:text-left">
                Say it well. <br />
                <span key={heroIndex} className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <span>{heroPhrases[heroIndex].action}</span>
                  <span className={`px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl border text-2xl sm:text-4xl lg:text-5xl font-black transition-all duration-500 shadow-2xs ${heroPhrases[heroIndex].highlightBg}`}>
                    {heroPhrases[heroIndex].target}
                  </span>
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={200}>
              <p className="text-slate-600 text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-lg mb-8 text-center lg:text-left">
                Practice speaking, voice mock interviews, and daily speech habits with real-time AI feedback.
              </p>
            </FadeUp>

            <FadeUp delay={250} className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
                <Link 
                  href="/speech-coach"
                  className="w-full sm:w-auto px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Start practicing <ArrowRight size={18} className="text-[#F2A93B] group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={() => {
                    const target = document.getElementById('scroll-narrative');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 font-bold text-base rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  See how it works
                </button>
              </div>
            </FadeUp>

            <FadeUp delay={300}>
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-6 text-xs font-semibold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-time voice &amp; speech feedback</span>
              </div>
            </FadeUp>
          </div>

          {/* Right Column: Hero Product Preview */}
          <div className="hidden lg:block lg:col-span-6 w-full">
            <FadeUp delay={350}>
              <HeroShowcase />
            </FadeUp>
          </div>
        </div>
      </ModernBackgroundAnimation>

      {/* 3. Scroll Narrative Transition Section */}
      <ModernBackgroundAnimation variant="narrative" className="py-12 sm:py-24 border-y border-slate-100">
        <div id="scroll-narrative" className="max-w-4xl mx-auto px-4 sm:px-6 text-center scroll-mt-20">
          <FadeUp>
            <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 sm:mb-3 block">
              The Oratii Experience
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0F1426] tracking-tight mb-4 sm:mb-6">
              Practice every part of communication.
            </h2>
            <p className="text-slate-600 text-sm sm:text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
              Oratii gives you a dedicated environment to practice how you speak, present, answer and explain.
            </p>
          </FadeUp>
        </div>
      </ModernBackgroundAnimation>

      {/* 4. Full-Width Alternating Feature Sections with Animated Background Glows */}
      <section id="features" className="py-8 sm:py-20 bg-white relative scroll-mt-20 overflow-hidden">
        
        {/* Ambient Canvas Animated Glows */}
        <div className="absolute top-1/4 left-[-10%] w-[600px] h-[600px] bg-[#F2A93B]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute top-2/3 right-[-10%] w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-20 relative z-10">

          {/* FEATURE 01 — SPEECH COACH (ANIMATED BG GLOW) */}
          <div id="feature-speech" className="scroll-mt-28 w-full">
            <FadeInLeft>
              <div className="bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-[#F8FAFC] rounded-2xl sm:rounded-[36px] border border-teal-200/80 p-5 sm:p-10 md:p-16 shadow-xs hover:shadow-md transition-all duration-500 relative overflow-hidden text-center md:text-left w-full group">
                {/* Slow pulsing background aura */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/25 rounded-full blur-3xl pointer-events-none animate-float-blob-1" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none animate-float-blob-2" />

                <div className="w-full flex flex-col items-center md:items-start space-y-4 sm:space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-100/80 border border-teal-300 text-teal-900 text-xs font-black uppercase tracking-widest shadow-2xs mx-auto md:mx-0">
                    <span>Speech Coach</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-tight max-w-4xl text-center md:text-left">
                    Find your natural speaking pace.
                  </h2>

                  <p className="text-slate-700 text-sm sm:text-lg md:text-2xl font-medium leading-relaxed max-w-4xl text-center md:text-left">
                    Oratii listens while you practice and gives you immediate feedback on pacing, filler words and clarity.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4 w-full text-left">
                    <FadeUp delay={100}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-teal-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-teal-700 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-teal-600 sm:w-4 sm:h-4" /> 145 WPM
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">Optimal speaking speed indicator and pace target</p>
                      </div>
                    </FadeUp>

                    <FadeUp delay={200}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-teal-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-teal-700 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-teal-600 sm:w-4 sm:h-4" /> Filler Word Detection
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">Live flags for &quot;basically&quot;, &quot;um&quot;, &quot;like&quot;, &quot;you know&quot;</p>
                      </div>
                    </FadeUp>

                    <FadeUp delay={300}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-teal-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-teal-700 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-teal-600 sm:w-4 sm:h-4" /> Vocal Telemetry
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">Real-time clarity score and energy level tracking</p>
                      </div>
                    </FadeUp>
                  </div>

                  <div className="pt-2 sm:pt-4 w-full sm:w-auto flex justify-center md:justify-start">
                    <Link
                      href="/speech-coach"
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-sm group-hover:scale-[1.02]"
                    >
                      Try Speech Coach <ArrowRight size={18} className="text-[#F2A93B]" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeInLeft>
          </div>

          {/* TRANSITION BRIDGE 1 */}
          <div className="py-1 text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-slate-100 border border-slate-200 text-[11px] sm:text-xs font-extrabold text-slate-500 italic">
                &quot;Speaking is only one part of communication.&quot;
              </div>
            </FadeUp>
          </div>

{/* FEATURE 03 — AI VOICE INTERVIEWER (ANIMATED BG GLOW) */}
          <div id="feature-interview" className="scroll-mt-28 w-full">
            <FadeInRight>
              <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-[#F8FAFC] rounded-2xl sm:rounded-[36px] border border-indigo-200/80 p-5 sm:p-10 md:p-16 shadow-xs hover:shadow-md transition-all duration-500 relative overflow-hidden text-center md:text-right w-full flex flex-col items-center md:items-end group">
                {/* Slow pulsing background aura */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-400/25 rounded-full blur-3xl pointer-events-none animate-float-blob-3" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none animate-float-blob-1" />

                <div className="w-full flex flex-col items-center md:items-end space-y-4 sm:space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100/90 border border-indigo-300 text-indigo-950 text-xs font-black uppercase tracking-widest shadow-2xs mx-auto md:ml-auto md:mr-0">
                    <span>3-Round Mock Interview Campaign</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-tight max-w-4xl text-center md:text-right">
                    Master placement drives in 3 sequential rounds.
                  </h2>

                  <p className="text-slate-700 text-sm sm:text-lg md:text-2xl font-medium leading-relaxed max-w-4xl text-center md:text-right">
                    Standard HR Warmup &rarr; Technical Panel Deep-Dive &rarr; STAR Method Behavioral Probe. Complete with 40-minute prep breaks &amp; weakness feedback.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4 w-full text-left">
                    <FadeUp delay={100}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-indigo-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-indigo-600 sm:w-4 sm:h-4" /> 3 Sequential Rounds
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">HR Warmup ➔ Tech Panel ➔ STAR Method</p>
                      </div>
                    </FadeUp>

                    <FadeUp delay={200}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-indigo-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-indigo-600 sm:w-4 sm:h-4" /> 40-Min Prep Break Clock
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">Weakness-based revision guides &amp; reminders</p>
                      </div>
                    </FadeUp>

                    <FadeUp delay={300}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-indigo-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-indigo-800 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-indigo-600 sm:w-4 sm:h-4" /> 5 Questions Per Round
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">Deep AI feedback &amp; benchmark answers</p>
                      </div>
                    </FadeUp>
                  </div>

                  <div className="pt-2 sm:pt-4 w-full sm:w-auto flex justify-center md:justify-end">
                    <Link
                      href="/interview"
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-sm group-hover:scale-[1.02]"
                    >
                      Start Mock Interview <ArrowRight size={18} className="text-[#F2A93B]" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeInRight>
          </div>

          {/* TRANSITION BRIDGE 2 */}
          <div className="py-1 text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-slate-100 border border-slate-200 text-[11px] sm:text-xs font-extrabold text-slate-500 italic">
                &quot;Improvement is built one day at a time.&quot;
              </div>
            </FadeUp>
          </div>

{/* FEATURE 04 — Daily Challenge (ANIMATED BG GLOW) */}
          <div id="feature-challenge" className="scroll-mt-28 w-full">
            <FadeInLeft>
              <div className="bg-gradient-to-bl from-emerald-50/80 via-teal-50/40 to-[#F8FAFC] rounded-2xl sm:rounded-[36px] border border-emerald-200/80 p-5 sm:p-10 md:p-16 shadow-xs hover:shadow-md transition-all duration-500 relative overflow-hidden text-center md:text-left w-full group">
                {/* Slow pulsing background aura */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none animate-float-blob-1" />
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none animate-float-blob-3" />

                <div className="w-full flex flex-col items-center md:items-start space-y-4 sm:space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-black uppercase tracking-widest shadow-2xs mx-auto md:mx-0">
                    <span>Habit Building</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-tight max-w-4xl text-center md:text-left">
                    Speak Every Day.
                  </h2>

                  <p className="text-slate-700 text-sm sm:text-lg md:text-2xl font-medium leading-relaxed max-w-4xl text-center md:text-left">
                    Build a simple daily habit to improve your confidence. No heavy drills, just a new simple prompt every day.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4 w-full text-left">
                    <FadeUp delay={100}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-emerald-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-emerald-600 sm:w-4 sm:h-4" /> Simple Prompts
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">Basic, low-pressure prompts like describing nature or yourself.</p>
                      </div>
                    </FadeUp>

                    <FadeUp delay={200}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-emerald-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-emerald-600 sm:w-4 sm:h-4" /> Streak Tracking
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">Watch your daily active streak grow with consistency.</p>
                      </div>
                    </FadeUp>

                    <FadeUp delay={300}>
                      <div className="p-3.5 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-xs border border-emerald-200/70 shadow-2xs space-y-1 sm:space-y-1.5 h-full">
                        <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm sm:text-base">
                          <CheckCircle2 size={16} className="text-emerald-600 sm:w-4 sm:h-4" /> Just 60 Seconds
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">Only takes a minute each day to start building your confidence.</p>
                      </div>
                    </FadeUp>
                  </div>

                  <div className="pt-2 sm:pt-4 w-full sm:w-auto flex justify-center md:justify-start">
                    <Link
                      href="/challenge"
                      className="inline-flex items-center justify-center w-full sm:w-auto gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-sm sm:text-base rounded-xl transition-all cursor-pointer shadow-sm group-hover:scale-[1.02]"
                    >
                      Join Daily Challenge <ArrowRight size={18} className="text-[#F2A93B]" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeInLeft>
          </div>

          {/* TRANSITION BRIDGE 3 */}
          <div className="py-1 text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-slate-100 border border-slate-200 text-[11px] sm:text-xs font-extrabold text-slate-500 italic">
                &quot;Finally, speak like you&apos;re already confident.&quot;
              </div>
            </FadeUp>
          </div>

        </div>
      </section>

      {/* 5. Transformation Showcase (Before → Feedback → After) */}
      <section className="py-12 sm:py-28 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
              Transformation
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0F1426] tracking-tight mb-8 sm:mb-16">
              Practice changes more than your score.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch text-left">
            {/* Before */}
            <FadeUp delay={100}>
              <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between h-full">
                <div>
                  <span className="text-xs font-extrabold uppercase text-rose-600 tracking-wider block mb-3 sm:mb-4">Before Oratii</span>
                  <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-700">
                    <li className="flex items-center gap-2.5 sm:gap-3 text-rose-700">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0">✕</span>
                      <span>145 WPM (Speaking too fast when nervous)</span>
                    </li>
                    <li className="flex items-center gap-2.5 sm:gap-3 text-rose-700">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0">✕</span>
                      <span>8 filler words (&quot;basically... um...&quot;)</span>
                    </li>
                    <li className="flex items-center gap-2.5 sm:gap-3 text-rose-700">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0">✕</span>
                      <span>Unclear response structure in interviews</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeUp>

            {/* Feedback */}
            <FadeUp delay={200}>
              <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0F1426] text-white border border-slate-800 shadow-xl flex flex-col justify-between h-full">
                <div>
                  <span className="text-xs font-extrabold uppercase text-[#F2A93B] tracking-wider block mb-3 sm:mb-4">Oratii Feedback</span>
                  <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-semibold text-slate-200">
                    <li className="flex items-center gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] flex items-center justify-center font-black text-xs shrink-0">💡</span>
                      <span>Slow down &amp; pace key explanations</span>
                    </li>
                    <li className="flex items-center gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] flex items-center justify-center font-black text-xs shrink-0">💡</span>
                      <span>Pause deliberately instead of filler phrases</span>
                    </li>
                    <li className="flex items-center gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] flex items-center justify-center font-black text-xs shrink-0">💡</span>
                      <span>Use STAR framework for complex answers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeUp>

            {/* After */}
            <FadeUp delay={300}>
              <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between h-full">
                <div>
                  <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider block mb-3 sm:mb-4">After 3 Sessions</span>
                  <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-800">
                    <li className="flex items-center gap-2.5 sm:gap-3 text-emerald-700">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">✓</span>
                      <span>128 WPM (Controlled, steady delivery)</span>
                    </li>
                    <li className="flex items-center gap-2.5 sm:gap-3 text-emerald-700">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">✓</span>
                      <span>Zero filler word distractions</span>
                    </li>
                    <li className="flex items-center gap-2.5 sm:gap-3 text-emerald-700">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">✓</span>
                      <span>Confident, structured answers under pressure</span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <section id="how-it-works" className="py-12 sm:py-28 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0F1426] mb-8 sm:mb-16 tracking-tight">
              How Oratii Works
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left">
            {[
              { num: "01", title: "Choose What to Practice", desc: "Select speech coach, voice mock interviews, or daily habit challenges." },
              { num: "02", title: "Practice Out Loud", desc: "Speak into your mic with real-time AI voice feedback and structure telemetry." },
              { num: "03", title: "Get Real-time Feedback", desc: "See exact WPM, filler word timestamps, structure feedback, and clarity scores." },
              { num: "04", title: "Improve", desc: "Refine your delivery and track your Daily habit streak." }
            ].map((step, idx) => (
              <FadeUp key={idx} delay={idx * 100}>
                <div className="border-t-2 border-[#0F1426] pt-4 sm:pt-6">
                  <div className="text-2xl sm:text-3xl font-black text-[#F2A93B] mb-2 sm:mb-3">{step.num}</div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0F1426] mb-1.5 sm:mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Audience Section */}
      <section id="audience" className="py-12 sm:py-28 bg-[#F8FAFC] border-b border-slate-200 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
                Tailored Solutions
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0F1426] tracking-tight">
                Designed for your specific goals.
              </h2>
            </div>
          </FadeUp>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-10 overflow-x-auto pb-2">
            {[
              { id: 'students', label: 'Students', icon: GraduationCap },
              { id: 'professionals', label: 'Professionals', icon: Briefcase },
              { id: 'jobseekers', label: 'Job Seekers', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeAudienceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAudienceTab(tab.id as any)}
                  className={`px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer border shrink-0 ${
                    isActive
                      ? 'bg-[#0F1426] text-white border-[#0F1426] shadow-md scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#F2A93B]' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Card */}
          <FadeUp key={activeAudienceTab}>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-10 shadow-lg">
              {activeAudienceTab === 'students' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 text-[#0F1426]">
                    <GraduationCap size={24} className="text-[#F2A93B] sm:w-7 sm:h-7" />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black">For Students &amp; Researchers</h3>
                      <p className="text-slate-500 text-xs font-semibold">Tailored practice for academic success, exams &amp; campus placements.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                    {/* Card 1 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-teal-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">🎓</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/80 border border-teal-300 px-2 py-0.5 rounded-full">
                            Speech Coach
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">Oral Exams &amp; Speeches</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Master your speaking pace, tone, and vocal clarity under exam pressure.
                        </p>
                      </div>
                      <Link 
                        href="/speech-coach"
                        className="mt-4 text-xs font-extrabold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Try Speech Coach <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Card 2 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-indigo-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">🚀</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 bg-indigo-100/80 border border-indigo-300 px-2 py-0.5 rounded-full">
                            Voice Interviewer
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">Campus Placements</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Rehearse structured responses for technical &amp; campus HR interview rounds.
                        </p>
                      </div>
                      <Link 
                        href="/interview"
                        className="mt-4 text-xs font-extrabold text-indigo-800 hover:text-indigo-950 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Start Mock Interview <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Card 3 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-emerald-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">🔥</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                            Daily Habit
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">Daily Speech Practice</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Build daily confidence with low-pressure 60-second prompts.
                        </p>
                      </div>
                      <Link 
                        href="/challenge"
                        className="mt-4 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Join Daily Challenge <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeAudienceTab === 'professionals' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 text-[#0F1426]">
                    <Briefcase size={24} className="text-[#F2A93B] sm:w-7 sm:h-7" />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black">For Professionals &amp; Leaders</h3>
                      <p className="text-slate-500 text-xs font-semibold">Clear, executive communication for high-impact meetings &amp; pitches.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                    {/* Card 1 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-teal-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">💼</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/80 border border-teal-300 px-2 py-0.5 rounded-full">
                            Speech Coach
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">Executive Speeches</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Eliminate filler words and keep pace steady at 130-150 WPM.
                        </p>
                      </div>
                      <Link 
                        href="/speech-coach"
                        className="mt-4 text-xs font-extrabold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Practice Pitch <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Card 2 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-indigo-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">🤝</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 bg-indigo-100/80 border border-indigo-300 px-2 py-0.5 rounded-full">
                            Voice Interviewer
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">Client &amp; Board Q&amp;A</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Rehearse handling unexpected questions and executive pushback.
                        </p>
                      </div>
                      <Link 
                        href="/interview"
                        className="mt-4 text-xs font-extrabold text-indigo-800 hover:text-indigo-950 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Practice Q&amp;A Probes <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Card 3 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-emerald-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">📢</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                            Daily Habit
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">Team Alignment Drills</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Maintain daily vocal clarity with quick 1-minute speech exercises.
                        </p>
                      </div>
                      <Link 
                        href="/challenge"
                        className="mt-4 text-xs font-extrabold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Daily Warmup <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeAudienceTab === 'jobseekers' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 text-[#0F1426]">
                    <Trophy size={24} className="text-[#F2A93B] sm:w-7 sm:h-7" />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black">For Job Seekers &amp; Candidates</h3>
                      <p className="text-slate-500 text-xs font-semibold">Acknowledge interview pressure with realistic AI voice mock practice.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                    {/* Card 1 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-indigo-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">🎯</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 bg-indigo-100/80 border border-indigo-300 px-2 py-0.5 rounded-full">
                            Voice Interviewer
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">Behavioral HR Probes</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Audit your response structure using the STAR method with score telemetry.
                        </p>
                      </div>
                      <Link 
                        href="/interview"
                        className="mt-4 text-xs font-extrabold text-indigo-800 hover:text-indigo-950 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Start HR Mock <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Card 2 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-indigo-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">⚡</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 bg-indigo-100/80 border border-indigo-300 px-2 py-0.5 rounded-full">
                            Voice Interviewer
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">Technical Deep Dives</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Practice detailed architecture &amp; technical explanations fluently.
                        </p>
                      </div>
                      <Link 
                        href="/interview"
                        className="mt-4 text-xs font-extrabold text-indigo-800 hover:text-indigo-950 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Start Tech Mock <ArrowRight size={13} />
                      </Link>
                    </div>

                    {/* Card 3 */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-teal-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base">✨</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/80 border border-teal-300 px-2 py-0.5 rounded-full">
                            Speech Coach
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0F1426]">2-Min Elevator Pitch</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Perfect your self-introduction with live WPM &amp; filler word tracking.
                        </p>
                      </div>
                      <Link 
                        href="/speech-coach"
                        className="mt-4 text-xs font-extrabold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        Practice Pitch <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 7.5. Trainer & Educator Studio Section (Only for Trainer / Admin signups) */}
      {(userRole === 'trainer' || userRole === 'admin') && (
        <section id="trainer-portal" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#0F1426] text-white relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <FadeUp>
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-[#F2A93B]/30 text-[#F2A93B] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
                <GraduationCap size={15} />
                <span>Oratii For Academies &amp; Trainers</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.2] mb-4">
                Empower Your Speech &amp; Placement Classroom
              </h2>
              <p className="text-slate-300 text-sm sm:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                Create student batches, assign AI-scored presentation &amp; interview homework, and generate 1-click WhatsApp leaderboards in seconds.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: 4 Feature Highlights */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feature 1 */}
              <FadeUp delay={100}>
                <div className="p-6 rounded-3xl bg-[#151930] border border-indigo-900/40 hover:border-amber-500/40 transition-all space-y-3 h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#F2A93B] flex items-center justify-center font-bold">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5">6-Digit WhatsApp Batch Codes</h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Generate unique invite codes (e.g. <span className="text-[#F2A93B] font-mono font-bold">OXFD26</span>). Students join directly via WhatsApp link with zero app downloads.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400/90 inline-flex items-center gap-1">
                    Instant class onboarding <CheckCircle2 size={13} />
                  </span>
                </div>
              </FadeUp>

              {/* Feature 2 */}
              <FadeUp delay={150}>
                <div className="p-6 rounded-3xl bg-[#151930] border border-indigo-900/40 hover:border-teal-500/40 transition-all space-y-3 h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                    <Mic size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5">Automated Homework Grading</h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      AI audits student speaking rate (WPM), filler word count, pause cadence, and argument structure automatically.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-teal-400 inline-flex items-center gap-1">
                    Saves 5+ hours per batch <CheckCircle2 size={13} />
                  </span>
                </div>
              </FadeUp>

              {/* Feature 3 */}
              <FadeUp delay={200}>
                <div className="p-6 rounded-3xl bg-[#151930] border border-indigo-900/40 hover:border-emerald-500/40 transition-all space-y-3 h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5">1-Click WhatsApp Leaderboards</h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Export beautifully formatted emoji rank cards ready to drop directly into student WhatsApp class groups.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 inline-flex items-center gap-1">
                    Drives 3x student practice <CheckCircle2 size={13} />
                  </span>
                </div>
              </FadeUp>

              {/* Feature 4 */}
              <FadeUp delay={250}>
                <div className="p-6 rounded-3xl bg-[#151930] border border-indigo-900/40 hover:border-amber-500/40 transition-all space-y-3 h-full flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#F2A93B] flex items-center justify-center font-bold">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5">Co-Branded Academy Hub</h3>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Your institute’s name &amp; city displayed prominently on student drill screens and completion scorecards.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400/90 inline-flex items-center gap-1">
                    Free partner status (₹0) <CheckCircle2 size={13} />
                  </span>
                </div>
              </FadeUp>
            </div>

            {/* Right Column: Interactive Academy Hub Preview */}
            <div className="lg:col-span-5">
              <FadeUp delay={200}>
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#181D38] to-[#12162B] border border-indigo-800/50 shadow-2xl space-y-6 relative overflow-hidden">
                  {/* Subtle Accent Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-2xl rounded-full pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#F2A93B] text-[#0F1426] font-black flex items-center justify-center text-lg shadow-md">
                        O
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">Oxford Speech Academy</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Live Hub</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">📍 Bengaluru · 3 Active Batches</p>
                      </div>
                    </div>
                  </div>

                  {/* Batch Card Simulation */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white">Batch Alpha (Evening)</span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-amber-400/20 text-[#F2A93B] font-bold">
                        CODE: OXFD26
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="p-2 rounded-xl bg-black/20">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Students</p>
                        <p className="text-sm font-extrabold text-white mt-0.5">42</p>
                      </div>
                      <div className="p-2 rounded-xl bg-black/20">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Submissions</p>
                        <p className="text-sm font-extrabold text-emerald-400 mt-0.5">94%</p>
                      </div>
                      <div className="p-2 rounded-xl bg-black/20">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Score</p>
                        <p className="text-sm font-extrabold text-[#F2A93B] mt-0.5">86/100</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0F1426]/70 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                      <span className="truncate">🏆 1st: Aryan K. (92% · 136 WPM)</span>
                      <span className="text-[10px] text-emerald-400 font-bold shrink-0">Ready to Share</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2.5 pt-2">
                    {userRole === 'trainer' || userRole === 'admin' ? (
                      <Link
                        href="/trainer"
                        className="w-full py-3.5 px-5 bg-gradient-to-r from-[#F2A93B] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        Enter Trainer Portal <ArrowRight size={15} />
                      </Link>
                    ) : user ? (
                      <button
                        onClick={() => setShowEducatorModal(true)}
                        className="w-full py-3.5 px-5 bg-gradient-to-r from-[#F2A93B] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        Activate Educator Studio (₹0 Free) <ArrowRight size={15} />
                      </button>
                    ) : (
                      <Link
                        href="/signup?role=trainer"
                        className="w-full py-3.5 px-5 bg-gradient-to-r from-[#F2A93B] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        Get Started as a Trainer (₹0 Free) <ArrowRight size={15} />
                      </Link>
                    )}

                    <p className="text-[11px] text-center text-slate-400 font-medium">
                      Zero setup fees · Instant 6-digit WhatsApp class access · For coaches &amp; colleges
                    </p>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 8. Final CTA Section */}
      <ModernBackgroundAnimation variant="cta" className="py-16 sm:py-32 text-center px-4 sm:px-6 text-white">
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight">
              Your speech coaching starts here.
            </h2>
            <p className="text-slate-300 text-base sm:text-2xl max-w-xl mx-auto mb-8 sm:mb-12 font-medium">
              Practice drills. Get instant AI feedback. Improve.
            </p>
            <Link 
              href="/speech-coach"
              className="inline-block px-8 py-4 sm:px-10 sm:py-5 bg-[#F2A93B] hover:bg-[#d98200] text-[#0F1426] text-base sm:text-lg font-extrabold rounded-2xl transition-all shadow-2xl hover:-translate-y-0.5 cursor-pointer"
            >
              Start practicing
            </Link>
          </FadeUp>
        </div>
      </ModernBackgroundAnimation>

      </div>

      <Footer />

      {/* Educator Modal */}
      <EducatorSwitchModal
        isOpen={showEducatorModal}
        onClose={() => setShowEducatorModal(false)}
        userId={user?.id}
      />
    </div>
  );
}
