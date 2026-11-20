'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Calendar,
  Lock,
  Play
} from 'lucide-react';
import { SEVEN_DAY_JOURNEY, ChallengeState } from '@/lib/challenge';

interface DailyPracticeJourneyProps {
  challengeState?: ChallengeState | null;
  className?: string;
}

export default function DailyPracticeJourney({
  challengeState,
  className = '',
}: DailyPracticeJourneyProps) {
  const currentDay = challengeState?.current_day || 1;
  const streak = challengeState?.streak_count || 0;
  const daysStatus = challengeState?.days_status || [];

  // Count how many of the 7 days are marked as done
  const completedCount = daysStatus
    .filter(d => d.day <= 7 && d.status === 'done')
    .length;

  const progressPercent = Math.min(100, Math.round((completedCount / 7) * 100));

  return (
    <div className={`bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-emerald-700" />
            <span>7-Day Communication Journey</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Build Daily Speaking Confidence
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            One 60-90 second exercise per day. Gentle, practical, and non-punitive.
          </p>
        </div>

        {/* Progress & Streak Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-2xl">
            <Flame size={18} className="fill-amber-500 text-amber-600" />
            <div className="text-left">
              <span className="text-xs font-black text-slate-900 leading-none block">
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </span>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Streak
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-left">
            <span className="text-xs font-black text-slate-900 block">
              {completedCount} / 7 Done
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {progressPercent}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 7-Day Journey Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 pt-1">
        {SEVEN_DAY_JOURNEY.map((dayItem) => {
          const dayStatusEntry = daysStatus.find(d => d.day === dayItem.day);
          const isDone = dayStatusEntry?.status === 'done';
          const isCurrent = currentDay === dayItem.day;

          let cardBorder = 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300';
          if (isDone) {
            cardBorder = 'border-emerald-200 bg-emerald-50/40';
          } else if (isCurrent) {
            cardBorder = 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/20';
          }

          return (
            <div
              key={dayItem.day}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 group ${cardBorder}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Day {dayItem.day}
                  </span>
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
                  ) : (
                    <Circle size={14} className="text-slate-300 shrink-0" />
                  )}
                </div>

                <h4 className="text-xs font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {dayItem.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                  {dayItem.subtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {dayItem.targetDuration}
                </span>
                <Link
                  href={dayItem.actionUrl}
                  className={`text-[11px] font-extrabold inline-flex items-center gap-0.5 transition-transform ${
                    isDone
                      ? 'text-emerald-700 hover:text-emerald-900'
                      : isCurrent
                      ? 'text-indigo-600 hover:text-indigo-800 font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isDone ? 'Re-Do' : isCurrent ? 'Start' : 'Open'}
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

