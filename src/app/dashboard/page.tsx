'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Edit3,
  LogOut,
  Flame,
  X,
  ShieldAlert,
  BarChart2,
  Sparkles,
  ArrowRight,
  Tv,
  Mic,
  FileText,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  Play,
  Trophy,
  Star,
  ChevronRight,
  BookOpen,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getHistory, getStatistics, getProfile, saveProfile, getSettings, saveSettings } from '@/lib/storage';
import { getGamificationSummary } from '@/lib/gamification';
import { getChallengeState } from '@/lib/challenge';
import EmptyState from '@/components/EmptyState';
import ReferralCard from '@/components/ReferralCard';
import NotificationPrompt from '@/components/NotificationPrompt';
import Footer from '@/components/Footer';

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const num = parseInt(String(value)) || 0;
    if (num === 0) {
      setDisplay(0);
      return;
    }

    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * num));
      if (progress < 1) requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}

function generateInsight(scoreTrend: number[], streak: number) {
  if (scoreTrend.length < 2) return "Complete your first slide deck audit or speech session to unlock AI coaching insights!";
  const latest = scoreTrend[scoreTrend.length - 1];
  const previous = scoreTrend[scoreTrend.length - 2];
  const average = scoreTrend.reduce((a, b) => a + b, 0) / scoreTrend.length;
  if (latest > previous + 5) return `Outstanding growth! Your presentation delivery score jumped by +${latest - previous}%!`;
  if (streak >= 3) return `Keep your ${streak}-day presentation practice streak alive!`;
  if (latest >= 90) return `Master tier delivery! You scored ${latest}%, placing you in the top 5% of presenters.`;
  if (latest > average) return `Consistent growth! Your latest score of ${latest}% is above your recent average.`;
  return `Every live presentation practice session brings you closer to mastery.`;
}

