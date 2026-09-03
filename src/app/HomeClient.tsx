'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mic, FileText, Video, MessageSquare, Timer, Target, BarChart as BarChartIcon, Zap, CheckCircle2, Flame, ArrowRight, AlertTriangle, Trophy, GraduationCap, Briefcase, BarChart3 } from 'lucide-react';
import StreakBadge from '../components/StreakBadge';
import HeroShowcase from '../components/HeroShowcase';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/Footer'), { ssr: true });

import { FadeUp, useInViewAnim } from '@/components/ui/FadeUp';
import SpeechCoachMockup from '@/components/home/SpeechCoachMockup';
import SlideAnalyzerMockup from '@/components/home/SlideAnalyzerMockup';
import VivaDefenseMockup from '@/components/home/VivaDefenseMockup';
import ChallengeMockup from '@/components/home/ChallengeMockup';


export default function HomeClient() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features: Array<{
    title: string;
    subtitle?: string;
    headline: string;
    desc: string;
    highlights: string[];
    icon: any;
    iconBg: string;
    href: string;
    cta: string;
  }> = [
    {
      title: 'Speech Delivery Coach',
      headline: 'Analyze vocal pacing & filler words.',
      desc: 'Record live speech or audio clips for instant AI vocal pacing (WPM), filler word detection, tone analysis, and automated rewrites.',
      highlights: ['Live WPM & Pause Meter', 'Filler Word Detection', 'AI Speech Rewrites'],
      icon: <Mic size={28} className="text-rose-500" />,
      iconBg: 'bg-rose-50 border-rose-100',
      href: '/speech-coach',
      cta: 'Explore Speech Coach'
    },
    {
      title: 'AI Voice Mock Interviewer',
      headline: 'Unscripted tech & behavioral interviews.',
      desc: 'Upload your Resume PDF or question paper into an interactive voice window. Experience realistic 4-round technical discussions & STAR method scoring.',
      highlights: ['📄 Resume PDF & Role Upload', '🎙️ Interactive Voice AI Interface', '⭐ STAR Method & Tech Scoring'],
      icon: <Briefcase size={28} className="text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      href: '/interview',
      cta: 'Start Voice Mock Interview'
    },
    {
      title: 'Slide Deck & Viva Studio',
      subtitle: 'Audit Slide Deck ➔ Rehearse Live ➔ In-built Viva Defense',
      headline: 'Audit slides, rehearse live with webcam, and defend.',
      desc: 'Upload PPTX/PDF slides for instant visual clarity audits. Rehearse live with zero-latency Edge WASM HUD and challenge yourself with in-built academic viva defense.',
      highlights: [
        'Step 1: AI Slide Density & Readability Audit',
        'Step 2: Live Webcam Rehearsal Studio with WASM HUD',
        'Step 3: In-built Academic Viva Defense'
      ],
      icon: <Video size={28} className="text-[#1B2140]" />,
      iconBg: 'bg-indigo-50 border-indigo-200',
      href: '/presentation',
      cta: 'Launch Presentation & Viva Studio'
    },
    {
      title: '20-Day Speech Challenge',
      headline: 'Build a daily speaking habit.',
      desc: 'Transform your public speaking confidence in 20 days. Complete daily targeted practice prompts, track streaks, and earn downloadable certificates.',
      highlights: ['Daily Speaking Prompts', 'Streak Tracking & XP Badges', 'PDF Completion Certificate'],
      icon: <Trophy size={28} className="text-[#D98200]" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      href: '/challenge',
      cta: 'Join 20-Day Challenge'
    }
  ];

  const metrics = [
    { value: 'Pacing Analysis', label: 'We track your Words Per Minute (WPM) to ensure you speak steadily under pressure.', icon: <Timer size={24} /> },
    { value: 'Filler Word Detection', label: 'Identifies "ums", "ahs", and conversational crutches so you can speak with authority.', icon: <Target size={24} /> },
    { value: 'Content Density', label: 'Analyzes slide text-to-space ratios to prevent cognitive overload for your audience.', icon: <BarChartIcon size={24} /> },
    { value: 'Delivery Confidence', label: 'Measures vocal variance and energy to ensure your message is delivered with impact.', icon: <Zap size={24} /> }
  ];

  const cardStyles = [
    { num: '01', gradient: 'from-rose-500 via-pink-600 to-rose-700', glow: 'rgba(244,63,94,0.14)', hoverGlow: 'rgba(244,63,94,0.25)', ctaClasses: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-[0_12px_28px_-6px_rgba(244,63,94,0.4)]' },
    { num: '02', gradient: 'from-amber-500 via-orange-600 to-amber-700', glow: 'rgba(245,158,11,0.14)', hoverGlow: 'rgba(245,158,11,0.25)', ctaClasses: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_12px_28px_-6px_rgba(245,158,11,0.4)]' },
    { num: '03', gradient: 'from-sky-500 via-blue-600 to-sky-700', glow: 'rgba(14,165,233,0.14)', hoverGlow: 'rgba(14,165,233,0.25)', ctaClasses: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_12px_28px_-6px_rgba(14,165,233,0.4)]' },
    { num: '04', gradient: 'from-indigo-600 via-purple-600 to-indigo-800', glow: 'rgba(99,102,241,0.14)', hoverGlow: 'rgba(99,102,241,0.25)', ctaClasses: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_12px_28px_-6px_rgba(99,102,241,0.4)]' },
    { num: '05', gradient: 'from-emerald-500 via-teal-600 to-emerald-700', glow: 'rgba(16,185,129,0.18)', hoverGlow: 'rgba(16,185,129,0.3)', ctaClasses: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_12px_28px_-6px_rgba(16,185,129,0.5)]' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-slate-900 overflow-x-hidden">
      
      <div className="flex-1">

      {/* Hero Section — Screen view viewport centered */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center pt-20 sm:pt-24 lg:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 overflow-hidden bg-[#F8FAFC]">
        {/* Modern Animated Soft Mesh Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-300/20 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] bg-amber-200/20 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-purple-200/15 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>

        <div className="w-full max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-10 min-w-0 max-w-full my-auto">
          
          {/* Left Column: Text & CTAs */}
          <div className="w-full text-center md:text-left flex flex-col items-center md:items-start min-w-0 max-w-full">
          <FadeUp delay={50}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-[#151930] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 shimmer-badge shadow-xs">
              <span className="text-sm sm:text-base">✦</span> AI-Powered Coaching Platform
            </div>
          </FadeUp>

          <FadeUp delay={150}>
            <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] lg:text-6xl leading-[1.15] font-black tracking-tight text-slate-900 mb-4 pb-1 break-words break-normal max-w-full">
              Master your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">public speaking</span><br className="hidden sm:block" />
              & job interviews with AI.
            </h1>
          </FadeUp>

          <FadeUp delay={200}>
            <p className="text-slate-500 text-base sm:text-lg md:text-xl max-w-xl mx-auto md:mx-0 mb-6 leading-relaxed font-normal">
              Get real-time AI feedback on your vocal pacing, presentation slides, and job interview delivery.
            </p>
          </FadeUp>

          <FadeUp delay={250} className="w-full sm:w-auto">
            {/* Hero Launch Badge — Desktop only to prevent stacking on mobile */}
            <div className="hidden sm:flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-[#151930] text-xs font-bold tracking-wide uppercase shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-[#1B2140] animate-pulse"></span>
                <span>✨ AI-Powered Speech & Presentation Coach</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start w-full sm:w-auto">
              {user ? (
                <Link 
                  href="/speech-coach"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base font-bold rounded-full shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.8)] hover:-translate-y-1 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 min-h-[52px] group"
                >
                  Launch Speech Coach <ArrowRight size={18} className="text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              ) : (
                <Link 
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base font-bold rounded-full shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.8)] hover:-translate-y-1 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 min-h-[52px] group"
                >
                  Start Free Speech Analysis <ArrowRight size={18} className="text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              )}
              
              <a 
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white/70 backdrop-blur-md text-slate-700 text-base font-bold border border-slate-200/80 rounded-full hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px]"
              >
                See How It Works
              </a>
            </div>
            <p className="mt-3.5 text-[11px] sm:text-xs font-medium text-slate-400 text-center md:text-left">
              ⚡ No credit card required • Free plan includes 5 speech analyses per month
            </p>

            {/* Mobile-Only Sleek Value Banner (Clean alternative to heavy animations on mobile) */}
            <div className="flex lg:hidden flex-wrap items-center justify-center md:justify-start gap-2 mt-5 px-3.5 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1"><span className="text-amber-500">⚡</span> Sub-Second AI Latency</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1"><span className="text-emerald-500">🔒</span> 100% On-Device Privacy</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1"><span className="text-indigo-500">⭐</span> STAR Method Scoring</span>
            </div>
          </FadeUp>

          </div>

          {/* Right Column: Hero Showcase (Hidden on small mobile screens to prevent vertical clutter & scrolling lag) */}
          <div className="hidden lg:block w-full relative min-w-0 max-w-full">
            <FadeUp delay={350} className="w-full">
              <HeroShowcase />
            </FadeUp>
          </div>
        </div>
      </section>


      {/* Metrics / How We Analyze */}
      <section className="py-14 sm:py-20 relative z-20 -mt-8 sm:-mt-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 tracking-tight">Track your progress easily.</h2>
            <p className="text-slate-500 text-lg">Get simple, actionable feedback on how you speak and present.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {metrics.map((m, i) => {
              const styles = [
                { bg: 'bg-[#E3F4F4]', tagBg: 'bg-[#CBE4E4]', tags: ['WPM Tracking', 'Cadence', 'Live Speed'] },
                { bg: 'bg-[#FFE6D5]', tagBg: 'bg-[#FFD4B8]', tags: ['Ums & Ahs', 'Clarity', 'Crutch Words'] },
                { bg: 'bg-[#EAE0F5]', tagBg: 'bg-[#D6C4E8]', tags: ['Readability', 'Text Ratio', 'Cognitive Load'] },
                { bg: 'bg-[#D6F0E0]', tagBg: 'bg-[#BCE6CB]', tags: ['Vocal Energy', 'Impact', 'Variance'] }
              ][i];

              return (
                <FadeUp key={i} delay={i * 100} className="h-full">
                  <div className="group h-full bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/60 shadow-[0_20px_40px_-10px_rgba(99,102,241,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col p-2 ring-1 ring-inset ring-white/50 cursor-pointer">
                    
                    {/* Colored Inner Block */}
                    <div className={`rounded-[24px] p-6 sm:p-8 flex-1 flex flex-col shadow-inner ${styles.bg}`}>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{m.value}</h3>
                      <p className="text-slate-800 text-sm leading-relaxed mb-8">{m.label}</p>
                      
                      {/* Tags Area */}
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {styles.tags.map((tag, idx) => (
                          <span key={idx} className={`px-3 py-1.5 text-[11px] font-bold text-slate-900 rounded-full ${styles.tagBg}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* Unified Features Section */}
      <section className="py-16 sm:py-20 relative overflow-hidden bg-[#F8FAFC]">
        {/* Modern Animated Soft Mesh Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-300/20 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-300/20 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[20%] w-[70vw] h-[40vw] bg-purple-300/15 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col relative z-10">
          
          {/* Premium Section Header */}
          <FadeUp>
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest mb-5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse"></span> Complete 4-Module Suite
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight mb-4 leading-tight">
                Everything you need to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">master</span> public speaking.
              </h2>
              <p className="text-slate-500 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
                Four specialized AI engines designed to transform raw speeches into executive-level delivery.
              </p>

              {/* Module Quick Nav Tab Bar */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-sm max-w-2xl mx-auto">
                {features.map((item, idx) => {
                  const style = cardStyles[idx % cardStyles.length];
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const el = document.getElementById(`module-card-${idx}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${style?.gradient || 'from-indigo-500 to-purple-500'}`}></span>
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </FadeUp>

          <div className="flex flex-col gap-10 sm:gap-14 lg:gap-16">
          {features.map((f, i) => {
            const isReversed = i % 2 !== 0;
            const cs = cardStyles[i % cardStyles.length] || cardStyles[0];
            return (
              <FadeUp key={i} delay={i * 80}>
              <div id={`module-card-${i}`} className="relative group">
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-10 lg:gap-16 bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-10 lg:p-14 border border-slate-100/80 transition-all duration-500 overflow-hidden relative"
                  style={{ isolation: 'isolate', boxShadow: `0 25px 60px -15px ${cs.glow}, 0 0 0 1px rgba(0,0,0,0.03)` }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 35px 80px -15px ${cs.hoverGlow}, 0 0 0 1px rgba(0,0,0,0.04)`}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 25px 60px -15px ${cs.glow}, 0 0 0 1px rgba(0,0,0,0.03)`}
                >
                  {/* Accent gradient stripe at top */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${cs.gradient}`} />
                
                {/* Result Card View (Hidden on mobile to keep mobile layout clean, lightweight & lag-free) */}
                <div className={`hidden lg:block w-full relative order-2 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="w-full relative aspect-square sm:aspect-[4/3] rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-200 bg-white p-1.5 sm:p-2 lg:p-3 hover:scale-[1.02] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 ease-out">
                    <div className="w-full h-full rounded-xl sm:rounded-3xl overflow-hidden shadow-inner bg-slate-50 relative z-10">
                      {(f.title.includes('Speech') || f.title.includes('Vocal')) && <SpeechCoachMockup />}
                      {(f.title.includes('Slide') || f.title.includes('Presenter')) && <SlideAnalyzerMockup />}
                      {(f.title.includes('Interview') || f.title.includes('Viva')) && <VivaDefenseMockup />}
                      {f.title.includes('Challenge') && <ChallengeMockup />}
                    </div>
                  </div>

                  {/* Continuous Floating Collage Popovers */}
                  <div className="absolute -top-4 -right-4 z-20 hidden md:block animate-float-slow">
                     {(f.title.includes('Speech') || f.title.includes('Vocal')) && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Good Pace!</span>
                         <span className="text-xl font-bold">145 wpm 👍</span>
                       </div>
                     )}
                     {(f.title.includes('Slide') || f.title.includes('Presenter')) && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Live Presenter Active</span>
                         <span className="text-xl font-bold">142 WPM • 🎥 CAM</span>
                       </div>
                     )}
                     {(f.title.includes('Interview') || f.title.includes('Viva')) && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Unscripted Discussion</span>
                         <span className="text-xl font-bold">Tech & STAR Scoring 🛡️</span>
                       </div>
                     )}
                     {f.title.includes('Challenge') && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Streak Active</span>
                         <span className="text-xl font-bold">7 Days 🔥</span>
                       </div>
                     )}
                  </div>

                  <div className="absolute -bottom-4 -left-4 z-20 hidden md:block animate-float-slow-reverse">
                     {(f.title.includes('Speech') || f.title.includes('Vocal')) && (
                       <div className="bg-white/90 backdrop-blur-md text-slate-800 px-5 py-3 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white flex items-center gap-3 cursor-default">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Mic size={18} /></div>
                         <div className="flex flex-col">
                           <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Recording</span>
                           <span className="text-sm font-bold text-slate-900">03:45 🔴</span>
                         </div>
                       </div>
                     )}
                     {(f.title.includes('Slide') || f.title.includes('Presenter')) && (
                       <div className="bg-white/90 backdrop-blur-md text-slate-800 px-5 py-3 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white flex items-center gap-3 cursor-default">
                         <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700"><Video size={18} /></div>
                         <div className="flex flex-col">
                           <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Live Presenter Mode</span>
                           <span className="text-sm font-bold text-slate-900">Slide 3 of 12</span>
                         </div>
                       </div>
                     )}
                     {(f.title.includes('Interview') || f.title.includes('Viva')) && (
                       <div className="bg-white/90 backdrop-blur-md text-slate-800 px-5 py-3 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white flex items-center gap-3 cursor-default">
                         <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Mic size={18} /></div>
                         <div className="flex flex-col">
                           <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">AI Status</span>
                           <span className="text-sm font-bold text-slate-900">Listening...</span>
                         </div>
                       </div>
                     )}
                  </div>
                </div>

                {/* Text View */}
                <div className={`w-full flex flex-col items-start text-left order-1 ${isReversed ? 'lg:order-1' : 'lg:order-2'} lg:px-10`}>
                  <div className={`w-12 sm:w-16 h-12 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 border border-slate-100 shadow-sm ${f.iconBg} bg-white`}>
                    {f.icon}
                  </div>
                  
                  {/* Two-Tier Heading */}
                  <div className="flex flex-col gap-1.5 mb-3 sm:mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900`}>
                        {f.title}
                      </span>
                      {f.subtitle && (
                        <span className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 text-[10px] sm:text-xs font-black rounded-full shadow-2xs">
                          {f.subtitle}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                      {f.headline}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-sm sm:text-lg md:text-xl leading-relaxed mb-5 sm:mb-10 font-medium">
                    {f.desc}
                  </p>
                  
                  {/* Visual Highlights List */}
                  <div className="flex flex-col gap-2 sm:gap-4 mb-6 sm:mb-12">
                    {f.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 sm:gap-4 bg-slate-50 border border-slate-100 shadow-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>
                        <span className="text-slate-800 font-bold text-sm sm:text-base">{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={f.href} className={`inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 text-white font-bold text-sm sm:text-base rounded-full hover:-translate-y-1 transition-all duration-300 group ${cs.ctaClasses}`}>
                    {f.cta}
                    <ArrowRight size={18} className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>

              </div>
              </div>
              </FadeUp>
            );
          })}
          </div>
        </div>
      </section>

      {/* How It Works Section — Aligned with Oratii Brand Theme */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#F8FAFC] border-t border-slate-200/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest mb-4 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span> Simple 3-Step Process
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 mb-4 tracking-tight">How Oratii Works</h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto mb-12 font-medium">From initial audio & slide upload to live AI feedback and Viva Q&A simulation.</p>
          </FadeUp>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left relative">
            {[
              { 
                step: '01', 
                title: 'Input Audio & Slides', 
                desc: 'Upload your presentation slides and record your live speech to initialize the AI analysis engine.',
                gradient: 'from-indigo-600 to-blue-600',
                icon: <Mic size={24} className="text-indigo-600" />,
                iconBg: 'bg-indigo-50 border-indigo-100'
              },
              { 
                step: '02', 
                title: 'Speech Coach Analysis', 
                desc: 'Our AI instantly processes your speech to detect pacing issues, track WPM, and eliminate filler words.',
                gradient: 'from-indigo-700 to-purple-600',
                icon: <Zap size={24} className="text-purple-600" />,
                iconBg: 'bg-purple-50 border-purple-100'
              },
              { 
                step: '03', 
                title: 'Viva Defense Simulator', 
                desc: 'The engine reads your slides and fires challenging, context-aware questions to test your knowledge under pressure.',
                gradient: 'from-indigo-600 via-purple-600 to-[#F2A93B]',
                icon: <MessageSquare size={24} className="text-[#D98200]" />,
                iconBg: 'bg-amber-50 border-amber-100'
              }
            ].map((s, i) => (
              <FadeUp key={s.step} delay={i * 100} className="relative z-10 h-full">
                <div className="h-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col p-6 sm:p-8 relative overflow-hidden group">
                  {/* Top Gradient Stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradient}`}></div>

                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${s.iconBg}`}>
                      {s.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black text-slate-800 bg-slate-100 border border-slate-200">
                      Step {s.step}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Core Use Cases & Benefits Grid — Dark Brand Navy Theme */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-[#151930] text-white">
        {/* Deep ambient glows */}
        <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-[#F2A93B]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-4 border border-white/10">
                ⚡ Proven Results
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                Master Pacing, Eliminate Fillers & Ace Q&A
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Oratii delivers instant, objective AI feedback so you speak with total clarity and executive confidence.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: <GraduationCap size={32} className="text-[#F2A93B]" />, title: "Academic & Viva Defenses", desc: "Conquer unexpected committee questions with AI slide-to-Q&A simulation and live scoring." },
              { icon: <Briefcase size={32} className="text-[#F2A93B]" />, title: "Pitches & Boardrooms", desc: "Identify and eliminate filler words ('um', 'basically', 'you know') to sound composed and convincing." },
              { icon: <BarChart3 size={32} className="text-[#F2A93B]" />, title: "Slide Deck Density", desc: "Audit your slides for text density and readability before presenting to any audience or panel." }
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="bg-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 flex flex-col justify-between hover:border-indigo-400/40 hover:bg-white/10 transition-all backdrop-blur-md h-full">
                  <div>
                    <div className="mb-5 p-3 rounded-2xl bg-white/10 w-max border border-white/10">{item.icon}</div>
                    <h3 className="font-extrabold text-white text-xl mb-3 tracking-tight">{item.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Feature Section — Sleek Brand Styling */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp>
            <div className="bg-gradient-to-br from-[#151930] via-indigo-950 to-[#1B2140] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-center gap-8 sm:gap-12 relative overflow-hidden border border-indigo-500/30 shadow-2xl">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 blur-[100px] pointer-events-none"></div>

              <div className="w-full md:w-1/2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-6 border border-white/10">
                  <Flame size={14} className="text-amber-400" /> Consistency Engine
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight">
                  Build unbreakable communication habits.
                </h3>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 font-medium">
                  Public speaking is a muscle. Our professional Gamification Engine tracks your daily practice, awarding XP and protecting your streak with redeemable freezes.
                </p>
                <ul className="flex flex-col gap-3.5 text-slate-200 font-semibold text-sm sm:text-base">
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400" /> Track consistent speaking streaks</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400" /> Earn XP & Unlock Professional Badges</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400" /> Purchase Streak Freezes to protect progress</li>
                </ul>
              </div>

              <div className="w-full md:w-1/2 relative z-10 flex justify-center">
                <div className="bg-white p-5 sm:p-6 rounded-2xl w-full max-w-sm border border-slate-200 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 font-bold text-sm">{user ? "Your Progress" : "Track Progress"}</span>
                    {user ? <StreakBadge /> : <div className="flex items-center gap-1.5 text-amber-600 font-black bg-amber-50 px-3 py-1 rounded-full border border-amber-200"><Flame size={16} fill="currentColor" /> 0</div>}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-5 shadow-xs">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-slate-900">Experience</span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 self-start">
                          {user ? "Top 20% this week" : "Level up by practicing"}
                        </span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{user ? "850 XP" : "0 XP"}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div className={`h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full ${user ? 'w-[85%]' : 'w-[8%]'}`}></div>
                    </div>
                  </div>
                  {user ? (
                    <Link href="/dashboard" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-md block text-center transition-all">
                      View Dashboard
                    </Link>
                  ) : (
                    <Link href="/signup" className="w-full py-3 bg-slate-950 text-white rounded-xl font-bold text-sm shadow-md block text-center hover:bg-indigo-900 transition-all">
                      Join to Start Earning
                    </Link>
                  )}
                </div>
              </div>

            </div>
          </FadeUp>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 sm:py-28 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <FadeUp>
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase tracking-widest mb-3 border border-indigo-100">
                Help & Support
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-3">Frequently Asked Questions</h2>
              <p className="text-slate-500 text-base">Everything you need to know about Oratii AI coaching.</p>
            </div>
          </FadeUp>

          <div className="space-y-4">
            {[
              { q: "Is my voice recording stored securely?", a: "Yes. All audio recordings are processed in real-time with end-to-end encryption and are never sold or used for public AI training." },
              { q: "Can I try Oratii completely free?", a: "Yes! Our free plan includes 5 speech analyses, 2 PPT slide analyses, and 3 Viva defense sessions every month." },
              { q: "How accurate is the filler word and pacing analysis?", a: "Our speech engine operates with high transcription accuracy, identifying subtle pause patterns and specific filler words like 'um', 'ah', and 'basically'." },
              { q: "What presentation formats are supported?", a: "Slide Analyzer supports PPTX files, PDF decks, and Keynote files exported to PDF." }
            ].map((faq, idx) => (
              <FadeUp key={idx} delay={idx * 50}>
                <details className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                  <summary className="flex items-center justify-between font-extrabold text-slate-900 text-base sm:text-lg">
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 transition-transform group-open:-rotate-180 text-indigo-600">↓</span>
                  </summary>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 font-medium">
                    {faq.a}
                  </p>
                </details>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section — Oratii Official Hero CTA Banner */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-[#151930] via-indigo-950 to-[#1B2140] text-center px-4 sm:px-6 relative overflow-hidden text-white">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/20 blur-[130px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-6 border border-white/10">
              ✨ Start Improving Today
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Ready to lead the room?
            </h2>
            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-medium">
              Join ambitious professionals who use Oratii to perfect their pitches, presentations, and public speaking.
            </p>
            {user ? (
              <Link 
                href="/dashboard"
                className="inline-block px-10 py-4 bg-gradient-to-r from-amber-400 to-[#F2A93B] text-[#151930] text-lg font-black rounded-full hover:from-amber-300 hover:to-[#e0992b] transition-all shadow-xl shadow-[#F2A93B]/25 hover:shadow-[#F2A93B]/40 hover:-translate-y-1 cursor-pointer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/signup"
                className="inline-block px-10 py-4 bg-gradient-to-r from-amber-400 to-[#F2A93B] text-[#151930] text-lg font-black rounded-full hover:from-amber-300 hover:to-[#e0992b] transition-all shadow-xl shadow-[#F2A93B]/25 hover:shadow-[#F2A93B]/40 hover:-translate-y-1 cursor-pointer"
              >
                Start Free Analysis
              </Link>
            )}
          </FadeUp>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}
