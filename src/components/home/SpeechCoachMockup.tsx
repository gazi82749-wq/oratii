'use client';

import React, { useState } from 'react';
import { Mic, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SpeechCoachMockup() {
  const [activeMetric, setActiveMetric] = useState<'pace' | 'fillers' | 'tone'>('pace');

  return (
    <div className="w-full h-full relative bg-slate-900 text-white flex flex-col p-4 sm:p-6 overflow-hidden font-sans select-none justify-between rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Status Pill */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Speech Analysis
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 text-[11px] font-bold text-slate-400 border border-slate-700/50">
          <Mic size={12} className="text-teal-400" /> Mic Active
        </div>
      </div>

      {/* Central Visual: Waveform & Single Focal Metric */}
      <div className="my-auto py-4 flex flex-col items-center justify-center text-center relative z-10">
        {/* Animated Waveform Accents */}
        <div className="flex items-center gap-1.5 mb-4 h-12">
          {[40, 65, 30, 85, 100, 75, 45, 90, 60, 35, 80, 50, 95, 40].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-teal-500 to-emerald-400 transition-all duration-300"
              style={{
                height: `${h}%`,
                opacity: 0.4 + (i % 3) * 0.2
              }}
            />
          ))}
        </div>

        {/* Dynamic Metric Highlight */}
        {activeMetric === 'pace' && (
          <div className="flex flex-col items-center">
            <div className="text-5xl sm:text-6xl font-black text-white tracking-tight mb-1">
              145 <span className="text-2xl font-bold text-slate-400">WPM</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <CheckCircle2 size={13} /> Optimal Speaking Pace
            </div>
          </div>
        )}

        {activeMetric === 'fillers' && (
          <div className="flex flex-col items-center">
            <div className="text-5xl sm:text-6xl font-black text-amber-400 tracking-tight mb-1">
              2 <span className="text-2xl font-bold text-slate-400">Fillers</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <AlertTriangle size={13} /> Flagged &quot;basically&quot; &amp; &quot;you know&quot;
            </div>
          </div>
        )}

        {activeMetric === 'tone' && (
          <div className="flex flex-col items-center">
            <div className="text-5xl sm:text-6xl font-black text-teal-300 tracking-tight mb-1">
              94% <span className="text-2xl font-bold text-slate-400">Score</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Sparkles size={13} /> High Vocal Energy &amp; Clarity
            </div>
          </div>
        )}
      </div>

      {/* Bottom Interactive Metric Selector Bar */}
      <div className="grid grid-cols-3 gap-2 z-10 pt-2 border-t border-slate-800/80">
        {[
          { id: 'pace', label: 'Pacing', value: '145 WPM' },
          { id: 'fillers', label: 'Fillers', value: '2 Detected' },
          { id: 'tone', label: 'Clarity', value: '94% Score' }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMetric(m.id as any)}
            className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
              activeMetric === m.id
                ? 'bg-slate-800 text-white border-teal-500/60 shadow-md scale-[1.02]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.label}</div>
            <div className="text-xs font-extrabold text-white mt-0.5">{m.value}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