export default function ProfessionalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  // User Profile State
  const [profile, setProfileState] = useState<{ name: string; email: string; avatar: string | null }>({
    name: '',
    email: '',
    avatar: null,
  });

  // Performance & Gamification
  const [stats, setStats] = useState({
    xp: 0,
    streak: 0,
    recentScore: 0,
    level: 1,
    nextThreshold: 200,
    freezes: 0,
    totalSessions: 0,
    averageScore: 0,
    memberSince: 'Aug 2026',
  });

  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [scoreTrend, setScoreTrend] = useState<number[]>([]);
  const [settings, setSettingsState] = useState({ notifications: true, theme: 'light' });

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditModalOpen) {
        setIsEditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setUser(user);

      // Load Profile & Settings
      const storedProfile = getProfile() || {};
      const fullName = storedProfile.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const userEmail = user.email || storedProfile.email || '';
      const userAvatar = storedProfile.avatar || user.user_metadata?.avatar_url || null;

      setProfileState({
        name: fullName,
        email: userEmail,
        avatar: userAvatar,
      });

      const createdAt = user.created_at ? new Date(user.created_at) : new Date();
      const formattedDate = createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Session History & Gamification
      const history = getHistory();
      const gamification = getGamificationSummary();
      const statistics = getStatistics();
      const cState = getChallengeState();

      let recentScore = 0;
      if (history.length > 0) {
        recentScore = history[0].scores?.overall || 0;
        setHasHistory(true);
        setRecentSessions(history.slice(0, 5));
        setScoreTrend([...history].slice(0, 10).reverse().map(s => s.scores?.overall || 0));
      }

      setStats({
        xp: gamification.xp,
        streak: cState.streak_count || gamification.streak,
        recentScore,
        level: gamification.level || 1,
        nextThreshold: gamification.nextThreshold || 200,
        freezes: gamification.freezes || 0,
        totalSessions: statistics.totalSessions,
        averageScore: statistics.averageScore,
        memberSince: formattedDate,
      });

      setSettingsState(getSettings());
      requestAnimationFrame(() => setLoaded(true));
    };

    checkAuth();
  }, [router]);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'U';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameStr.substring(0, 2).toUpperCase();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = { ...profile, name: editName, avatar: editAvatar || null };
      setProfileState(updated);
      saveProfile(updated);

      if (user) {
        await supabase.auth.updateUser({
          data: {
            full_name: editName,
            name: editName,
            avatar_url: editAvatar || null,
          }
        });
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar || '');
    setIsEditModalOpen(true);
  };

  const coreModules = [
    {
      num: '01',
      title: 'Speech Delivery Coach',
      desc: 'Record live speech or audio clips for instant AI vocal pacing (WPM), filler word detection, tone analysis, and automated rewrites.',
      href: '/speech-coach',
      icon: <Mic size={22} className="text-white" />,
      badge: 'Vocal Pacing & Filler Analysis',
      gradient: 'from-rose-500 to-pink-600',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      features: ['Live WPM & Pause Meter', 'Filler Word Detection & Rewrites']
    },
    {
      num: '02',
      title: 'AI Voice Mock Interviewer',
      desc: 'Upload your Resume/CV or target role for an unscripted 4-round technical interview in an interactive voice window.',
      href: '/interview',
      icon: <Briefcase size={22} className="text-white" />,
      badge: 'Resume PDF & Voice AI Mode',
      gradient: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      features: ['Resume PDF & Role Upload', 'STAR Method & Tech Scoring']
    },
    {
      num: '03',
      title: 'Slide Presentation & Viva Studio',
      desc: 'Upload PowerPoint/PDF decks for slide audits, live rehearsal with WASM Edge HUD, and in-built academic viva defense.',
      href: '/presentation',
      icon: <FileText size={22} className="text-white" />,
      badge: 'Deck Audit, HUD & Viva',
      gradient: 'from-indigo-600 to-purple-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      features: ['Real-time WPM & Gaze Vector', 'In-built Committee Defense']
    },
    {
      num: '04',
      title: '20-Day Speech Challenge & Streaks',
      desc: 'Daily 2-to-5 minute adaptive speech exercises to fix vocal crutches, track streaks, and earn XP badges.',
      href: '/challenge',
      icon: <Flame size={22} className="text-white" />,
      badge: 'Daily Micro-Drills & XP',
      gradient: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      features: ['Streak & XP Level-Up', 'PDF Completion Certificate']
    },
  ];

  if (!loaded) {
    return (
      <div className="w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-[85vh] p-6 animate-pulse font-sans">
        <div className="h-44 bg-slate-200/80 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200/80 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans relative min-h-screen">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 flex-1">
      
      {/* Background Soft Glow Gradients (Matching Landing Page Theme) */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-indigo-200/40 blur-[130px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-80 -left-20 w-[450px] h-[450px] bg-purple-200/30 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Push Notification Opt-In (non-intrusive, shows on 2nd+ visit) */}
      <NotificationPrompt />

      {/* 1. HERO HEROIC PROFILE CARD (Landing Page Palette) */}
      <div className="relative bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Glow backdrop accent */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-purple-400/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
          {profile.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl shrink-0"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-[#1E1B4B] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shrink-0 border-2 border-amber-300">
              {getInitials(profile.name)}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {profile.name}!
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-[#1E1B4B] text-[11px] font-black uppercase rounded-full shadow-md flex items-center gap-1">
                <Sparkles size={12} fill="currentColor" /> Pro Presenter
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-indigo-200 flex flex-wrap items-center gap-3">
              <span>{profile.email}</span>
              <span className="text-indigo-400">•</span>
              <span>Member since {stats.memberSince}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <button
            onClick={handleOpenEditModal}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer shadow-md backdrop-blur-md flex items-center gap-2"
          >
            <Edit3 size={15} className="text-amber-400" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-extrabold rounded-2xl transition-all cursor-pointer shadow-md flex items-center gap-2"
            title="Sign Out"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. PERFORMANCE METRICS (Landing Page Soft Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 size={20} className="text-indigo-600" /> Performance Overview
          </h2>
          <span className="text-xs text-slate-500 font-semibold bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
            Updated Realtime
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Average Presentation Rating */}
          <div className="mobile-card-vibrant vibrant-border-indigo p-5 sm:p-6 flex flex-col justify-between active-touch-scale">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Overall Rating</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-100/90 text-indigo-900 flex items-center justify-center shadow-xs">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="my-3">
              <p className="text-4xl font-black text-slate-950 tabular-nums tracking-tight">
                <AnimatedNumber value={stats.averageScore || stats.recentScore} /><span className="text-xl font-bold text-indigo-600 ml-1">%</span>
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 rounded-full w-fit">
              <CheckCircle2 size={13} className="text-emerald-700" /> {stats.totalSessions} sessions completed
            </span>
          </div>

          {/* Card 2: Active Habit Streak */}
          <div className="mobile-card-vibrant vibrant-border-amber p-5 sm:p-6 flex flex-col justify-between active-touch-scale">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Practice Streak</span>
              <div className="w-9 h-9 rounded-xl bg-amber-100/90 text-amber-900 flex items-center justify-center shadow-xs">
                <Flame size={20} className="fill-amber-500 text-amber-600" />
              </div>
            </div>
            <div className="my-3">
              <p className="text-4xl font-black text-slate-950 tabular-nums tracking-tight">
                <AnimatedNumber value={stats.streak} /> <span className="text-xl font-bold text-slate-600">Days</span>
              </p>
            </div>
            <span className="text-xs font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-full w-fit">
              Keep your daily habit active
            </span>
          </div>

          {/* Card 3: Presenter Level & XP */}
          <div className="mobile-card-vibrant vibrant-border-rose p-5 sm:p-6 flex flex-col justify-between active-touch-scale">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Presenter Level</span>
              <span className="text-xs font-extrabold text-rose-900 bg-rose-100/90 border border-rose-300 px-2.5 py-0.5 rounded-full">
                Level {stats.level}
              </span>
            </div>
            <div className="my-3">
              <p className="text-4xl font-black text-slate-950 tabular-nums tracking-tight">
                <AnimatedNumber value={stats.xp} /> <span className="text-xl font-bold text-slate-600">XP</span>
              </p>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600"
                style={{ width: `${Math.min(100, (stats.xp % 1000) / 10)}%` }}
              />
            </div>
          </div>

          {/* Card 4: Total Sessions Analyzed */}
          <div className="mobile-card-vibrant vibrant-border-emerald p-5 sm:p-6 flex flex-col justify-between active-touch-scale">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Total Audits</span>
              <div className="w-9 h-9 rounded-xl bg-purple-100/90 text-purple-900 flex items-center justify-center shadow-xs">
                <Zap size={18} className="fill-purple-300 text-purple-800" />
              </div>
            </div>
            <div className="my-3">
              <p className="text-4xl font-black text-slate-950 tabular-nums tracking-tight">
                <AnimatedNumber value={stats.totalSessions} />
              </p>
            </div>
            <span className="text-xs font-bold text-purple-900 bg-purple-100/80 border border-purple-200 px-2.5 py-0.5 rounded-full w-fit">
              Decks, Viva &amp; speeches
            </span>
          </div>
        </div>
      </div>

      {/* VIRAL REFERRAL PROGRAM CARD */}
      <ReferralCard />

      {/* 3. CORE AI MODULES GRID (Vibrant Landing Page Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600" /> AI Practice Modules & Presentation Studio
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coreModules.map((m, idx) => (
            <div
              key={idx}
              onClick={() => router.push(m.href)}
              className="group bg-white border border-slate-200/90 hover:border-indigo-400 rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl relative overflow-hidden flex flex-col justify-between gap-5 transform hover:-translate-y-1"
            >
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.gradient} shadow-md flex items-center justify-center shrink-0`}>
                    {m.icon}
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${m.badgeBg}`}>
                      {m.badge}
                    </span>
                    <h3 className="text-xl font-black text-slate-950 group-hover:text-indigo-600 transition-colors mt-1">
                      {m.title}
                    </h3>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white flex items-center justify-center transition-all shrink-0 shadow-2xs">
                  <ArrowRight size={18} />
                </div>
              </div>

              {/* Card Body */}
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {m.desc}
              </p>

              {/* Feature Tags */}
              {m.features && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.features.map((feat, fIdx) => (
                    <span key={fIdx} className="text-[10px] font-extrabold text-indigo-900 bg-indigo-50/80 border border-indigo-100 px-2.5 py-1 rounded-lg">
                      {feat}
                    </span>
                  ))}
                </div>
              )}

              {/* Card Footer CTA */}
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                <span className="flex items-center gap-1">
                  Launch Studio <ChevronRight size={14} />
                </span>
                <span className="text-[10px] font-mono text-slate-400">Module {m.num}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AI COACHING INSIGHTS & RECENT LOG (Landing Palette) */}
      {hasHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Smart AI Coaching Banner */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white border border-indigo-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest mb-3 shadow-xs">
                <Sparkles size={12} fill="currentColor" /> AI Presentation Coach
              </div>
              <p className="text-lg sm:text-xl font-black text-slate-950 leading-relaxed">
                {generateInsight(scoreTrend, stats.streak)}
              </p>
            </div>

            <div className="pt-4 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600 font-semibold">Ready to analyze or practice your presentation?</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => router.push('/presentation')}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileText size={14} /> Analyze Slide Deck
                </button>
                <button
                  onClick={() => router.push('/presentation?mode=practice')}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#1E1B4B] font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-amber-300"
                >
                  <Tv size={14} /> Launch Live Practice
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                <Clock size={15} className="text-indigo-600" /> Recent Audits
              </h3>
              <Link href="/reports" className="text-xs font-extrabold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {recentSessions.map((session, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-slate-900 truncate max-w-[140px]">{session.topic || 'Presentation Audit'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{new Date(session.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-700 font-mono bg-indigo-100/80 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[11px]">
                      {session.scores?.overall || 85}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No practice sessions recorded yet"
          description="Upload your slide deck or start a speech coaching session above to view your real-time analytics!"
          type="audio"
        />
      )}

      {/* EDIT PROFILE MODAL (PORTAL TO DOCUMENT BODY) */}
      {mounted && isEditModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Edit3 size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-950">Edit Profile</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Live Profile Header Preview */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              {editAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={editAvatar}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                  onError={() => setEditAvatar('')}
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-[#1E1B4B] font-black text-xl flex items-center justify-center shadow-md shrink-0 border-2 border-amber-300">
                  {getInitials(editName || profile.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-slate-900 truncate">{editName || profile.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{profile.email || 'user@example.com'}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={e => setEditAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Quick Avatar Presets */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-1.5">Or Choose an Avatar Preset</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                  ].map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditAvatar(url)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${editAvatar === url ? 'border-indigo-600 ring-2 ring-indigo-300 scale-105' : 'border-slate-200 hover:border-indigo-400'}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar('')}
                      className="px-2.5 py-2 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 font-extrabold hover:bg-slate-200 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold shadow-md hover:from-indigo-500 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      </div>
      <Footer />
    </div>
  );
}
