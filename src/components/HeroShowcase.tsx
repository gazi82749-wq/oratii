'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Video, Briefcase, CheckCircle2 } from 'lucide-react';

const modules = [
  { id: 'presentation', label: 'Presentation Practice', icon: Video },
  { id: 'speech', label: 'Speech Coach', icon: Mic },
  { id: 'interview', label: 'AI Mock Interviewer', icon: Briefcase }
];

export default function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const cycleNext = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % modules.length);
      setIsFading(false);
    }, 350);
  }, []);

  useEffect(() => {
    const timer = setInterval(cycleNext, 4500);
    return () => clearInterval(timer);
  }, [cycleNext]);

  const current = modules[activeIndex];

  return (
    <div className="w-full relative group aspect-[16/10] sm:aspect-[16/10]">
      {/* Dynamic ambient glow using Oratii gold accent */}
      <div className="absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(242,169,59,0.14),_transparent_70%)] blur-2xl pointer-events-none" />

      {/* Main Product Frame - Light Theme Matching Section Styling */}
      <div className="w-full h-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(15,20,38,0.08)] p-4 sm:p-6 flex flex-col justify-between text-slate-900 relative overflow-hidden select-none">
        
        {/* Header HUD with Interactive & Auto-Cycling Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">Live Practice Studio</span>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex items-center bg-slate-100/90 border border-slate-200/80 rounded-xl p-1 gap-1">
            {modules.map((m, i) => {
              const Icon = m.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setIsFading(true);
                    setTimeout(() => {
                      setActiveIndex(i);
                      setIsFading(false);
                    }, 200);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0F1426] text-[#F2A93B] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-[#F2A93B]' : 'text-slate-400'} />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Animated Feature Stage */}
        <div className="my-auto py-2 relative z-10 flex-1 flex flex-col justify-center overflow-hidden">
          <div className={`w-full h-full rounded-2xl bg-slate-50/90 border border-slate-200/80 p-4 sm:p-5 relative flex flex-col justify-between shadow-xs transition-all duration-500 ${
            isFading ? 'opacity-0 scale-[0.98] blur-xs' : 'opacity-100 scale-100 blur-0'
          }`}>
            
            {/* FRAME 1: Presentation & Viva Studio */}
            {current.id === 'presentation' && (
              <>
                <div>
                  <div className="text-xs font-bold text-[#D98200] uppercase tracking-widest mb-1 flex items-center justify-between">
                    <span>Executive Strategy Pitch</span>
                    <span className="text-[10px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">Slide 03 / 12</span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-black text-[#0F1426] tracking-tight">
                    Scalable AI Telemetry &amp; Real-time Vocal Coaching
                  </h3>
                </div>

                <div className="space-y-2 my-2 max-w-[65%]">
                  <div className="h-2 bg-amber-200/80 rounded-full w-4/5" />
                  <div className="h-2 bg-amber-100 rounded-full w-full" />
                </div>

                <div className="absolute bottom-3 right-3 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#F2A93B] shadow-lg bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    alt="Presenter Webcam Feed"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-slate-950/90 rounded text-[7px] font-bold text-emerald-400 flex items-center gap-1 border border-emerald-500/40">
                    <Video size={8} /> LIVE
                  </div>
                </div>
              </>
            )}

            {/* FRAME 2: Speech Coach */}
            {current.id === 'speech' && (
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Live Vocal Analysis</span>
                  <span className="text-[10px] font-extrabold text-teal-900 bg-teal-100/80 border border-teal-300 px-2.5 py-0.5 rounded-full">
                    Microphone Active
                  </span>
                </div>

                <div className="my-auto text-center py-2">
                  <div className="flex justify-center items-center gap-1 mb-2 h-8">
                    {[40, 70, 30, 90, 100, 60, 45, 80, 55, 35, 85].map((h, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 rounded-full bg-gradient-to-t from-teal-500 to-emerald-400"
                        style={{ height: `${h}%`, opacity: 0.6 + (idx % 3) * 0.15 }}
                      />
                    ))}
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-[#0F1426] tracking-tight">
                    145 <span className="text-xl font-bold text-slate-500">WPM</span>
                  </div>
                  <div className="text-xs font-bold text-teal-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-teal-600" /> Optimal Speaking Speed
                  </div>
                </div>
              </div>
            )}

            {/* FRAME 3: AI Voice Mock Interviewer */}
            {current.id === 'interview' && (
              <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">AI Interviewer Probe</span>
                  <span className="text-[10px] font-extrabold text-indigo-950 bg-indigo-100/90 border border-indigo-300 px-2.5 py-0.5 rounded-full">
                    STAR Method Audit
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 italic my-2">
                  &quot;Tell me about a complex system architecture decision you made under deadline pressure.&quot;
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-200">
                  <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-indigo-800 font-bold block">Structure — Strong</span>
                    <span className="text-slate-500 font-medium">STAR method followed</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-amber-800 font-bold block">Score — 92%</span>
                    <span className="text-slate-500 font-medium">High Technical Depth</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Minimal Metric Strip / Telemetry Display */}
        <div className="grid grid-cols-3 gap-2 z-10 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
            <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Pacing</div>
              <div className="font-extrabold text-[#0F1426]">145 WPM • Optimal</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Fillers</div>
              <div className="font-extrabold text-[#0F1426]">0 Detected</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
            <CheckCircle2 size={16} className="text-[#D98200] shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Clarity</div>
              <div className="font-extrabold text-[#0F1426]">Clarity 94%</div>
            </div>
          </div>
        </div>

        {/* Bottom Auto-Cycle Progress Track */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
          <div
            key={activeIndex}
            className="h-full bg-[#F2A93B] transition-all duration-[4500ms] ease-linear"
            style={{ width: '100%' }}
          />
        </div>

      </div>
    </div>
  );
}
