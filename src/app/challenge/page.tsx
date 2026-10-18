'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, ArrowRight, CheckCircle2, Mic } from 'lucide-react';
import {
  getChallengeState,
  ChallengeState,
  DAILY_TASKS
} from '@/lib/challenge';
import { getProfile } from '@/lib/storage';
import GuestAuthModal from '@/components/GuestAuthModal';
import { supabase } from '@/lib/supabaseClient';
import Footer from '@/components/Footer';

export default function ChallengePage() {
  const router = useRouter();
  const [state, setState] = useState<ChallengeState | null>(null);
  const [isGuestAuthModalOpen, setIsGuestAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(getChallengeState());
  }, []);

  // Loop back to day 1 if they complete all 10 (fallback to Day 1 during SSR)
  const currentDay = state?.current_day ?? 1;
  const cycleDayNum = ((currentDay - 1) % 10) + 1;
  const todayTask = DAILY_TASKS.find((t) => t.day === cycleDayNum) || DAILY_TASKS[0];
  const streakCount = state?.streak_count ?? 0;

  const handleStartTask = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsGuestAuthModalOpen(true);
      return;
    }
    router.push(
      `/speech-coach?challengeDay=${todayTask.day}&isChallenge=true&topic=${encodeURIComponent(todayTask.title)}`
    );
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-transparent text-slate-900 font-sans">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col gap-8 animate-fade-in text-slate-900 pt-6 pb-16 px-4 sm:px-6">
      
        {/* HEADER & STREAK (Matching Emerald Habit Theme) */}
        <div className="w-full bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-[#F8FAFC] border border-emerald-200/80 rounded-2xl sm:rounded-3xl shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-[11px] font-black uppercase tracking-widest mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> Daily Habit Building
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0F1426] leading-tight mb-2">
              Speak Every Day.
            </h1>
            <p className="text-xs sm:text-base font-medium text-slate-700 max-w-xl leading-relaxed">
              Build a simple daily habit to improve your confidence. No heavy drills, just a new simple prompt every day.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs border border-emerald-200 px-5 py-3.5 rounded-2xl shadow-2xs shrink-0 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs font-bold">
              <Flame size={22} className="fill-white" />
            </div>
            <div>
              <div className="text-xl font-black text-[#0F1426] leading-none">
                {streakCount} <span className="text-xs font-bold text-slate-500">Days</span>
              </div>
              <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">Active Streak</span>
            </div>
          </div>
        </div>

        {/* TODAY'S PROMPT (Matching Emerald Theme) */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white rounded-[32px] p-6 sm:p-10 border border-emerald-200/80 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-300/15 rounded-full blur-3xl pointer-events-none transform -translate-x-1/2 translate-y-1/2" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-[11px] font-black uppercase tracking-widest shadow-2xs mb-6 relative z-10">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Today&apos;s Prompt (Day {currentDay})</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#0F1426] mb-3 relative z-10 max-w-2xl tracking-tight">
            {todayTask.title}
          </h2>
          
          <p className="text-slate-700 font-medium text-sm sm:text-base max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
            {todayTask.description}
          </p>

          <button
            onClick={handleStartTask}
            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all group relative z-10 cursor-pointer"
          >
            <Mic size={22} className="text-white group-hover:scale-110 transition-transform" />
            <span>Practice Now</span>
            <ArrowRight size={20} className="text-emerald-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
          
          <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest relative z-10">
            Target: {todayTask.targetDuration}
          </p>
        </div>

      </div>

      <GuestAuthModal
        isOpen={isGuestAuthModalOpen}
        onClose={() => setIsGuestAuthModalOpen(false)}
        featureName="Daily Challenge"
      />
      <Footer />
    </div>
  );
}
