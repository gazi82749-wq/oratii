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
import PartnerAcademyMockup from '@/components/home/PartnerAcademyMockup';


import EducatorSwitchModal from '../components/EducatorSwitchModal';

export default function HomeClient() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showEducatorModal, setShowEducatorModal] = useState(false);

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
      highlights: ['Resume PDF & Role Upload', 'Interactive Voice AI Interface', 'STAR Method & Tech Scoring'],
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
    },
    {
      title: 'Partner Academy & Coaching Hub',
      headline: 'Automate student speaking drills & viva homework.',
      desc: 'For Spoken English centers, IELTS institutes, and College Placement Cells. Create batches, share 6-character WhatsApp invite codes, and auto-grade student homework.',
      highlights: ['1-Click WhatsApp Batch Invites', 'Class Leaderboard & CEFR Band Grades', 'Automated Student Homework Grading'],
      icon: <GraduationCap size={28} className="text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-100',
      href: '/trainer',
      cta: 'Open Partner Academy Portal'
    }
  ];

  const metrics = [
    { 
      value: 'Speech Pacing & WPM', 
      label: 'Tracks live Words Per Minute (WPM), pause cadence, and eliminates regional filler words ("matlab", "basically", "ums").', 
      tags: ['WPM Tracking', 'Filler Detection', 'AI Rewrites'],
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
      iconColor: 'text-rose-500',
      href: '/speech-coach'
    },
    { 
      value: 'Voice Mock Interviewer', 
      label: 'Interactive tech & HR voice rounds. Upload your resume PDF and receive instant STAR method scoring & answer feedback.', 
      tags: ['Resume PDF Audit', 'STAR Method', 'Voice Q&A'],
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
      iconColor: 'text-amber-600',
      href: '/interview'
    },
    { 
      value: 'Slide Deck & Viva Studio', 
      label: 'Audits visual slide density, offers live webcam HUD rehearsal, and tests you with unscripted AI viva defense questions.', 
      tags: ['Slide Readability', 'Webcam WASM HUD', 'Viva Defense'],
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
      iconColor: 'text-indigo-600',
      href: '/presentation'
    },
    { 
      value: '20-Day Speech Challenge', 
      label: 'Build daily speaking habits with 3-minute prompts, streak tracking, XP rewards, and downloadable completion certificates.', 
      tags: ['Daily Prompts', 'Streak Engine', 'PDF Certificate'],
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      iconColor: 'text-emerald-600',
      href: '/challenge'
    }
  ];

  const cardStyles = [
    { num: '01', borderAccent: 'border-l-4 border-l-[#0F1426]', glow: 'rgba(15,20,38,0.04)', hoverGlow: 'rgba(15,20,38,0.08)', accentColor: 'text-slate-900', badgeBg: 'bg-slate-100 text-slate-900 border-slate-200', ctaClasses: 'bg-[#0F1426] hover:bg-[#1A2035] text-white shadow-[0_10px_25px_-5px_rgba(15,20,38,0.25)] border border-white/10 rounded-2xl' },
    { num: '02', borderAccent: 'border-l-4 border-l-[#F2A93B]', glow: 'rgba(242,169,59,0.06)', hoverGlow: 'rgba(242,169,59,0.12)', accentColor: 'text-amber-800', badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80', ctaClasses: 'bg-[#0F1426] hover:bg-[#1A2035] text-white shadow-[0_10px_25px_-5px_rgba(15,20,38,0.25)] border border-white/10 rounded-2xl' },
    { num: '03', borderAccent: 'border-l-4 border-l-[#0F1426]', glow: 'rgba(15,20,38,0.04)', hoverGlow: 'rgba(15,20,38,0.08)', accentColor: 'text-slate-900', badgeBg: 'bg-slate-100 text-slate-900 border-slate-200', ctaClasses: 'bg-[#0F1426] hover:bg-[#1A2035] text-white shadow-[0_10px_25px_-5px_rgba(15,20,38,0.25)] border border-white/10 rounded-2xl' },
    { num: '04', borderAccent: 'border-l-4 border-l-[#F2A93B]', glow: 'rgba(242,169,59,0.06)', hoverGlow: 'rgba(242,169,59,0.12)', accentColor: 'text-amber-800', badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80', ctaClasses: 'bg-[#0F1426] hover:bg-[#1A2035] text-white shadow-[0_10px_25px_-5px_rgba(15,20,38,0.25)] border border-white/10 rounded-2xl' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-slate-900 overflow-x-hidden">
      
      <div className="flex-1">

      {/* Hero Section — Screen view viewport centered */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center pt-28 sm:pt-32 lg:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden bg-[#F8FAFC]">
        {/* Subtle Ambient Depth */}
        <div className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-amber-100/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-slate-200/40 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-10 min-w-0 max-w-full my-auto">
          
          {/* Left Column: Text & CTAs */}
          <div className="w-full text-center md:text-left flex flex-col items-center md:items-start min-w-0 max-w-full">
          <FadeUp delay={50}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-[#0F1426] text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]"></span> AI Speech, Presentation &amp; Interview Coach
            </div>
          </FadeUp>

          <FadeUp delay={150}>
            <h1 className="text-[clamp(2.5rem,4.8vw,4.2rem)] lg:text-6xl leading-[1.1] font-black tracking-tight text-slate-900 mb-5 break-words max-w-2xl">
              Say it well. <br className="hidden sm:block" />
              <span className="text-[#F2A93B]">Show it well.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={200}>
            <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-xl mx-auto md:mx-0 mb-8 leading-relaxed font-medium">
              Real-time AI feedback on your vocal pacing (WPM), filler words, slide deck density, and viva interview delivery.
            </p>
          </FadeUp>

          <FadeUp delay={250} className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start w-full sm:w-auto">
              {user ? (
                <Link 
                  href="/speech-coach"
                  className="w-full sm:w-auto px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white text-base font-bold rounded-2xl shadow-[0_10px_30px_-10px_rgba(15,20,38,0.5)] border border-white/10 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 min-h-[52px] group"
                >
                  Launch Practice Studio <ArrowRight size={18} className="text-[#F2A93B] group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white text-base font-bold rounded-2xl shadow-[0_10px_30px_-10px_rgba(15,20,38,0.5)] border border-white/10 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 min-h-[52px] group"
                >
                  Start Free Speaking Practice <ArrowRight size={18} className="text-[#F2A93B] group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('how-it-works');
                  if (target) {
                    const targetPos = target.getBoundingClientRect().top + window.pageYOffset - 80;
                    const startPos = window.pageYOffset;
                    const dist = targetPos - startPos;
                    const dur = 850;
                    let startTime: number | null = null;
                    const step = (now: number) => {
                      if (!startTime) startTime = now;
                      const elapsed = now - startTime;
                      const progress = Math.min(elapsed / dur, 1);
                      const ease = progress < 0.5 
                        ? 4 * progress * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                      window.scrollTo(0, startPos + dist * ease);
                      if (elapsed < dur) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                  }
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 text-base font-bold border border-slate-200/90 rounded-2xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-xs active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px] cursor-pointer"
              >
                See How It Works
              </button>
            </div>
            <p className="mt-4 text-[11px] sm:text-xs font-semibold text-slate-400 text-center md:text-left">
              No credit card required • Free plan available
            </p>
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


      {/* Metrics / How We Analyze — Feature Matched */}
      <section className="py-14 sm:py-20 relative z-20 -mt-8 sm:-mt-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span> Actionable AI Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 sm:mb-4 tracking-tight">Track your progress easily.</h2>
            <p className="text-slate-600 text-base sm:text-lg font-medium">Get real-time, actionable feedback on how you speak, present, and interview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {metrics.map((m, i) => {
              return (
                <FadeUp key={i} delay={i * 100} className="h-full">
                  <Link 
                    href={m.href}
                    className="group h-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(15,20,38,0.05)] hover:shadow-[0_12px_36px_-6px_rgba(15,20,38,0.1)] hover:border-indigo-300/80 hover:-translate-y-1 transition-all duration-300 flex flex-col p-6 sm:p-7 cursor-pointer block"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${m.badgeColor}`}>
                        AI Module
                      </span>
                      <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-950 mb-2.5 tracking-tight group-hover:text-indigo-900 transition-colors">{m.value}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">{m.label}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100">
                      {m.tags.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 rounded-lg border border-slate-200/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* Unified Features Section */}
      <section id="how-it-works" className="py-16 sm:py-20 relative overflow-hidden bg-[#F8FAFC] scroll-mt-20">
        {/* Subtle Ambient Depth */}
        <div className="absolute top-[-5%] left-[-5%] w-[40vw] h-[40vw] bg-slate-200/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35vw] h-[35vw] bg-amber-100/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col relative z-10">
          
          {/* Feature Cards Grid */}

          <div className="flex flex-col gap-10 sm:gap-14 lg:gap-16">
          {features.map((f, i) => {
            const isReversed = i % 2 !== 0;
            const cs = cardStyles[i % cardStyles.length] || cardStyles[0];
            return (
              <FadeUp key={i} delay={i * 80}>
              <div id={`module-card-${i}`} className="relative group scroll-mt-24">
                <div className={`grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-10 lg:gap-16 bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-10 lg:p-14 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative ${cs.borderAccent}`}
                >
                  {/* Subtle top divider line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-slate-100" />
                
                {/* Result Card View (Hidden on mobile to keep mobile layout clean, lightweight & lag-free) */}
                <div className={`hidden lg:block w-full relative order-2 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="w-full relative aspect-square sm:aspect-[4/3] rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-200 bg-white p-1.5 sm:p-2 lg:p-3 hover:scale-[1.02] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 ease-out">
                    <div className="w-full h-full rounded-xl sm:rounded-3xl overflow-hidden shadow-inner bg-slate-50 relative z-10">
                      {(f.title.includes('Speech') || f.title.includes('Vocal')) && <SpeechCoachMockup />}
                      {(f.title.includes('Slide') || f.title.includes('Presenter')) && <SlideAnalyzerMockup />}
                      {(f.title.includes('Interview') || f.title.includes('Viva')) && <VivaDefenseMockup />}
                      {f.title.includes('Challenge') && <ChallengeMockup />}
                      {(f.title.includes('Partner') || f.title.includes('Academy') || f.title.includes('Coaching')) && <PartnerAcademyMockup />}
                    </div>
                  </div>

                  {/* Continuous Floating Collage Popovers */}
                  <div className="absolute -top-4 -right-4 z-20 hidden md:block animate-float-slow">
                     {(f.title.includes('Speech') || f.title.includes('Vocal')) && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Good Pace</span>
                         <span className="text-xl font-bold">145 WPM</span>
                       </div>
                     )}
                     {(f.title.includes('Slide') || f.title.includes('Presenter')) && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Live Presenter Active</span>
                         <span className="text-xl font-bold">142 WPM • Live Cam</span>
                       </div>
                     )}
                     {(f.title.includes('Interview') || f.title.includes('Viva')) && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Unscripted Discussion</span>
                         <span className="text-xl font-bold">Tech &amp; STAR Scoring</span>
                       </div>
                     )}
                     {f.title.includes('Challenge') && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Streak Active</span>
                         <span className="text-xl font-bold">7-Day Streak</span>
                       </div>
                     )}
                     {(f.title.includes('Partner') || f.title.includes('Academy')) && (
                       <div className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col gap-1 cursor-default">
                         <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">WhatsApp Auto-Sync</span>
                         <span className="text-xl font-bold">45/45 Graded</span>
                       </div>
                     )}
                  </div>

                  <div className="absolute -bottom-4 -left-4 z-20 hidden md:block animate-float-slow-reverse">
                     {(f.title.includes('Speech') || f.title.includes('Vocal')) && (
                       <div className="bg-white/90 backdrop-blur-md text-slate-800 px-5 py-3 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white flex items-center gap-3 cursor-default">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Mic size={18} /></div>
                         <div className="flex flex-col">
                           <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Recording</span>
                           <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> 03:45</span>
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
                     {(f.title.includes('Partner') || f.title.includes('Academy')) && (
                       <div className="bg-white/90 backdrop-blur-md text-slate-800 px-5 py-3 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white flex items-center gap-3 cursor-default">
                         <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700"><GraduationCap size={18} /></div>
                         <div className="flex flex-col">
                           <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Partner Academy</span>
                           <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Auto-Graded Cohorts</span>
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

                  <Link 
                    href={f.href === '/trainer' && !user ? '/signup?role=trainer' : f.href} 
                    onClick={(e) => {
                      if (f.href === '/trainer') {
                        if (!user) {
                          router.push('/signup?role=trainer');
                          e.preventDefault();
                        } else if (userRole === 'student') {
                          e.preventDefault();
                          setShowEducatorModal(true);
                        }
                      }
                    }}
                    className={`inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 text-white font-bold text-sm sm:text-base rounded-2xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group ${cs.ctaClasses}`}
                  >
                    {f.cta}
                    <ArrowRight size={18} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
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

      {/* How It Works Section — Aligned with Exact Website Features */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#F8FAFC] border-t border-slate-200/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest mb-4 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span> Simple 4-Step Practice Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 mb-4 tracking-tight">How Oratii Works</h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto mb-12 font-medium">From live speech recording and resume upload to AI voice Q&amp;A and instant scorecards.</p>
          </FadeUp>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 text-left relative">
            {[
              { 
                step: '01', 
                title: 'Select Your Practice Mode', 
                desc: 'Pick 3-minute speech drills, upload your Resume PDF for voice mock interviews, or drop PPTX slides for viva presentation studio.',
                gradient: 'from-indigo-600 to-blue-600',
                icon: <Mic size={24} className="text-indigo-600" />,
                iconBg: 'bg-indigo-50 border-indigo-100'
              },
              { 
                step: '02', 
                title: 'Rehearse Live Out Loud', 
                desc: 'Speak into your mic with real-time vocal pacing (WPM) meters, pause detection, filler word alerts, and live webcam HUD.',
                gradient: 'from-indigo-700 to-purple-600',
                icon: <Zap size={24} className="text-purple-600" />,
                iconBg: 'bg-purple-50 border-purple-100'
              },
              { 
                step: '03', 
                title: 'Face Unscripted AI Q&A', 
                desc: 'Answer realistic technical questions, STAR method interview probes, and slide-based academic viva questions under pressure.',
                gradient: 'from-amber-500 to-orange-500',
                icon: <MessageSquare size={24} className="text-amber-600" />,
                iconBg: 'bg-amber-50 border-amber-100'
              },
              { 
                step: '04', 
                title: 'Instant AI Scorecards & Streaks', 
                desc: 'Receive instant WPM pacing charts, filler word breakdowns, STAR scores, streak XP badges, and shareable PDF certificates.',
                gradient: 'from-emerald-500 to-teal-600',
                icon: <Trophy size={24} className="text-emerald-600" />,
                iconBg: 'bg-emerald-50 border-emerald-100'
              }
            ].map((s, i) => (
              <FadeUp key={s.step} delay={i * 100} className="relative z-10 h-full">
                <div className="h-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col p-6 relative overflow-hidden group">
                  {/* Refined Brand Indicator */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 group-hover:bg-[#F2A93B] transition-colors"></div>

                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${s.iconBg}`}>
                      {s.icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200">
                      Step {s.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2.5 tracking-tight">{s.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Core Use Cases & Benefits Grid — Dark Brand Navy Theme */}
      <section className="py-20 sm:py-28 relative overflow-hidden bg-[#0F1426] text-white">
        {/* Deep subtle ambient warmth */}
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-slate-800/20 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-[#F2A93B]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#F2A93B] text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">
                Proven Results
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                Master Pacing, Eliminate Fillers &amp; Ace Q&amp;A
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
                <div className="bg-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 flex flex-col justify-between hover:border-[#F2A93B]/40 hover:bg-white/10 transition-all backdrop-blur-md h-full">
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
            <div className="bg-[#0F1426] rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 flex flex-col md:flex-row items-center gap-8 sm:gap-12 relative overflow-hidden border border-slate-800 shadow-2xl">
              {/* Ambient Warmth */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#F2A93B]/10 blur-[100px] pointer-events-none"></div>

              <div className="w-full md:w-1/2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-6 border border-white/10">
                  <Flame size={14} className="text-amber-400" /> Consistency &amp; Progress Engine
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight">
                  Track your speech, interview &amp; viva progress.
                </h3>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 font-medium">
                  Public speaking is a muscle. Oratii tracks every session, measuring your vocal pacing, filler word elimination, and Q&amp;A readiness over time.
                </p>
                <ul className="flex flex-col gap-3.5 text-slate-200 font-semibold text-sm sm:text-base">
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400" /> Track live WPM vocal pacing &amp; pause durations</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400" /> Audit filler words (&ldquo;matlab&rdquo;, &ldquo;basically&rdquo;, &ldquo;ums&rdquo;)</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-emerald-400" /> Rehearse mock interviews, viva Q&amp;A &amp; 3-min drills</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-amber-400" /> Grammarly-style weekly progress email reports</li>
                </ul>
              </div>

              <div className="w-full md:w-1/2 relative z-10 flex justify-center">
                <div className="bg-white p-5 sm:p-6 rounded-2xl w-full max-w-md border border-slate-200 shadow-xl">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                    <span className="text-slate-900 font-black text-sm sm:text-base flex items-center gap-2">
                      <BarChart3 size={18} className="text-indigo-600" /> Real-Time Analytics &amp; Progress
                    </span>
                    {user ? <StreakBadge /> : <div className="flex items-center gap-1.5 text-amber-600 font-black bg-amber-50 px-3 py-1 rounded-full border border-amber-200"><Flame size={15} fill="currentColor" /> 1-Day Streak</div>}
                  </div>

                  {/* Live Feature Progress Metrics */}
                  <div className="space-y-3 mb-5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600"><Mic size={16} /></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">Speech Pacing (WPM)</span>
                          <span className="text-[10px] text-slate-500 font-medium">Target: 130–150 WPM</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">142 WPM (Optimal)</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-700"><Briefcase size={16} /></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">AI Mock Interview</span>
                          <span className="text-[10px] text-slate-500 font-medium">STAR Method Audit</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">92/100 Score</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><Video size={16} /></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">Slide &amp; Viva Studio</span>
                          <span className="text-[10px] text-slate-500 font-medium">Slide Density &amp; Viva Q&amp;A</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">0 Fillers (&ldquo;um/matlab&rdquo;)</span>
                    </div>
                  </div>

                  {user ? (
                    <Link href="/dashboard" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-md block text-center transition-all">
                      View Live Dashboard Analytics
                    </Link>
                  ) : (
                    <Link href="/signup" className="w-full py-3 bg-slate-950 text-white rounded-xl font-bold text-sm shadow-md block text-center hover:bg-indigo-900 transition-all">
                      Track Your Progress Free
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-widest mb-3 border border-slate-200">
                Help &amp; Support
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Frequently Asked Questions</h2>
              <p className="text-slate-600 text-base">Everything you need to know about Oratii AI coaching.</p>
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
                <details className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                  <summary className="flex items-center justify-between font-bold text-slate-900 text-base sm:text-lg">
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 transition-transform group-open:-rotate-180 text-slate-500">↓</span>
                  </summary>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 font-normal">
                    {faq.a}
                  </p>
                </details>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section — Oratii Official Hero CTA Banner */}
      <section className="py-20 sm:py-28 bg-[#0F1426] text-center px-4 sm:px-6 relative overflow-hidden text-white border-t border-slate-800">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F2A93B]/10 blur-[130px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#F2A93B] text-xs font-bold uppercase tracking-widest mb-6 border border-white/10">
              Start Improving Today
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Ready to lead the room?
            </h2>
            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-normal">
              Join ambitious professionals who use Oratii to perfect their pitches, presentations, and public speaking.
            </p>
            {user ? (
              <Link 
                href="/dashboard"
                className="inline-block px-10 py-4 bg-[#F2A93B] hover:bg-[#e0992b] text-[#0F1426] text-base font-bold rounded-2xl transition-all shadow-xl shadow-[#F2A93B]/20 hover:-translate-y-0.5 cursor-pointer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/signup"
                className="inline-block px-10 py-4 bg-[#F2A93B] hover:bg-[#e0992b] text-[#0F1426] text-base font-bold rounded-2xl transition-all shadow-xl shadow-[#F2A93B]/20 hover:-translate-y-0.5 cursor-pointer"
              >
                Start Free Analysis
              </Link>
            )}
          </FadeUp>
        </div>
      </section>
      </div>
      <Footer />

      {/* Educator / Institute Mode Switch Modal Popup */}
      <EducatorSwitchModal
        isOpen={showEducatorModal}
        onClose={() => setShowEducatorModal(false)}
        userId={user?.id}
      />
    </div>
  );
}
