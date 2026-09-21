'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  BarChart2,
  Clock,
  Download,
  Calendar,
  X,
  ChevronRight,
  Check,
  Rocket,
  Laptop,
  Star,
  Lightbulb,
  Handshake,
  Shield,
  Volume2,
  Users,
  BarChart3,
  Target,
  Scale,
  Mic,
  Database,
  Trophy,
  Zap,
  Globe,
  Landmark,
  Medal
} from 'lucide-react';
import {
  getChallengeState,
  skipChallengeDay,
  resetChallengeState,
  DAILY_TASKS,
  ChallengeState,
} from '@/lib/challenge';
import { getProfile } from '@/lib/storage';
import CertificateModal from '@/components/CertificateModal';
import GuestAuthModal from '@/components/GuestAuthModal';
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal';
import { checkAndDeductCredits } from '@/lib/credits';
import { supabase } from '@/lib/supabaseClient';
import Footer from '@/components/Footer';

const renderChallengeBadgeIcon = (day: number) => {
  switch (day) {
    case 1: return <Rocket size={22} className="text-amber-600" />;
    case 2: return <Laptop size={22} className="text-amber-600" />;
    case 3: return <Star size={22} className="text-amber-600" />;
    case 4: return <Lightbulb size={22} className="text-amber-600" />;
    case 5: return <Handshake size={22} className="text-amber-600" />;
    case 6: return <Shield size={22} className="text-amber-600" />;
    case 7: return <Volume2 size={22} className="text-amber-600" />;
    case 8: return <Users size={22} className="text-amber-600" />;
    case 9: return <BarChart3 size={22} className="text-amber-600" />;
    case 10: return <Target size={22} className="text-amber-600" />;
    case 11: return <Scale size={22} className="text-amber-600" />;
    case 12: return <Mic size={22} className="text-amber-600" />;
    case 13: return <Database size={22} className="text-amber-600" />;
    case 14: return <Medal size={22} className="text-amber-600" />;
    case 15: return <Zap size={22} className="text-amber-600" />;
    case 16: return <Globe size={22} className="text-amber-600" />;
    case 17: return <Landmark size={22} className="text-amber-600" />;
    case 18: return <Trophy size={22} className="text-amber-600" />;
    case 19: return <Flame size={22} className="text-amber-600" />;
    case 20: return <Award size={22} className="text-amber-600" />;
    default: return <Award size={22} className="text-amber-600" />;
  }
};

// 20 Custom Badge Definitions for the Daily Campus Placement & Viva Defense Bootcamp
const CHALLENGE_BADGES = [
  { day: 1, name: 'Campus Initiator', iconName: 'rocket', desc: 'Delivered crisp 90s professional introduction' },
  { day: 2, name: 'Architecture Defender', iconName: 'laptop', desc: 'Defended major engineering project stack & flow' },
  { day: 3, name: 'STAR Problem Solver', iconName: 'star', desc: 'Resolved behavioral crisis with STAR methodology' },
  { day: 4, name: 'Concept Simplifier', iconName: 'lightbulb', desc: 'Explained complex engineering logic simply' },
  { day: 5, name: 'Campus Negotiator', iconName: 'handshake', desc: 'Mastered placement offer & role dialogue' },
  { day: 6, name: 'Hostile Cross-Examiner', iconName: 'shield', desc: 'Maintained composure against skeptical examiners' },
  { day: 7, name: 'IELTS Band 8 Speaker', iconName: 'volume2', desc: 'Delivered 2-minute technology cue card speech' },
  { day: 8, name: 'Teamwork Diplomat', iconName: 'users', desc: 'De-escalated team friction with active listening' },
  { day: 9, name: 'Executive Pitcher', iconName: 'barchart3', desc: 'Presented 2-minute project progress & metrics' },
  { day: 10, name: 'Verbal Enunciator', iconName: 'target', desc: 'Cleared Tier-1 Tech accent & filler audit' },
  { day: 11, name: 'Trade-off Strategist', iconName: 'scale', desc: 'Justified architectural limits with maturity' },
  { day: 12, name: 'GD Moderator', iconName: 'mic', desc: 'Delivered structured group discussion interjections' },
  { day: 13, name: 'Database Architect', iconName: 'database', desc: 'Defended indexing, scaling, and ACID principles' },
  { day: 14, name: 'Resilient Engineer', iconName: 'medal', desc: 'Framed past technical failures into learnings' },
  { day: 15, name: 'Rapid Fire Defender', iconName: 'zap', desc: 'Passed rapid-fire university viva panel' },
  { day: 16, name: 'Technical Translator', iconName: 'globe', desc: 'Translated complex code for HR recruiters' },
  { day: 17, name: 'Global Debate Master', iconName: 'landmark', desc: 'Mastered abstract IELTS Part 3 discussion' },
  { day: 18, name: 'Placement Finalist', iconName: 'trophy', desc: 'Delivered compelling "Why Hire Me" pitch' },
  { day: 19, name: 'Stress Test Survivor', iconName: 'flame', desc: 'Withstood high-intensity hostile cross-exam' },
  { day: 20, name: 'Placement & Viva Champion', iconName: 'award', desc: 'Completed full Daily Capstone Simulation' },
];

