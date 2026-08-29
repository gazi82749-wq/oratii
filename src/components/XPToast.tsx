'use client';
import { useState, useEffect } from 'react';

// XP gain notification toast (Module 9)
export default function XPToast({ events, onComplete }) {
  const [visible, setVisible] = useState([]);

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
    <div className="xp-toast-container">
      {visible.map((event, idx) => (
        <div key={idx} className="xp-toast">
          {event.type === 'xp' && (
            <div className="bg-[#FFF9D2] text-slate-900 px-6 py-4 border-4 border-slate-900 shadow-[4px_4px_0px_#151930] flex items-center gap-4 rotate-1 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/50 border border-indigo-300 -rotate-2"></div>
              <span className="text-2xl">âš¡</span>
              <div>
                <p className="text-sm font-black uppercase tracking-widest">+{event.amount} XP</p>
                <p className="text-xs font-bold text-slate-500 font-handwriting">Total: {event.totalXP} XP</p>
              </div>
            </div>
          )}
          {event.type === 'level_up' && (
            <div className="bg-[#E0F2FE] text-slate-900 px-8 py-5 border-4 border-slate-900 shadow-[6px_6px_0px_#151930] flex items-center gap-4 -rotate-1 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/50 border border-indigo-300 rotate-2"></div>
              <span className="text-3xl">{event.icon}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Level Up!</p>
                <p className="text-lg font-black text-slate-900">{event.name}</p>
              </div>
              <span className="text-3xl">ðŸŽ‰</span>
            </div>
          )}
          {event.type === 'badge' && (
            <div className="bg-white text-slate-900 px-6 py-4 border-4 border-slate-900 shadow-[4px_4px_0px_#151930] flex items-center gap-4 rotate-2 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-indigo-100 border border-indigo-300 -rotate-3"></div>
              <span className="text-2xl">{event.badge.icon}</span>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-handwriting">Badge Unlocked!</p>
                <p className="text-sm font-black">{event.badge.name}</p>
              </div>
            </div>
          )}
          {event.type === 'streak' && (
            <div className="bg-[#FEF9C3] text-slate-900 px-6 py-4 border-4 border-slate-900 shadow-[4px_4px_0px_#151930] flex items-center gap-4 -rotate-2 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/50 border border-indigo-300 rotate-3"></div>
              <span className="text-2xl">ðŸ”¥</span>
              <p className="text-sm font-black">{event.message}</p>
            </div>
          )}
          {event.type === 'bonus' && (
            <div className="bg-[#DCFCE7] text-slate-900 px-6 py-4 border-4 border-slate-900 shadow-[4px_4px_0px_#151930] flex items-center gap-4 rotate-1 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/50 border border-indigo-300 -rotate-1"></div>
              <span className="text-2xl">ðŸŒŸ</span>
              <p className="text-sm font-black">{event.message}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
