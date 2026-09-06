'use client';

import React, { useState } from 'react';
import { ArrowRight, Sparkles, Flame, Check } from 'lucide-react';

export default function ChallengeMockup() {
  const [completedDays, setCompletedDays] = useState<number>(7);
  const [xp, setXp] = useState<number>(350);
  const [justCompleted, setJustCompleted] = useState<boolean>(false);

  const handleCompleteToday = () => {
    if (completedDays < 20) {
      setCompletedDays((prev) => prev + 1);
      setXp((prev) => prev + 50);
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 2000);
    }
  };

  return (
    <div className="w-full h-full relative bg-[#F8FAFC] flex flex-col p-3.5 sm:p-5 md:p-6 overflow-hidden font-sans border border-slate-200 shadow-2xl rounded-2xl sm:rounded-3xl select-none">
      <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/60 via-teal-100/40 to-transparent pointer-events-none"></div>

      {/* Mac Window Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2.5 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
        </div>

        <div className="flex items-center gap-2">
          {justCompleted && (
            <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-bounce flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" /> +50 XP Earned!
            </span>
          )}
          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
            <Flame size={12} className="text-amber-500" /> Day {completedDays}/20 Streak
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between relative z-10 gap-3">
        {/* Streak & XP Metric Header */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-xl border border-white shadow-xs">
          <div>
            <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Active Habit Streak</div>
            <div className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-1.5">
              <span>{completedDays} Days</span>
              <Flame size={18} className="text-amber-500" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total XP Earned</div>
            <div className="text-base sm:text-lg font-black text-emerald-600">{xp} XP</div>
          </div>
        </div>

        {/* 10-Day Grid Simulator */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-[9px] font-bold text-slate-500">
            <span>Streak Progress Grid</span>
            <span>Tap any day to simulate completing habit</span>
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }).map((_, idx) => {
              const dayNum = idx + 1;
              const isDone = dayNum <= completedDays;
              return (
                <button
                  key={idx}
                  onClick={() => setCompletedDays(dayNum)}
                  className={`h-7 rounded-md text-[8px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isDone
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-400 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {isDone ? <Check size={11} className="stroke-[3]" /> : dayNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Action Prompt Card with Practice Trigger */}
        <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl border border-white shadow-md flex items-center justify-between gap-3">
          <div>
            <div className="text-[8px] font-extrabold text-indigo-600 uppercase tracking-wider mb-0.5">Today&apos;s 2-Min Practice</div>
            <div className="text-[11px] font-bold text-slate-800 italic">&quot;Deliver an inspiring 2-minute project pitch&quot;</div>
          </div>
          <button
            onClick={handleCompleteToday}
            className="px-3.5 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Complete Day</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