export default function ChallengePage() {
  const router = useRouter();

  const [state, setState] = useState<ChallengeState | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [isGuestAuthModalOpen, setIsGuestAuthModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [userName, setUserName] = useState('Oratii Scholar');
  const [selectedBadgeCert, setSelectedBadgeCert] = useState<{
    badgeName: string;
    badgeIcon: string;
    badgeDescription: string;
    dayNumber: number;
    completedDate?: string;
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [drillActive, setDrillActive] = useState(false);
  const [drillSeconds, setDrillSeconds] = useState(60);
  const [drillPromptIndex, setDrillPromptIndex] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);

  const DRILL_PROMPTS = [
    "Explain your project stack & architecture in 60s without using filler words ('um', 'like', 'basically').",
    "Deliver a 60-second elevator pitch for an innovative AI tool to a executive investor.",
    "Defend your choice of database or framework in 60s against a skeptical thesis examiner.",
    "Describe a complex technical bug you solved using the STAR method in 60 seconds."
  ];

  useEffect(() => {
    setMounted(true);
    const s = getChallengeState();
    setState(s);

    const profile = getProfile();
    if (profile?.name) {
      setUserName(profile.name);
    }
  }, []);

  if (!state) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-[#F2A93B] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-extrabold text-slate-500">Loading Daily Challenge...</p>
      </div>
    );
  }

  const currentDayNum = Math.min(state.current_day, 20);
  const todayTask = DAILY_TASKS.find((t) => t.day === currentDayNum) || DAILY_TASKS[0];
  const isCompletedAll = state.current_day > 20;
  const completedCount = state.days_status.filter((d) => d.status === 'done').length;
  const latestFiller = state.filler_scores.length > 0
    ? state.filler_scores[state.filler_scores.length - 1].fillerScore
    : 1;

  const handleStartTask = async () => {
    // 1. Check Auth (Daily Challenge is FREE for all signed-in users)
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsGuestAuthModalOpen(true);
      return;
    }

    router.push(
      `/speech-coach?challengeDay=${todayTask.day}&isChallenge=true&topic=${encodeURIComponent(
        todayTask.title
      )}`
    );
  };

  const handleSkipClick = () => {
    setShowSkipModal(true);
  };

  const handleUseTokenToSkip = () => {
    setShowSkipModal(false);
    const res = skipChallengeDay(currentDayNum);
    setState({ ...res.newState });
  };

  const handleConfirmSkipWithoutToken = () => {
    setShowSkipModal(false);
    const res = skipChallengeDay(currentDayNum, true);
    setState({ ...res.newState });
  };

  const handleOpenResetModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowSkipModal(false);
    setShowResetConfirmModal(true);
  };

  const handleExecuteReset = () => {
    setShowResetConfirmModal(false);
    const reset = resetChallengeState();
    setState({ ...reset });
    window.location.reload();
  };

  // Metric averages

  const day1Score =
    state.days_status[0]?.score || (state.days_status[0]?.status === 'done' ? 75 : 0);
  const day20Score =
    state.days_status[19]?.score || (state.days_status[19]?.status === 'done' ? 92 : 0);

  return (
    <div className="w-full min-h-screen flex flex-col bg-transparent text-slate-900">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-8 animate-fade-in text-slate-900 pt-6 pb-16 px-4 sm:px-6">
      
      {/* 1. HEADER CARD WITH STREAK BADGE */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-[11px] font-bold uppercase tracking-wider mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]"></span> Daily Bootcamp
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-1">
            Daily Bootcamp
          </h1>
          <p className="text-xs sm:text-sm font-normal text-slate-600 max-w-xl">
            Eliminate &ldquo;matlab&rdquo; &amp; &ldquo;basically&rdquo; filler habits, master STAR method interviews for campus placement drives, and pass university project vivas without freezing.
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-5 py-3 rounded-2xl shadow-2xs shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#F2A93B] text-[#0F1426] flex items-center justify-center shadow-2xs font-bold">
            <Flame size={22} className="fill-[#0F1426]" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 leading-none">
              {state.streak_count} <span className="text-xs font-bold text-slate-500">Days</span>
            </div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Active Streak</span>
          </div>
        </div>
      </div>

      {/* 1.5 DAILY 60-SECOND MICRO-DRILL BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              Daily 60s Micro-Drill
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Impromptu Speech Challenge
            </h3>
            <p className="text-xs text-indigo-200/90 leading-relaxed max-w-xl">
              &ldquo;{DRILL_PROMPTS[drillPromptIndex]}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setDrillPromptIndex((prev) => (prev + 1) % DRILL_PROMPTS.length)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-200 transition-all cursor-pointer"
            >
              Shuffle Prompt
            </button>
            <button
              onClick={() => router.push(`/speech-coach?drill=60s&prompt=${encodeURIComponent(DRILL_PROMPTS[drillPromptIndex])}`)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Mic size={15} />
              Start 60s Micro-Drill
            </button>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS BAR (20 Horizontal Segments) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
          <span className="text-slate-700 text-sm font-extrabold">Overall Course Progress</span>
          <div className="flex items-center gap-3">
            <span className="text-[#1B2140] font-extrabold">
              {Math.round((completedCount / 20) * 100)}% Complete
            </span>
            <button
              type="button"
              onClick={handleOpenResetModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-extrabold transition-all shadow-2xs cursor-pointer"
              title="Reset challenge and start from Day 1"
            >
              <RotateCcw size={13} />
              <span>Reset Challenge</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-20 gap-1 sm:gap-1.5 w-full">
          {Array.from({ length: 20 }, (_, i) => {
            const dayNum = i + 1;
            const statusObj = state.days_status[i] || { status: 'pending' };
            const isToday = dayNum === currentDayNum && !isCompletedAll;

            let bgColor = 'bg-indigo-100 border-indigo-200';
            if (statusObj.status === 'done') bgColor = 'bg-emerald-500 border-emerald-600 shadow-2xs';
            else if (statusObj.status === 'skipped') bgColor = 'bg-amber-400 border-amber-500';
            else if (isToday) bgColor = 'bg-[#1B2140] border-indigo-900 animate-pulse';

            return (
              <div
                key={dayNum}
                title={`Day ${dayNum}: ${statusObj.status.toUpperCase()}`}
                className={`h-4 sm:h-5 rounded-sm border transition-all ${bgColor} ${
                  isToday ? 'ring-2 ring-[#F2A93B]/70 ring-offset-1' : ''
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-1">
          <span>Day 1</span>
          <span>Day 10</span>
          <span>Day 20</span>
        </div>
      </div>

      {/* 3. STATS ROW (3 Compact Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Latest Filler Words */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filler Word Rate</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {latestFiller} <span className="text-xs font-bold text-slate-500">per min</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Target: &lt; 2 per min</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#1B2140] flex items-center justify-center shrink-0">
            <BarChart2 size={20} />
          </div>
        </div>

        {/* Stat 2: Sessions Completed */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sessions Finished</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {completedCount} <span className="text-xs font-bold text-slate-500">/ 20</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Daily practice sessions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Stat 3: Freeze Tokens Remaining */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Streak Freeze Tokens</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {state.freeze_tokens_remaining} <span className="text-xs font-bold text-slate-500">Tokens</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Protects streak from breaking</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* 4. TODAY'S TASK CARD */}
      {!isCompletedAll ? (
        <div className="bg-white border-2 border-[#1B2140] rounded-2xl shadow-md p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-indigo-100 text-[#151930] text-[11px] font-black uppercase rounded-md border border-indigo-200">
                  Today’s Prompt
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock size={13} /> {todayTask.targetDuration}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Day {todayTask.day}: {todayTask.title}
              </h2>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {todayTask.description}. Click below to launch Speech Coach pre-configured for this task.
          </p>

          {/* Pre-Drill Guide: What to Include vs What to Cut */}
          {(todayTask.dos || todayTask.donts) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {todayTask.dos && todayTask.dos.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                    <Check size={14} className="text-emerald-700 shrink-0" />
                    <span>What to Include (Recruiter Rubric):</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                    {todayTask.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {todayTask.donts && todayTask.donts.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-rose-800 uppercase tracking-wider">
                    <X size={14} className="text-rose-700 shrink-0" />
                    <span>What NOT to Say (Cut Unwanted Fluff):</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-950 font-medium">
                    {todayTask.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold shrink-0">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleStartTask}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1B2140] hover:shadow-glow text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start recording</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleSkipClick}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-indigo-300 hover:bg-indigo-50 text-slate-700 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Skip day</span>
            </button>
          </div>
        </div>
      ) : (
        /* DAY 20 BEFORE VS AFTER SUMMARY CARD */
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-8 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Award size={26} className="text-slate-950" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black">Challenge Completed!</h2>
              <p className="text-xs text-indigo-200 font-medium">You completed all 20 days of structured public speaking practice!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/10 rounded-xl p-6 backdrop-blur-xs border border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#F2A93B] block mb-1">Day 1 Baseline Score</span>
              <div className="text-4xl font-black text-white">{day1Score}%</div>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 block mb-1">Day 20 Final Score</span>
              <div className="text-4xl font-black text-emerald-400">{day20Score}%</div>
            </div>
          </div>

          <button
            onClick={handleOpenResetModal}
            className="self-start px-6 py-3 bg-white text-slate-900 hover:bg-indigo-100 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw size={14} /> Start New Daily Cycle
          </button>
        </div>
      )}

      {/* 5. 20 BADGES & CERTIFICATES GRID */}
      <div className="bg-white border border-indigo-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Daily Badges & Certificates
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Each completed day unlocks its official badge and downloadable Oratii Certificate.
            </p>
          </div>
          <span className="text-xs font-bold text-[#1B2140] bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full self-start sm:self-center">
            {state.days_status.filter((d) => d.status === 'done').length} / 20 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CHALLENGE_BADGES.map((b) => {
            const dayStatusObj = state.days_status[b.day - 1] || { status: 'pending' };
            const isUnlocked = dayStatusObj.status === 'done';

            return (
              <div
                key={b.day}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all relative group ${
                  isUnlocked
                    ? 'bg-white border-amber-300 shadow-2xs hover:shadow-md hover:border-amber-400'
                    : 'bg-indigo-50/70 border-indigo-200 opacity-60'
                }`}
              >
                {/* Badge Day Tag */}
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isUnlocked
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-indigo-200 text-slate-500'
                  }`}
                >
                  Day {b.day}
                </span>

                {/* Badge Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 shadow-xs'
                      : 'bg-indigo-100/60 text-slate-400 border border-indigo-200'
                  }`}
                >
                  {renderChallengeBadgeIcon(b.day)}
                </div>

                {/* Badge Name & Desc */}
                <div className="flex flex-col gap-1 w-full">
                  <h3 className={`text-xs font-extrabold ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                    {b.name}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500 leading-tight line-clamp-2">
                    {b.desc}
                  </p>
                </div>

                {/* Download Certificate Action */}
                {isUnlocked ? (
                  <button
                    onClick={() =>
                      setSelectedBadgeCert({
                        badgeName: b.name,
                        badgeIcon: `Day ${b.day}`,
                        badgeDescription: b.desc,
                        dayNumber: b.day,
                        completedDate: dayStatusObj.completedAt,
                      })
                    }
                    className="w-full mt-1 px-2.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[11px] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award size={13} />
                    <span>Certificate</span>
                  </button>
                ) : (
                  <div className="w-full mt-1 px-2.5 py-1.5 bg-indigo-100 border border-indigo-200 text-slate-400 font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 cursor-not-allowed">
                    <Lock size={11} />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SKIP DAY OPTIONS MODAL */}
      {showSkipModal && mounted && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Skip Options for Day {currentDayNum}</h3>
                <p className="text-xs font-medium text-slate-500">Choose how you wish to proceed</p>
              </div>
              <button onClick={() => setShowSkipModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Option 1: Freeze Token or Skip */}
              {state.freeze_tokens_remaining > 0 ? (
                <button
                  onClick={handleUseTokenToSkip}
                  className="p-4 border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-200/60 rounded-xl transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#1B2140]">Use 1 Freeze Token</span>
                      <span className="text-[10px] font-bold bg-[#F2A93B]/20 text-[#1B2140] px-2 py-0.5 rounded-full">
                        {state.freeze_tokens_remaining} left
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-[#151930] mt-0.5">Skip today & protect active day streak.</p>
                  </div>
                  <ChevronRight size={16} className="text-[#1B2140] group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleConfirmSkipWithoutToken}
                  className="p-4 border border-amber-200 bg-amber-50/60 hover:bg-amber-100/60 rounded-xl transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-extrabold text-amber-900 block">Skip & Reset Streak to 0</span>
                    <p className="text-[11px] font-medium text-amber-700 mt-0.5">No tokens remaining. Advances to next day but resets streak.</p>
                  </div>
                  <ChevronRight size={16} className="text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Option 2: Reset & Start from Day 1 */}
              <button
                onClick={handleOpenResetModal}
                className="p-4 border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 rounded-xl transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
              >
                <div>
                  <span className="text-xs font-extrabold text-rose-900 block">Reset & Start Fresh from Day 1</span>
                  <p className="text-[11px] font-medium text-rose-700 mt-0.5">Clear challenge progress and restart from Day 1 task.</p>
                </div>
                <RotateCcw size={16} className="text-rose-600 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-indigo-100">
              <button
                onClick={() => setShowSkipModal(false)}
                className="px-5 py-2.5 border border-indigo-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-indigo-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirmModal && mounted && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Reset Challenge to Day 1?</h3>
              <p className="text-xs font-medium text-slate-600 mt-1.5 leading-relaxed">
                Are you sure you want to reset your Daily Challenge progress? All 20 daily task statuses, streak counts, and milestones will be reset back to Day 1.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 px-4 py-2.5 border border-indigo-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-indigo-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Yes, Reset to Day 1
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* OFFICIAL ORATII CERTIFICATE MODAL */}
      {selectedBadgeCert && (
        <CertificateModal
          isOpen={true}
          onClose={() => setSelectedBadgeCert(null)}
          badgeName={selectedBadgeCert.badgeName}
          badgeIcon={selectedBadgeCert.badgeIcon}
          badgeDescription={selectedBadgeCert.badgeDescription}
          userName={userName}
          dayNumber={selectedBadgeCert.dayNumber}
          completedDate={selectedBadgeCert.completedDate}
        />
      )}

      <GuestAuthModal isOpen={isGuestAuthModalOpen} onClose={() => setIsGuestAuthModalOpen(false)} featureName="Daily Challenge" />
      <InsufficientCreditsModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} requiredCredits={1} currentBalance={creditBalance} featureName="Daily Challenge" />
      </div>
      <Footer />
    </div>
  );
}
