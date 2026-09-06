'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function VivaDefenseMockup() {
  const sampleQuestions = [
    {
      q: 'You mentioned a 15% efficiency gain on slide 4. How was this baseline calculated?',
      gap: 'Quantitative Baseline Validation',
      difficulty: 'Hard'
    },
    {
      q: 'What risk mitigation strategy exists if server latency spikes above 200ms during peak load?',
      gap: 'Architectural Resilience',
      difficulty: 'Expert'
    },
    {
      q: 'How does your AI model prevent hallucinations during domain-specific medical transcription?',
      gap: 'Accuracy Guarantee',
      difficulty: 'Medium'
    }
  ];

  const [qIndex, setQIndex] = useState<number>(0);
  const activeQ = sampleQuestions[qIndex];

  return (
    <div className="w-full h-full relative bg-[#F8FAFC] flex flex-col p-3.5 sm:p-5 md:p-6 overflow-hidden font-sans border border-slate-200 shadow-2xl rounded-2xl sm:rounded-3xl select-none group">
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-200/60 via-violet-100/40 to-transparent pointer-events-none"></div>

      {/* Mac Window Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2.5 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
        </div>

        <button
          onClick={() => setQIndex((prev) => (prev + 1) % sampleQuestions.length)}
          className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1"
        >
          <Sparkles size={11} /> Next AI Question
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between relative z-10 gap-3">
        {/* AI Defense Panel Core */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-3 rounded-xl border border-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md ring-2 ring-indigo-200 relative">
              AI
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">AI Jury Simulator</div>
              <div className="text-[9px] font-semibold text-indigo-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Evaluating Defense Delivery
              </div>
            </div>
          </div>

          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            {activeQ.difficulty} Defense
          </span>
        </div>

        {/* Live Audio Equalizer Waveform */}
        <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-between shadow-inner border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Listening...</span>
          </div>
          <div className="flex items-center gap-1 h-6">
            {[40, 75, 45, 90, 60, 30, 95, 50, 80, 40, 85, 55, 35, 70, 50].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-indigo-400 to-purple-400 rounded-full animate-waveform"
                style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Interactive Question Display Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-4 rounded-xl border border-slate-700 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-indigo-300">
              Identified Gap: {activeQ.gap}
            </span>
            <span className="text-[8px] font-bold text-amber-400">Question {qIndex + 1}/3</span>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-100 leading-relaxed italic">
            &quot;{activeQ.q}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
