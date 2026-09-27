'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Bell, Sparkles, CheckCircle2, ArrowRight, Zap, AlertTriangle, ShieldCheck, Play } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface InterviewPrepBreakCardProps {
  sessionId: string;
  roleTitle: string;
  mockSeriesRound?: number; // 1, 2, or 3
  weaknesses?: string[];
  suggestions?: string[];
}

export default function InterviewPrepBreakCard({
  sessionId,
  roleTitle,
  mockSeriesRound = 1,
  weaknesses = [],
  suggestions = []
}: InterviewPrepBreakCardProps) {
  const router = useRouter();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(40 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [reminderStatus, setReminderStatus] = useState<'none' | 'enabled' | 'sent'>('none');
  const [isNotifying, setIsNotifying] = useState<boolean>(false);
  const notificationFiredRef = useRef<boolean>(false);

  const currentRound = mockSeriesRound || 1;
  const nextRoundNumber = currentRound < 3 ? currentRound + 1 : 3;
  const nextRoundTitle = currentRound === 1 
    ? 'Round 2: Technical Panel' 
    : currentRound === 2 
      ? 'Round 3: STAR Method Behavioral Round' 
      : '3-Round Series Complete';

  // Initialize or resume 40-minute countdown from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = `mock_prep_target_${sessionId}`;
    let targetTimeStr = localStorage.getItem(storageKey);
    let targetTime: number;

    if (!targetTimeStr) {
      targetTime = Date.now() + 40 * 60 * 1000;
      localStorage.setItem(storageKey, targetTime.toString());
    } else {
      targetTime = parseInt(targetTimeStr, 10);
    }

    const updateTimer = () => {
      const diffSec = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      setSecondsRemaining(diffSec);

      if (diffSec <= 0) {
        setIsTimerRunning(false);
        if (!notificationFiredRef.current) {
          notificationFiredRef.current = true;
          triggerExpirationNotification();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const triggerExpirationNotification = async () => {
    // 1. Browser push notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ Your ${nextRoundTitle} is Ready!`, {
          body: `Your 40-minute preparation break for ${roleTitle} is complete. Tap to begin your interview!`,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Push notification error:', e);
      }
    }

    // 2. Email reminder trigger
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/interview/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: session?.user?.email || null,
          userName: session?.user?.user_metadata?.full_name || 'Candidate',
          roleTitle,
          nextRoundTitle,
          weaknesses
        })
      });
      setReminderStatus('sent');
    } catch (err) {
      console.warn('Failed to send reminder email:', err);
    }
  };

  const handleEnableReminder = async () => {
    setIsNotifying(true);
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setReminderStatus('enabled');
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/interview/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: session?.user?.email || null,
          userName: session?.user?.user_metadata?.full_name || 'Candidate',
          roleTitle,
          nextRoundTitle,
          weaknesses
        })
      });
      setReminderStatus('enabled');
    } catch (e) {
      console.warn('Enable reminder notice:', e);
    } finally {
      setIsNotifying(false);
    }
  };

  const handleStartNextRound = () => {
    router.push(`/interview?round=${nextRoundNumber}&role=${encodeURIComponent(roleTitle)}`);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPct = Math.round(((40 * 60 - secondsRemaining) / (40 * 60)) * 100);

  if (currentRound >= 3) {
    return (
      <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-emerald-500/40 text-white space-y-4 shadow-xl text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} /> 3-Round Mock Series Complete
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          🎉 Congratulations! You Completed the Full 3-Round Mock Series
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
          You completed Standard HR Intro (Round 1), Technical Panel (Round 2), and STAR Method Behavioral (Round 3) for <strong>{roleTitle}</strong>. Review your performance trajectory and weak spots below.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#151930] p-6 sm:p-7 rounded-3xl border border-indigo-500/40 text-white space-y-6 shadow-2xl relative overflow-hidden text-left font-sans">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Round {currentRound} Complete • 40-Min Prep Break
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
            Up Next: {nextRoundTitle}
          </span>
        </div>

        <button
          onClick={handleEnableReminder}
          disabled={isNotifying || reminderStatus === 'enabled'}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            reminderStatus === 'enabled'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              : 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border-indigo-700/60'
          }`}
        >
          <Bell size={14} className={reminderStatus === 'enabled' ? 'text-emerald-400' : 'text-amber-400'} />
          <span>{reminderStatus === 'enabled' ? '🔔 Reminder Set (Push & Email)' : 'Set 40-Min Reminder'}</span>
        </button>
      </div>

      {/* Main Grid: Left Preparation Countdown Timer & Right Weakness Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Column: 40-Minute Countdown Clock */}
        <div className="md:col-span-1 bg-slate-950 p-5 rounded-2xl border border-slate-800/90 flex flex-col items-center justify-center text-center space-y-3 relative">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <Clock size={13} className="text-amber-400" />
            Prep Break Timer
          </span>

          <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 tracking-tight drop-shadow-md">
            {formattedTimer}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            {secondsRemaining > 0
              ? 'Use this break to revise your Round 1 weaknesses before starting Round 2.'
              : '⏰ 40-Minute Prep Complete! Ready to launch next round.'}
          </p>

          <button
            onClick={handleStartNextRound}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start {nextRoundTitle} Now</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Right Column: Weakness-Based Preparation Guide for Next Round */}
        <div className="md:col-span-2 space-y-3.5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400 shrink-0" />
            <h4 className="text-base sm:text-lg font-black text-white">
              Based on Round {currentRound}, Prepare These Weaknesses for {nextRoundTitle}
            </h4>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Our AI analysis evaluated your Round {currentRound} answers. Review these specific improvement areas to score higher in <strong>{nextRoundTitle}</strong>:
          </p>

          {/* Weakness Prep Cards */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {weaknesses && weaknesses.length > 0 ? (
              weaknesses.map((w, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 text-xs flex items-start gap-2.5"
                >
                  <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-300 block mb-0.5">
                      Round {currentRound} Weakness: {w}
                    </span>
                    <p className="text-slate-300 font-medium text-[11px]">
                      Prep Action for Round 2: Re-frame your answers by giving specific engineering project examples and quantifying your results.
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                ✓ Solid Round {currentRound} performance! Review your project architecture & technical trade-offs before starting {nextRoundTitle}.
              </div>
            )}

            {/* Suggestions Checklist */}
            {suggestions && suggestions.length > 0 && (
              <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-700/40 text-xs space-y-1.5">
                <span className="font-extrabold text-indigo-300 uppercase tracking-wider text-[10px] block">
                  💡 Key Technical Preparation Checklist:
                </span>
                <ul className="space-y-1 text-slate-200 text-[11px]">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
