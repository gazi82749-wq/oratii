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

  if (!mounted || !state) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-[#F2A93B] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-extrabold text-slate-500">Loading Daily Challenge...</p>
      </div>
    );
  }

  // Loop back to day 1 if they complete all 10
  const cycleDayNum = ((state.current_day - 1) % 10) + 1;
  const todayTask = DAILY_TASKS.find((t) => t.day === cycleDayNum) || DAILY_TASKS[0];

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
    <div className="w-full min-h-screen flex flex-col bg-transparent text-slate-900">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col gap-8 animate-fade-in text-slate-900 pt-6 pb-16 px-4 sm:px-6">
      
        {/* HEADER & STREAK */}
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-[11px] font-bold uppercase tracking-wider mb-3 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]"></span> Daily Habit
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-2">
              Speak Every Day.
            </h1>
            <p className="text-sm font-medium text-slate-600 max-w-xl">
              Build a simple daily habit to improve your confidence. No heavy drills, just a new simple prompt every day.
            </p>
          </div>

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

        {/* TODAY'S PROMPT */}
        <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white rounded-[32px] p-6 sm:p-10 border border-indigo-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F2A93B]/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/2 translate-y-1/2" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-900 text-[11px] font-black uppercase tracking-widest shadow-2xs mb-6 relative z-10">
            <CheckCircle2 size={14} className="text-indigo-600" />
            <span>Today&apos;s Prompt (Day {state.current_day})</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3 relative z-10 max-w-2xl">
            {todayTask.title}
          </h2>
          
          <p className="text-slate-600 font-medium text-sm sm:text-base max-w-md mx-auto mb-8 relative z-10">
            {todayTask.description}
          </p>

          <button
            onClick={handleStartTask}
            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#0F1426] hover:bg-[#1A2035] text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:-translate-y-1 transition-all group relative z-10"
          >
            <Mic size={22} className="text-[#F2A93B] group-hover:scale-110 transition-transform" />
            Practice Now
            <ArrowRight size={20} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
          
          <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest relative z-10">
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
