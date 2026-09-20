'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mic, Video, MessageSquare, Zap, CheckCircle2, Flame, ArrowRight, Trophy, GraduationCap, Briefcase, BarChart3, Sparkles } from 'lucide-react';
import StreakBadge from '../components/StreakBadge';
import HeroShowcase from '../components/HeroShowcase';
import dynamic from 'next/dynamic';

const Footer = dynamic(() => import('@/components/Footer'), { ssr: true });

import { FadeUp } from '@/components/ui/FadeUp';
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
  const [heroIndex, setHeroIndex] = useState(0);

  const heroPhrases = [
    { action: 'Ace your', target: 'presentations & viva.', highlightBg: 'bg-[#FEF7ED] text-[#D98200] border-[#F2A93B]/40' },
    { action: 'Crush your', target: 'voice mock interviews.', highlightBg: 'bg-amber-50 text-amber-800 border-amber-200' },
    { action: 'Eliminate', target: 'filler words & pauses.', highlightBg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { action: 'Master your', target: 'public speaking habits.', highlightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

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
      
      {/* 1. Calm Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-[#0F1426]">
            <span className="w-8 h-8 rounded-lg bg-[#0F1426] text-[#F2A93B] flex items-center justify-center font-black text-sm">O</span>
            <span>Oratii</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#studio" className="hover:text-[#0F1426] transition-colors">Product</a>
            <a href="#transformation" className="hover:text-[#0F1426] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#0F1426] transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard" className="px-5 py-2.5 bg-[#0F1426] text-white text-sm font-bold rounded-xl hover:bg-[#1A2035] transition-all">
                Dashboard
              </Link>
            ) : (
              <Link href="/speech-coach" className="px-5 py-2.5 bg-[#0F1426] text-white text-sm font-bold rounded-xl hover:bg-[#1A2035] transition-all">
                Try Oratii
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 pt-20 sm:pt-24">

      {/* 2. Product-First Hero Section with Left Animated Text Highlight */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Animated Headline & Action */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <FadeUp delay={50}>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 block">
                AI Communication Practice
              </span>
            </FadeUp>

            <FadeUp delay={150}>
              <h1 className="text-4xl sm:text-6xl font-black text-[#0F1426] tracking-tight leading-[1.15] mb-6 min-h-[140px] sm:min-h-[160px]">
                Say it well. <br />
                <span className="inline-flex flex-wrap items-center gap-2 transition-all duration-500">
                  <span>{heroPhrases[heroIndex].action}</span>
                  <span className={`px-3.5 py-1 rounded-2xl border text-3xl sm:text-5xl font-black transition-all duration-500 shadow-2xs ${heroPhrases[heroIndex].highlightBg}`}>
                    {heroPhrases[heroIndex].target}
                  </span>
                </span>
              </h1>
            </FadeUp>

            <FadeUp delay={200}>
              <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed max-w-lg mb-8">
                Practice presentations, viva defense, and interviews with real-time feedback that shows you exactly where to improve.
              </p>
            </FadeUp>

            <FadeUp delay={250}>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link 
                  href="/speech-coach"
                  className="w-full sm:w-auto px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-bold text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  Start practicing <ArrowRight size={18} className="text-[#F2A93B] group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  onClick={() => {
                    const target = document.getElementById('how-it-works');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 font-bold text-base rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  See how it works
                </button>
              </div>
            </FadeUp>
          </div>

          {/* Right Column: Large Minimalist Product Framing */}
          <div className="lg:col-span-6 w-full">
            <FadeUp delay={350}>
              <HeroShowcase />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* 3. Editorial Context / Trust Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-400 mb-8 tracking-tight">
              Built for moments when communication matters.
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-base sm:text-lg font-extrabold text-[#0F1426]">
              <span>Students</span>
              <span className="text-slate-300">•</span>
              <span>Professionals</span>
              <span className="text-slate-300">•</span>
              <span>Job Seekers</span>
              <span className="text-slate-300">•</span>
              <span>Presenters</span>
              <span className="text-slate-300">•</span>
              <span>Educators</span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 4. Emotional Problem Section */}
      <section className="py-20 sm:py-28 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0F1426] tracking-tight mb-16">
              You can practice. <br />
              <span className="text-slate-500">But do you know what you&apos;re doing wrong?</span>
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {[
              { title: "Speaking Too Fast", desc: "Speeding through slides when nervous." },
              { title: "Filler Overload", desc: '"Basically... um... I think..."' },
              { title: "Unclear Structure", desc: "Losing audience attention during Q&A." },
              { title: "Low Confidence", desc: "Hesitating under defense pressure." }
            ].map((p, idx) => (
              <FadeUp key={idx} delay={idx * 80}>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-full">
                  <div className="text-xs font-black text-[#F2A93B] mb-2 uppercase tracking-wider">Issue 0{idx + 1}</div>
                  <h3 className="text-lg font-extrabold text-[#0F1426] mb-2">{p.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{p.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Main Product Showcase — "One Studio" (Viva consolidated inside Presentation Practice) */}
      <section id="studio" className="py-20 sm:py-28 bg-white border-t border-slate-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-black uppercase tracking-widest text-[#F2A93B] mb-2 block">
                One Studio
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0F1426] tracking-tight">
                Multiple ways to practice.
              </h2>
            </div>
          </FadeUp>

          {/* Interactive Mode Selector (3 Core Practice Modes) */}
          <div className="flex items-center justify-center gap-3 mb-10 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 0, label: 'Speech Coach', icon: Mic },
              { id: 1, label: 'Presentation & Viva Studio', icon: Video },
              { id: 2, label: 'AI Voice Interviewer', icon: Briefcase }
            ].map((m) => {
              const Icon = m.icon;
              const isActive = activeFeatureIndex === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveFeatureIndex(m.id)}
                  className={`px-6 py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center gap-2.5 cursor-pointer border ${
                    isActive
                      ? 'bg-[#0F1426] text-white border-[#0F1426] shadow-md scale-105'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#F2A93B]' : 'text-slate-400'} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Studio Stage */}
          <div className="bg-[#0F1426] rounded-3xl border border-slate-800 p-4 sm:p-8 shadow-2xl min-h-[420px] flex flex-col justify-center">
            <div className="w-full max-w-4xl mx-auto aspect-[16/10] sm:aspect-[16/9]">
              {activeFeatureIndex === 0 && <SpeechCoachMockup />}
              {activeFeatureIndex === 1 && <SlideAnalyzerMockup />}
              {activeFeatureIndex === 2 && (
                <div className="w-full h-full bg-slate-950 text-white rounded-2xl p-6 flex flex-col justify-between border border-slate-800">
                  <div className="text-xs font-bold text-[#F2A93B] uppercase tracking-wider mb-2">AI Interviewer Probe</div>
                  <p className="text-base sm:text-xl font-bold text-slate-100 italic mb-4">
                    &quot;Tell me about a complex system architecture decision you made under deadline pressure.&quot;
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">Structure — Strong</span>
                      <span className="text-slate-400">STAR method followed</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold block mb-1">Specificity — Improve</span>
                      <span className="text-slate-400">Add quantitative impact</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">Confidence — Good</span>
                      <span className="text-slate-400">Steady vocal pitch</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Habit & Practice Retention (20-Day Challenge) */}
      <section className="py-16 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F1426] mb-4">
              Improvement comes from repetition.
            </h2>
            <p className="text-slate-600 text-base font-medium max-w-xl mx-auto mb-8">
              Build a daily speaking habit with targeted practice prompts and streak rewards.
            </p>

            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs font-bold text-sm text-[#0F1426]">
              <span className="flex items-center gap-2"><Trophy size={16} className="text-[#F2A93B]" /> Day 12 / 20</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-2"><Flame size={16} className="text-rose-500" /> 12-day streak</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-600">+120 XP</span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 7. Transformation Showcase (Before → After) */}
      <section id="transformation" className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">
              Transformation
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0F1426] tracking-tight mb-16">
              Practice → Understand → Improve
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-left">
            {/* Before */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-slate-400 block mb-3">Before Oratii</span>
                <ul className="space-y-3 text-sm font-semibold text-slate-700">
                  <li className="flex items-center gap-2 text-rose-600">❌ 145 WPM (Too fast)</li>
                  <li className="flex items-center gap-2 text-rose-600">❌ 8 filler words</li>
                  <li className="flex items-center gap-2 text-rose-600">❌ Weak structure</li>
                </ul>
              </div>
            </div>

            {/* Feedback */}
            <div className="p-6 rounded-2xl bg-[#0F1426] text-white border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-[#F2A93B] block mb-3">Oratii Feedback</span>
                <ul className="space-y-3 text-sm font-semibold text-slate-200">
                  <li className="flex items-center gap-2">💡 Slow down on slide 3</li>
                  <li className="flex items-center gap-2">💡 Remove filler &quot;basically&quot;</li>
                  <li className="flex items-center gap-2">💡 Add STAR conclusion</li>
                </ul>
              </div>
            </div>

            {/* After */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase text-emerald-600 block mb-3">After 3 Sessions</span>
                <ul className="space-y-3 text-sm font-semibold text-slate-800">
                  <li className="flex items-center gap-2 text-emerald-600">✓ 128 WPM (Controlled)</li>
                  <li className="flex items-center gap-2 text-emerald-600">✓ Clear delivery</li>
                  <li className="flex items-center gap-2 text-emerald-600">✓ Confident explanation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. How Oratii Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <FadeUp>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0F1426] mb-16 tracking-tight">
              How Oratii Works
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {[
              { num: "01", title: "Choose Practice Mode", desc: "Select speech coach, interview probes, or presentation studio." },
              { num: "02", title: "Practice Out Loud", desc: "Speak into mic with live webcam & slide HUD telemetry." },
              { num: "03", title: "Get Real-time Feedback", desc: "See exact WPM, filler word locations, and clarity scores." },
              { num: "04", title: "Practice Again", desc: "Refine your delivery and track your streak progress." }
            ].map((step, idx) => (
              <FadeUp key={idx} delay={idx * 80}>
                <div className="border-t-2 border-slate-200 pt-6">
                  <div className="text-2xl font-black text-[#F2A93B] mb-2">{step.num}</div>
                  <h3 className="text-lg font-extrabold text-[#0F1426] mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Audience Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F1426] tracking-tight">
                Designed for your specific goals.
              </h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-xl font-black text-[#0F1426] mb-4">Students</h3>
              <ul className="space-y-3 text-sm font-semibold text-slate-600">
                <li>• Viva &amp; Thesis Defense</li>
                <li>• Class Presentations</li>
                <li>• Campus Interviews</li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-xl font-black text-[#0F1426] mb-4">Professionals</h3>
              <ul className="space-y-3 text-sm font-semibold text-slate-600">
                <li>• Executive Pitch Decks</li>
                <li>• Client Meetings</li>
                <li>• Team Communication</li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="text-xl font-black text-[#0F1426] mb-4">Job Seekers</h3>
              <ul className="space-y-3 text-sm font-semibold text-slate-600">
                <li>• Behavioral HR Probes</li>
                <li>• Technical Deep Dives</li>
                <li>• Self Introductions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Final CTA Section */}
      <section className="py-20 sm:py-28 bg-[#0F1426] text-center px-4 sm:px-6 relative overflow-hidden text-white">
        <div className="max-w-4xl mx-auto relative z-10">
          <FadeUp>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              Your next presentation starts here.
            </h2>
            <p className="text-slate-300 text-lg sm:text-xl max-w-xl mx-auto mb-10 font-medium">
              Practice. Get feedback. Improve.
            </p>
            <Link 
              href="/speech-coach"
              className="inline-block px-10 py-4 bg-[#F2A93B] hover:bg-[#d98200] text-[#0F1426] text-base font-extrabold rounded-xl transition-all shadow-xl hover:-translate-y-0.5"
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

