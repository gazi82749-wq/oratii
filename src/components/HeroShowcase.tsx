'use client';

import React from 'react';
import { Video, CheckCircle2 } from 'lucide-react';

export default function HeroShowcase() {
  return (
    <div className="w-full relative group aspect-[16/10] sm:aspect-[16/10]">
      {/* Dynamic ambient glow using Oratii gold accent */}
      <div className="absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(242,169,59,0.18),_transparent_70%)] blur-2xl pointer-events-none" />

      {/* Main Product Frame - Minimal framing */}
      <div className="w-full h-full bg-[#0F1426] rounded-2xl sm:rounded-3xl border border-slate-800 shadow-[0_25px_60px_-15px_rgba(15,20,38,0.5)] p-4 sm:p-6 flex flex-col justify-between text-white relative overflow-hidden select-none">
        
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-slate-800/90 pb-3 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Presentation Practice Studio</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              Slide 03 / 12
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[#F2A93B]">
              45s spent
            </span>
          </div>
        </div>

        {/* Center Presentation Stage & Camera PIP */}
        <div className="my-auto py-2 relative z-10 flex-1 flex flex-col justify-center">
          <div className="w-full h-full rounded-xl bg-slate-900/90 border border-slate-800 p-5 relative overflow-hidden flex flex-col justify-between shadow-inner">
            {/* Slide Mock Title */}
            <div>
              <div className="text-xs font-bold text-[#F2A93B] uppercase tracking-widest mb-1">
                Executive Strategy Pitch
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                Scalable AI Telemetry &amp; Real-time Vocal Coaching
              </h3>
            </div>

            {/* Slide Body Visual Lines */}
            <div className="space-y-2 my-3 max-w-[70%]">
              <div className="h-2 bg-slate-700/80 rounded-full w-4/5" />
              <div className="h-2 bg-slate-700/50 rounded-full w-full" />
              <div className="h-2 bg-slate-700/30 rounded-full w-2/3" />
            </div>

            {/* Presenter Camera PIP */}
            <div className="absolute bottom-4 right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-[#F2A93B] shadow-2xl bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                alt="Presenter Webcam Feed"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-950/80 rounded text-[8px] font-bold text-emerald-400 flex items-center gap-1 border border-emerald-500/40">
                <Video size={10} /> CAM
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Metric Strip: 145 WPM • Optimal pace • Clarity 92% */}
        <div className="grid grid-cols-3 gap-2 z-10 pt-3 border-t border-slate-800/90 text-xs">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-xl">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Pacing</div>
              <div className="font-extrabold text-white">145 WPM • Optimal</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-xl">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Pacing Score</div>
              <div className="font-extrabold text-white">Good Pacing</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-xl">
            <CheckCircle2 size={16} className="text-[#F2A93B] shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Clarity</div>
              <div className="font-extrabold text-white">Clarity 92%</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

