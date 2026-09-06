'use client';

import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';

export default function SpeechCoachMockup() {
  const [isRecording, setIsRecording] = useState(true);
  const [pacingPreset, setPacingPreset] = useState<'normal' | 'fast' | 'slow'>('normal');
  const [selectedWord, setSelectedWord] = useState<string | null>('basically');

  const wpmValue = pacingPreset === 'normal' ? 145 : pacingPreset === 'fast' ? 185 : 115;
  const clarityScore = pacingPreset === 'normal' ? 92 : pacingPreset === 'fast' ? 78 : 84;

  return (
    <div className="w-full h-full relative bg-[#F8FAFC] flex flex-col p-3.5 sm:p-5 md:p-6 overflow-hidden font-sans border border-slate-200 shadow-2xl rounded-2xl sm:rounded-3xl select-none">
      {/* Ambient glowing radial light */}
      <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200/60 via-purple-100/30 to-transparent pointer-events-none"></div>

      {/* Mac Header with Interactive Mic Status Toggle */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-slate-200/80 pb-2.5 sm:pb-3 relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-rose-500 transition-colors shadow-xs"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-amber-400 transition-colors shadow-xs"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-emerald-500 transition-colors shadow-xs"></div>
        </div>

        <button 
          onClick={() => setIsRecording(!isRecording)}
          className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200 shadow-xs hover:bg-white transition-all cursor-pointer text-indigo-600"
        >
          {isRecording ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span>Live Mic Active</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-500">Mic Paused</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 sm:gap-4 relative z-10">
        {/* Top Metric Strip */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Overall Score */}
          <div className="flex-1 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-md border border-indigo-500/40">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 blur-xl rounded-full"></div>
            <div className="flex items-center justify-between mb-0.5 relative z-10">
              <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-indigo-200">Clarity Rating</span>
              <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">AI Realtime</span>
            </div>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-3xl sm:text-4xl font-black tracking-tighter transition-all">{clarityScore}</span>
              <span className="text-sm font-extrabold text-indigo-200">%</span>
            </div>
            <div className="w-full bg-indigo-900/50 h-1.5 rounded-full mt-2 overflow-hidden relative z-10">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500" style={{ width: `${clarityScore}%` }}></div>
            </div>
          </div>

          {/* Interactive Pacing Selector */}
          <div className="flex-[1.3] grid grid-cols-2 gap-2">
            <div className="bg-white/90 backdrop-blur-md border border-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400">Pacing (WPM)</span>
                <span className="text-[9px] text-indigo-600 font-extrabold">{pacingPreset.toUpperCase()}</span>
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight transition-all">{wpmValue}</span>
                <span className="text-[9px] font-bold text-slate-400">wpm</span>
              </div>
              {/* Interactive preset buttons */}
              <div className="flex gap-1 mt-0.5">
                {(['slow', 'normal', 'fast'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPacingPreset(p)}
                    className={`flex-1 text-[8px] font-bold py-0.5 rounded transition-all cursor-pointer ${
                      pacingPreset === p ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p === 'slow' ? '115' : p === 'normal' ? '145' : '185'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between shadow-xs">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400">Filler Words</span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-xl sm:text-2xl font-black text-rose-500 tracking-tight">3</span>
                <span className="text-[9px] font-bold text-rose-400">detected</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <span>↓ 65% vs baseline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Audio Transcript Box with Interactive Word Highlighter */}
        <div className="flex-1 bg-white/90 backdrop-blur-xl border border-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm relative flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs border border-indigo-100 shadow-xs">
                <FileText size={12} className="text-indigo-600" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">Live Audio Transcript</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Click highlighted word</span>
          </div>

          <div className="relative flex-1 pl-3 z-10 text-[10px] sm:text-xs leading-relaxed font-semibold text-slate-700">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-200 rounded-full"></div>
            <span>We&apos;ve analyzed Q3 delivery. The primary objective is to </span>
            <button
              onClick={() => setSelectedWord('basically')}
              className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer font-bold ${
                selectedWord === 'basically'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm scale-105 inline-block'
                  : 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200'
              }`}
            >
              basically
            </button>
            <span> maximize our overall output while eliminating </span>
            <button
              onClick={() => setSelectedWord('you know')}
              className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer font-bold ${
                selectedWord === 'you know'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105 inline-block'
                  : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
              }`}
            >
              you know
            </button>
            <span> unnecessary delays.</span>
          </div>

          {/* Interactive AI Coach Tip Popover */}
          {selectedWord && (
            <div className="mt-2 bg-indigo-950 text-white p-2.5 rounded-xl border border-indigo-700/60 shadow-lg flex items-start gap-2 text-[9px] sm:text-[10px] animate-fade-in z-20">
              <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-indigo-200 uppercase tracking-wider block text-[8px] mb-0.5">
                  AI Recommendation for &quot;{selectedWord}&quot;
                </span>
                <p className="text-slate-200 leading-snug">
                  Replace filler word with a deliberate 1-second silent pause to sound confident & commanding.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
