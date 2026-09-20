'use client';

import React from 'react';
import { HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VivaDefenseMockup() {
  return (
    <div className="w-full h-full relative bg-slate-950 text-white flex flex-col p-4 sm:p-5 overflow-hidden font-sans select-none justify-between rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl">
      {/* Header Badge */}
      <div className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-slate-200">Viva &amp; Academic Defense Simulator</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
          Q&amp;A Round
        </span>
      </div>

      {/* Examiner Question Box */}
      <div className="my-auto space-y-3 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest mb-1">
            Examiner Question
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-100">
            &quot;Why did you choose this microservices architecture over a modular monolith?&quot;
          </p>
        </div>

        {/* User Answer Indicator */}
        <div className="pl-3 border-l-2 border-emerald-400 text-xs font-medium text-slate-300">
          <div className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider mb-0.5">Your Response</div>
          &quot;We separated audio processing and slide rendering to prevent thread blocking during peak load...&quot;
        </div>
      </div>

      {/* Concise Feedback Grid */}
      <div className="grid grid-cols-3 gap-2 z-10 pt-2 border-t border-slate-800/80 text-[11px]">
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-xl">
          <div className="flex items-center gap-1 text-emerald-400 font-bold mb-0.5">
            <CheckCircle2 size={12} /> Strong
          </div>
          <div className="text-[9px] text-slate-400 font-semibold">Technical Reasoning</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-xl">
          <div className="flex items-center gap-1 text-emerald-400 font-bold mb-0.5">
            <CheckCircle2 size={12} /> Clear
          </div>
          <div className="text-[9px] text-slate-400 font-semibold">Explanation</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-xl">
          <div className="flex items-center gap-1 text-amber-400 font-bold mb-0.5">
            <AlertCircle size={12} /> Improve
          </div>
          <div className="text-[9px] text-slate-400 font-semibold">Depth &amp; Benchmarks</div>
        </div>
      </div>
    </div>
  );
}

