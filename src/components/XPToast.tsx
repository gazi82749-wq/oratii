'use client';
import { useState, useEffect } from 'react';
import { Zap, Trophy, Award, Flame, Sparkles } from 'lucide-react';

interface ToastEvent {
  type: 'xp' | 'level_up' | 'badge' | 'streak' | 'bonus';
  amount?: number;
  totalXP?: number;
  icon?: string;
  name?: string;
  badge?: { icon?: string; name: string };
  message?: string;
}

interface XPToastProps {
  events?: ToastEvent[];
  onComplete?: () => void;
}

export default function XPToast({ events, onComplete }: XPToastProps) {
  const [visible, setVisible] = useState<ToastEvent[]>([]);

  useEffect(() => {
    if (events && events.length > 0) {
      setVisible(events);
      const timer = setTimeout(() => {
        setVisible([]);
        onComplete?.();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [events, onComplete]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {visible.map((event, idx) => (
        <div 
          key={idx} 
          className="pointer-events-auto transform transition-all duration-300 animate-slide-up"
        >
          {event.type === 'xp' && (
            <div className="bg-white/95 backdrop-blur-md text-slate-900 px-5 py-3.5 rounded-2xl border border-amber-200/80 shadow-lg shadow-amber-500/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#F2A93B] shrink-0">
                <Zap size={20} className="fill-amber-400 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">+{event.amount} XP Earned</p>
                <p className="text-xs text-slate-500 font-medium">Total Balance: {event.totalXP} XP</p>
              </div>
            </div>
          )}

          {event.type === 'level_up' && (
            <div className="bg-[#151930] text-white px-6 py-4 rounded-2xl border border-indigo-900/40 shadow-xl shadow-indigo-950/20 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-[#F2A93B] shrink-0">
                <Trophy size={22} className="text-[#F2A93B]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#F2A93B]">Level Up!</p>
                <p className="text-base font-black text-white">{event.name}</p>
              </div>
              <Sparkles size={18} className="text-amber-400 ml-auto animate-pulse" />
            </div>
          )}

          {event.type === 'badge' && (
            <div className="bg-white/95 backdrop-blur-md text-slate-900 px-5 py-3.5 rounded-2xl border border-indigo-200/80 shadow-lg shadow-indigo-500/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shrink-0">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Badge Unlocked</p>
                <p className="text-sm font-bold text-slate-900">{event.badge?.name}</p>
              </div>
            </div>
          )}

          {event.type === 'streak' && (
            <div className="bg-white/95 backdrop-blur-md text-slate-900 px-5 py-3.5 rounded-2xl border border-orange-200/80 shadow-lg shadow-orange-500/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-500 shrink-0">
                <Flame size={20} className="fill-orange-400 text-orange-500" />
              </div>
              <p className="text-sm font-bold text-slate-900">{event.message}</p>
            </div>
          )}

          {event.type === 'bonus' && (
            <div className="bg-white/95 backdrop-blur-md text-slate-900 px-5 py-3.5 rounded-2xl border border-emerald-200/80 shadow-lg shadow-emerald-500/10 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
                <Sparkles size={20} />
              </div>
              <p className="text-sm font-bold text-slate-900">{event.message}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
