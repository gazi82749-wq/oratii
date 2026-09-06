'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Sparkles, Video } from 'lucide-react';

export default function SlideAnalyzerMockup() {
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [scanPos, setScanPos] = useState<number>(0);

  // Fast animation cycle like Hero section (2.2s per phase)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev === 1 ? 2 : 1));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  // Laser scan line effect during Step 1
  useEffect(() => {
    if (activeStep !== 1) return;
    const scanInterval = setInterval(() => {
      setScanPos((prev) => (prev >= 100 ? 0 : prev + 6));
    }, 30);
    return () => clearInterval(scanInterval);
  }, [activeStep]);

  return (
    <div className="w-full h-full relative bg-[#F8FAFC] flex flex-col p-3.5 sm:p-5 md:p-6 overflow-hidden font-sans border border-slate-200 shadow-2xl rounded-2xl sm:rounded-3xl select-none">
      <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200/50 via-purple-100/30 to-transparent pointer-events-none"></div>

      {/* Mac Window Header Light with 2-Step Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-200/80 pb-2.5 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 shadow-xs"></div>
        </div>

        {/* 2-Step Animated Stepper Badge */}
        <div className="flex items-center gap-1 bg-slate-200/90 p-0.5 rounded-full shadow-inner">
          <button
            onClick={() => setActiveStep(1)}
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all duration-500 ease-out cursor-pointer flex items-center gap-1 ${
              activeStep === 1
                ? 'bg-indigo-600 text-white shadow-md scale-105'
                : 'text-slate-600 hover:text-slate-900 opacity-70'
            }`}
          >
            <span>1. Slide Audit</span>
            {activeStep === 1 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
          </button>

          <span className="text-[9px] text-slate-400 font-bold px-0.5">➔</span>

          <button
            onClick={() => setActiveStep(2)}
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all duration-500 ease-out cursor-pointer flex items-center gap-1 ${
              activeStep === 2
                ? 'bg-slate-900 text-white shadow-md scale-105'
                : 'text-slate-600 hover:text-slate-900 opacity-70'
            }`}
          >
            <span>2. Live Studio</span>
            {activeStep === 2 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>}
          </button>
        </div>
      </div>

      {/* Cross-Fading Content Container */}
      <div className="flex-1 relative z-10 overflow-hidden min-h-[220px]">
        {/* STEP 1: AI SLIDE AUDIT VIEW */}
        <div className={`absolute inset-0 flex flex-col justify-between gap-2.5 transition-all duration-700 ease-out ${
          activeStep === 1 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto blur-0' 
            : 'opacity-0 -translate-y-3 scale-95 pointer-events-none blur-xs'
        }`}>
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-2 rounded-xl border border-white shadow-xs text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Zap size={12} className="text-indigo-600" /> Step 1: AI Slide Audit Active
              </span>
            </div>
            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full animate-pulse">
              Deck Score: 94/100
            </span>
          </div>

          {/* Slide Analysis Grid Preview with Laser Scanner Line */}
          <div className="flex-1 bg-white rounded-xl shadow-md border border-slate-200 p-3 flex flex-col justify-between relative overflow-hidden">
            {/* Dynamic Laser Line */}
            <div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_12px_2px_rgba(99,102,241,0.8)] z-20 pointer-events-none transition-all duration-75"
              style={{ top: `${scanPos}%` }}
            />

            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
              <span className="text-[10px] font-extrabold text-slate-700">Slide Structure & Clarity Scan</span>
              <span className="text-[8px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Scanning 12 Slides...
              </span>
            </div>

            {/* Mini Slide Grid with Audit Badges */}
            <div className="grid grid-cols-4 gap-1.5 my-1">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className={`aspect-[16/10] rounded-lg border p-1 flex flex-col justify-between relative transition-all duration-500 ${
                  num === 3 ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-400 scale-[1.03]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="h-1 bg-indigo-300 rounded w-3/4 animate-pulse"></div>
                  <div className="h-0.5 bg-slate-200 rounded w-full"></div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-[7px] font-bold text-slate-400">S{num}</span>
                    <span className="text-[6px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded">OPTIMAL</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Feedback Banner */}
            <div className="bg-indigo-950 text-white p-2 rounded-lg text-[9px] flex items-center justify-between mt-1 border border-indigo-800">
              <span className="font-medium text-indigo-200 truncate flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400 shrink-0" />
                <span>Slide density optimal. Advancing to live rehearsal...</span>
              </span>
              <span className="text-[8px] font-black text-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded">
                94% Clarity
              </span>
            </div>
          </div>

          {/* Readout */}
          <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              <span className="text-[10px] font-bold text-slate-200">
                Step 1 Complete ➔ Auto-launching Live Practice
              </span>
            </div>
            <span className="text-[9px] font-extrabold text-indigo-300 uppercase tracking-wider">
              1. Audit Done
            </span>
          </div>
        </div>

        {/* STEP 2: LIVE PRESENTER STUDIO ACTIVE */}
        <div className={`absolute inset-0 p-3 sm:p-4 flex flex-col justify-between transition-all duration-700 ${
          activeStep === 2 ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}>
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-2 rounded-xl border border-white shadow-xs text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Video size={12} className="text-emerald-600" /> Step 2: Live Practice Studio Active
              </span>
            </div>
            <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              Slide 3 / 12 • 04:15
            </span>
          </div>

          {/* Slide Stage with Presenter Webcam PIP */}
          <div className="flex-1 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 rounded-xl shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between p-3.5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
              <span className="text-[10px] font-extrabold text-amber-300 truncate">Slide 3: Executive Growth Strategy</span>
              <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full animate-pulse">
                WEBCAM LIVE
              </span>
            </div>

            {/* Slide Stage Body */}
            <div className="flex justify-between items-center my-1.5 relative">
              <div className="space-y-1.5 max-w-[65%]">
                <div className="h-2.5 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-1.5 bg-indigo-200/50 rounded-full w-full"></div>
                <div className="h-1.5 bg-indigo-200/40 rounded-full w-4/5"></div>
              </div>

              {/* Webcam Presenter Picture-in-Picture Box */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-slate-900 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Presenter Webcam"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-slate-900/90 rounded text-[6px] font-bold text-emerald-400 flex items-center gap-1 border border-emerald-500/40">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span> CAM
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] font-bold text-indigo-200">
              <span className="text-emerald-400">142 WPM (Optimal Pace)</span>
              <span className="text-amber-300">0 Fillers</span>
              <span className="text-indigo-300">95% Clarity</span>
            </div>
          </div>

          {/* Readout */}
          <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-200">
                Rehearsing live with real-time vocal telemetry
              </span>
            </div>
            <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider">
              2. Live Studio
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
