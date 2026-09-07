'use client';

import { useState } from 'react';
import { Sparkles, Mic, Zap, Flame, Target, ArrowRight, Award, CheckCircle2, TrendingUp, Share2 } from 'lucide-react';
import Link from 'next/link';

interface WeeklyDigestProps {
  userName?: string;
  totalDrills?: number;
  avgWpm?: number;
  fillersReduced?: number;
  streakDays?: number;
  xpTotal?: number;
}

export default function WeeklyProgressDigest({
  userName = 'Speaker',
  totalDrills = 4,
  avgWpm = 142,
  fillersReduced = 16,
  streakDays = 5,
  xpTotal = 850
}: WeeklyDigestProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const summaryText = `📊 My Weekly Oratii Speaking Report:\n🎤 ${totalDrills} Practice Drills\n⚡ ${avgWpm} WPM (Optimal Pacing)\n🚫 ${fillersReduced} Filler Words Eliminated\n🔥 ${streakDays}-Day Streak!`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#151930] via-[#1B2140] to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-white/10">
            <Sparkles size={13} className="text-amber-400" /> Grammarly-Style Weekly Report (100% Free)
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Weekly Progress Digest for {userName}
          </h3>
        </div>

        <button
          onClick={handleShare}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-slate-200 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Share2 size={14} className="text-amber-400" />
          {copied ? 'Report Copied!' : 'Share Report'}
        </button>
      </div>

      {/* 4 Grammarly-Style Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-6 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Mic size={13} className="text-indigo-400" /> Drills Done
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">{totalDrills}</div>
          <span className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Active Practitioner
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap size={13} className="text-indigo-400" /> Vocal Pacing
          </span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-2">{avgWpm} WPM</div>
          <span className="text-[11px] font-bold text-indigo-300 mt-1">Optimal Cadence</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Target size={13} className="text-emerald-400" /> Fillers Defeated
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">-{fillersReduced}</div>
          <span className="text-[11px] font-bold text-emerald-400 mt-1">Cleaner Delivery</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Flame size={13} className="text-amber-400" /> Streak &amp; XP
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">{streakDays}d 🔥</div>
          <span className="text-[11px] font-bold text-amber-300 mt-1">{xpTotal} XP Earned</span>
        </div>
      </div>

      {/* Growth Highlight Card */}
      <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-4.5 mb-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Award size={13} className="text-indigo-400" /> Top Weekly Growth
          </span>
          <p className="text-sm font-extrabold text-slate-100">
            Your vocal pacing steadiness improved by +14% this week!
          </p>
        </div>
        <Link
          href="/speech-coach"
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-full transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          Start New Drill <ArrowRight size={14} />
        </Link>
      </div>

      <div className="text-[11px] text-slate-400 font-medium text-center relative z-10">
        💡 <strong>AI Coach Tip:</strong> Try pausing for 1.5 seconds after main points during technical Q&amp;A drills to project composure.
      </div>
    </div>
  );
}
