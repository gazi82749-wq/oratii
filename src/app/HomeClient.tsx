'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mic, Video, MessageSquare, Briefcase, HelpCircle, Trophy, Flame, ArrowRight, CheckCircle2, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import HeroShowcase from '../components/HeroShowcase';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/Footer'), { ssr: true });

import { FadeUp } from '@/components/ui/FadeUp';
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
    { action: 'Ace your', target: 'presentations & viva.', highlightBg: 'bg-[#FEF7ED] text-[#D98200] border-[#F2A93B]/40' },
    { action: 'Crush your', target: 'voice mock interviews.', highlightBg: 'bg-amber-50 text-amber-800 border-amber-200' },
    { action: 'Eliminate', target: 'filler words & pauses.', highlightBg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { action: 'Master your', target: 'public speaking habits.', highlightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
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
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => {
          if (data?.role) setUserRole(data.role);
        });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => {
          if (data?.role) setUserRole(data.role);
        });
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-slate-900 overflow-x-hidden">
      
      {/* 1. Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl text-[#0F1426]">
            <span className="w-8 h-8 rounded-xl bg-[#0F1426] text-[#F2A93B] flex items-center justify-center font-black text-sm shadow-xs">O</span>
            <span>Oratii</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#0F1426] transition-colors">Product</a>
            <a href="#features" className="hover:text-[#0F1426] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#0F1426] transition-colors">How it works</a>
            <a href="#audience" className="hover:text-[#0F1426] transition-colors">Solutions</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="px-5 py-2.5 bg-[#0F1426] text-white text-sm font-bold rounded-xl hover:bg-[#1A2035] transition-all shadow-xs">
                Dashboard
              </Link>
            ) : (
              <Link href="/speech-coach" className="px-5 py-2.5 bg-[#0F1426] text-white text-sm font-bold rounded-xl hover:bg-[#1A2035] transition-all shadow-xs">
                Try Oratii
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 pt-16 sm:pt-20">

      {/* 2. Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Subtitle */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <FadeUp delay={50}>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-3 block">
                AI Communication Practice
              </span>
            </FadeUp>

            <FadeUp delay={150} className="w-full">
              {/* Mobile View: Clean Static Headline (Zero Layout Shifts or Jumpiness) */}
              <h1 className="block md:hidden text-3xl font-black text-[#0F1426] tracking-tight leading-snug mb-4">
                Say it well. <br />
                Show it <span className="text-[#F2A93B]">better</span>.
              </h1>

              {/* Desktop View: Dynamic Rotating Headline */}
              <h1 className="hidden md:block text-5xl lg:text-6xl font-black text-[#0F1426] tracking-tight leading-[1.15] mb-6 min-h-[160px]">
                Say it well. <br />
                <span className="inline-flex flex-wrap items-center gap-2 transition-all duration-500">
                  <span>{heroPhrases[heroIndex].action}</span>
                  <span className={`px-3.5 py-1 rounded-2xl border text-4xl lg:text-5xl font-black transition-all duration-500 shadow-2xs ${heroPhrases[heroIndex].highlightBg}`}>
                    {heroPhrases[heroIndex].target}
                  </span>
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={200}>
              <p className="text-slate-600 text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-lg mb-8">
                Practice speaking, presentations, interviews and viva sessions with real-time AI feedback.
              </p>
            </FadeUp>

            <FadeUp delay={250} className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
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
          </div>

          {/* Right Column: Hero Product Preview */}
          <div className="lg:col-span-6 w-full">
            <FadeUp delay={350}>
              <HeroShowcase />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 3. Scroll Narrative Transition Section */}
      <section id="scroll-narrative" className="py-20 sm:py-28 bg-white border-y border-slate-100 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-3 block">
              The Oratii Experience
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0F1426] tracking-tight mb-6">
              Practice every part of communication.
            </h2>
            <p className="text-slate-600 text-base sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
              Oratii gives you a dedicated environment to practice how you speak, present, answer and explain.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* 4. Full-Width Alternating Modern Feature Sections (LEFT / RIGHT) */}
      <section id="features" className="py-12 sm:py-20 bg-white relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-24">

          {/* FEATURE 01 — SPEECH COACH (FULL WIDTH - ALIGNED LEFT) */}
          <div id="feature-speech" className="scroll-mt-28 w-full">
            <FadeUp>
              <div className="bg-[#F8FAFC] rounded-3xl sm:rounded-[36px] border border-slate-200/90 p-8 sm:p-12 md:p-16 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden text-left w-full">
                <div className="w-full space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-black uppercase tracking-widest">
                    <span>01</span>
                    <span className="text-slate-300">•</span>
                    <span>Speech Coach</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0F1426] tracking-tight leading-tight max-w-4xl">
                    Find your natural speaking pace.
                  </h2>

                  <p className="text-slate-600 text-lg sm:text-2xl font-medium leading-relaxed max-w-4xl">
                    Oratii listens while you practice and gives you immediate feedback on pacing, filler words and clarity.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 w-full">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> 145 WPM
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Optimal speaking speed indicator and pace target</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm sm:text-base">
                        <CheckCircle2 size={18} /> Filler Word Detection
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Live flags for &quot;basically&quot;, &quot;um&quot;, &quot;like&quot;, &quot;you know&quot;</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Vocal Telemetry
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Real-time clarity score and energy level tracking</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/speech-coach"
                      className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Try Speech Coach <ArrowRight size={18} className="text-[#F2A93B]" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* TRANSITION BRIDGE 1 */}
          <div className="py-2 text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-500 italic">
                &quot;Speaking is only one part of communication.&quot;
              </div>
            </FadeUp>
          </div>

          {/* FEATURE 02 — PRESENTATION PRACTICE (FULL WIDTH - ALIGNED RIGHT) */}
          <div id="feature-presentation" className="scroll-mt-28 w-full">
            <FadeUp>
              <div className="bg-[#F8FAFC] rounded-3xl sm:rounded-[36px] border border-slate-200/90 p-8 sm:p-12 md:p-16 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden text-left md:text-right w-full flex flex-col md:items-end">
                <div className="w-full flex flex-col md:items-end space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-widest">
                    <span>02</span>
                    <span className="text-slate-300">•</span>
                    <span>Presentation Practice</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0F1426] tracking-tight leading-tight max-w-4xl">
                    Present like you&apos;re already confident.
                  </h2>

                  <p className="text-slate-600 text-lg sm:text-2xl font-medium leading-relaxed max-w-4xl">
                    Practice your presentation while Oratii observes your delivery, pacing and presentation behavior.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 w-full text-left">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Slide Canvas HUD
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Real-time slide timing and visual density telemetry</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Webcam PIP Feed
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Live presenter video feed &amp; eye contact analysis</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Slide Density Audit
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Automated pacing and slide transition timing checks</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/presentation"
                      className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Practice Presentation <ArrowRight size={18} className="text-[#F2A93B]" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* TRANSITION BRIDGE 2 */}
          <div className="py-2 text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-500 italic">
                &quot;Now practice the presentation itself.&quot;
              </div>
            </FadeUp>
          </div>

          {/* FEATURE 03 — AI VOICE INTERVIEWER (FULL WIDTH - ALIGNED LEFT) */}
          <div id="feature-interview" className="scroll-mt-28 w-full">
            <FadeUp>
              <div className="bg-[#F8FAFC] rounded-3xl sm:rounded-[36px] border border-slate-200/90 p-8 sm:p-12 md:p-16 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden text-left w-full">
                <div className="w-full space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-widest">
                    <span>03</span>
                    <span className="text-slate-300">•</span>
                    <span>AI Voice Interviewer</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0F1426] tracking-tight leading-tight max-w-4xl">
                    Stop rehearsing predictable answers.
                  </h2>

                  <p className="text-slate-600 text-lg sm:text-2xl font-medium leading-relaxed max-w-4xl">
                    Practice conversations that don&apos;t follow a script. Get tested on unexpected questions and follow-ups.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 w-full">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Dynamic Q&amp;A Probes
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Adaptive behavioral and technical follow-ups</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> STAR Framework
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Situation, Task, Action, Result structure audit</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Specificity Score
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Quantitative impact &amp; technical depth checks</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/interview"
                      className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Start Mock Interview <ArrowRight size={18} className="text-[#F2A93B]" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* TRANSITION BRIDGE 3 */}
          <div className="py-2 text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-500 italic">
                &quot;Then prepare for the unexpected.&quot;
              </div>
            </FadeUp>
          </div>

          {/* FEATURE 04 — VIVA DEFENSE (FULL WIDTH - ALIGNED RIGHT) */}
          <div id="feature-viva" className="scroll-mt-28 w-full">
            <FadeUp>
              <div className="bg-[#F8FAFC] rounded-3xl sm:rounded-[36px] border border-slate-200/90 p-8 sm:p-12 md:p-16 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden text-left md:text-right w-full flex flex-col md:items-end">
                <div className="w-full flex flex-col md:items-end space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-black uppercase tracking-widest">
                    <span>04</span>
                    <span className="text-slate-300">•</span>
                    <span>Viva Defense</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0F1426] tracking-tight leading-tight max-w-4xl">
                    Be ready for the question you didn&apos;t prepare for.
                  </h2>

                  <p className="text-slate-600 text-lg sm:text-2xl font-medium leading-relaxed max-w-4xl">
                    Prepare for academic and technical defense panels where examiners push back on your methods and assumptions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 w-full text-left">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Examiner Push-back
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Academic thesis &amp; technical panel simulation</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Depth &amp; Reasoning
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Methodology defense &amp; architectural rationale scoring</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Defensive Poise
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Vocal composure &amp; defensive clarity evaluation</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/presentation"
                      className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Practice Viva Defense <ArrowRight size={18} className="text-[#F2A93B]" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* FEATURE 05 — 20-DAY CHALLENGE (FULL WIDTH - ALIGNED LEFT) */}
          <div id="feature-challenge" className="scroll-mt-28 w-full">
            <FadeUp>
              <div className="bg-[#F8FAFC] rounded-3xl sm:rounded-[36px] border border-slate-200/90 p-8 sm:p-12 md:p-16 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden text-left w-full">
                <div className="w-full space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-widest">
                    <span>05</span>
                    <span className="text-slate-300">•</span>
                    <span>Habit Building</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0F1426] tracking-tight leading-tight max-w-4xl">
                    Improvement is built one day at a time.
                  </h2>

                  <p className="text-slate-600 text-lg sm:text-2xl font-medium leading-relaxed max-w-4xl">
                    Build a consistent daily speaking habit with targeted practice prompts and streak rewards.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 w-full">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Daily 2-Min Prompts
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Bite-sized daily speaking habits and prompt challenges</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> Streak Rewards
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Level progression, streak badges &amp; +120 XP bonuses</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                        <CheckCircle2 size={18} /> 20-Day Path
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">Structured 20-day communication improvement roadmap</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/challenge"
                      className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Join 20-Day Challenge <ArrowRight size={18} className="text-[#F2A93B]" />
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

        </div>
      </section>

      {/* 5. Transformation Showcase (Before → Feedback → After) */}
      <section className="py-20 sm:py-28 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
              Transformation
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0F1426] tracking-tight mb-16">
              Practice changes more than your score.
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-left">
            {/* Before */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-rose-600 tracking-wider block mb-4">Before Oratii</span>
                <ul className="space-y-4 text-sm font-bold text-slate-700">
                  <li className="flex items-center gap-3 text-rose-700">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs">✕</span>
                    <span>145 WPM (Speeding through slides)</span>
                  </li>
                  <li className="flex items-center gap-3 text-rose-700">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs">✕</span>
                    <span>8 filler words (&quot;basically... um...&quot;)</span>
                  </li>
                  <li className="flex items-center gap-3 text-rose-700">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs">✕</span>
                    <span>Unclear response structure in Q&amp;A</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feedback */}
            <div className="p-8 rounded-3xl bg-[#0F1426] text-white border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-[#F2A93B] tracking-wider block mb-4">Oratii Feedback</span>
                <ul className="space-y-4 text-sm font-semibold text-slate-200">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] flex items-center justify-center font-black text-xs">💡</span>
                    <span>Slow down on slide 3 explanations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] flex items-center justify-center font-black text-xs">💡</span>
                    <span>Pause deliberately instead of filler phrases</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] flex items-center justify-center font-black text-xs">💡</span>
                    <span>Use STAR framework for complex answers</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* After */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider block mb-4">After 3 Sessions</span>
                <ul className="space-y-4 text-sm font-bold text-slate-800">
                  <li className="flex items-center gap-3 text-emerald-700">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">✓</span>
                    <span>128 WPM (Controlled, steady delivery)</span>
                  </li>
                  <li className="flex items-center gap-3 text-emerald-700">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">✓</span>
                    <span>Zero filler word distractions</span>
                  </li>
                  <li className="flex items-center gap-3 text-emerald-700">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">✓</span>
                    <span>Confident explanation under defense pressure</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white border-b border-slate-100 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0F1426] mb-16 tracking-tight">
              How Oratii Works
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {[
              { num: "01", title: "Choose What to Practice", desc: "Select speech coach, viva defense, presentation studio, or interview probes." },
              { num: "02", title: "Practice Out Loud", desc: "Speak into your mic with live webcam telemetry and slide HUD support." },
              { num: "03", title: "Get Real-time Feedback", desc: "See exact WPM, filler word timestamps, structure feedback, and clarity scores." },
              { num: "04", title: "Improve", desc: "Refine your delivery and track your 20-day habit streak." }
            ].map((step, idx) => (
              <FadeUp key={idx} delay={idx * 80}>
                <div className="border-t-2 border-[#0F1426] pt-6">
                  <div className="text-3xl font-black text-[#F2A93B] mb-3">{step.num}</div>
                  <h3 className="text-xl font-extrabold text-[#0F1426] mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Audience Section */}
      <section id="audience" className="py-20 sm:py-28 bg-[#F8FAFC] border-b border-slate-200 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
                Tailored Solutions
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0F1426] tracking-tight">
                Designed for your specific goals.
              </h2>
            </div>
          </FadeUp>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-3 mb-10 overflow-x-auto pb-2">
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
                  className={`px-6 py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-[#0F1426] text-white border-[#0F1426] shadow-md scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#F2A93B]' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Card */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-lg">
            {activeAudienceTab === 'students' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#0F1426]">
                  <GraduationCap size={28} className="text-[#F2A93B]" />
                  <h3 className="text-2xl font-black">For Students &amp; Researchers</h3>
                </div>
                <p className="text-slate-600 text-base font-medium leading-relaxed">
                  Prepare for high-stakes academic evaluations, thesis defenses, class presentations, and competitive placement interviews.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    🎓 Viva &amp; Thesis Defense
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    📊 Class Presentations
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    🚀 Campus Interviews
                  </div>
                </div>
              </div>
            )}

            {activeAudienceTab === 'professionals' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#0F1426]">
                  <Briefcase size={28} className="text-[#F2A93B]" />
                  <h3 className="text-2xl font-black">For Professionals &amp; Leaders</h3>
                </div>
                <p className="text-slate-600 text-base font-medium leading-relaxed">
                  Deliver convincing client presentations, executive board pitch decks, product demos, and crisp meeting updates.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    💼 Executive Pitch Decks
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    🤝 Client Meetings
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    📢 Team Alignment
                  </div>
                </div>
              </div>
            )}

            {activeAudienceTab === 'jobseekers' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#0F1426]">
                  <Trophy size={28} className="text-[#F2A93B]" />
                  <h3 className="text-2xl font-black">For Job Seekers &amp; Candidates</h3>
                </div>
                <p className="text-slate-600 text-base font-medium leading-relaxed">
                  Eliminate hesitation during behavioral HR rounds, technical system architecture deep dives, and self-introductions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    🎯 Behavioral HR Probes
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    ⚡ Technical Deep Dives
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800">
                    ✨ 2-Min Elevator Pitch
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="py-24 sm:py-32 bg-[#0F1426] text-center px-4 sm:px-6 relative overflow-hidden text-white">
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
              Your next presentation starts here.
            </h2>
            <p className="text-slate-300 text-lg sm:text-2xl max-w-xl mx-auto mb-12 font-medium">
              Practice. Get feedback. Improve.
            </p>
            <Link 
              href="/speech-coach"
              className="inline-block px-10 py-5 bg-[#F2A93B] hover:bg-[#d98200] text-[#0F1426] text-lg font-extrabold rounded-2xl transition-all shadow-2xl hover:-translate-y-0.5 cursor-pointer"
            >
              Start practicing
            </Link>
          </FadeUp>
        </div>
      </section>

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
