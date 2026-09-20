'use client';

import React from 'react';
import { Video, CheckCircle2 } from 'lucide-react';

export default function SlideAnalyzerMockup() {
  return (
    <div className="w-full h-full relative bg-slate-950 text-white flex flex-col p-4 sm:p-5 overflow-hidden font-sans select-none justify-between rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl">
      {/* Subtle HUD Header */}
      <div className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">Presentation Practice Studio</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Slide 03 / 12
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
            45s spent
          </span>
        </div>
      </div>

      {/* Main Slide Stage + Camera PIP */}
      <div className="my-auto py-3 relative z-10">
        <div className="w-full aspect-[16/9] rounded-xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between shadow-inner">
          {/* Slide Header */}
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Architecture Overview
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-white">
              Scalable Microservices &amp; Real-time AI Pipeline
            </h4>
          </div>

          {/* Slide Mock Blocks */}
          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="h-10 rounded bg-slate-800/60 border border-slate-700/50 p-1.5 flex flex-col justify-between">
              <div className="h-1.5 bg-slate-600 rounded w-3/4" />
              <div className="h-1 bg-slate-700 rounded w-1/2" />
            </div>
            <div className="h-10 rounded bg-slate-800/60 border border-slate-700/50 p-1.5 flex flex-col justify-between">
              <div className="h-1.5 bg-slate-600 rounded w-2/3" />
              <div className="h-1 bg-slate-700 rounded w-1/3" />
            </div>
            <div className="h-10 rounded bg-slate-800/60 border border-slate-700/50 p-1.5 flex flex-col justify-between">
              <div className="h-1.5 bg-slate-600 rounded w-4/5" />
              <div className="h-1 bg-slate-700 rounded w-1/2" />
            </div>
          </div>

          {/* Camera PIP overlay */}
          <div className="absolute bottom-3 right-3 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Presenter Webcam Feed"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-slate-950/80 rounded text-[7px] font-bold text-emerald-400 flex items-center gap-0.5">
              <Video size={8} /> LIVE
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Analysis HUD Footer */}
      <div className="grid grid-cols-3 gap-2 z-10 pt-2 border-t border-slate-800/80 text-[11px]">
        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 p-2 rounded-xl">
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-semibold uppercase">Pacing</div>
            <div className="font-extrabold text-white">Good Pacing</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 p-2 rounded-xl">
          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-semibold uppercase">Timing</div>
            <div className="font-extrabold text-white">45s / slide</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 p-2 rounded-xl">
          <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
          <div>
            <div className="text-[9px] text-slate-400 font-semibold uppercase">Visuals</div>
            <div className="font-extrabold text-white">Optimal Density</div>
          </div>
        </div>
      </div>
    </div>
  );
}

