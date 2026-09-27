// src/app/interview/page.tsx
'use client';

import React, { Suspense } from 'react';
import ChatGPTInterviewStudio from '@/components/ChatGPTInterviewStudio';

export default function InterviewPage() {
  return (
    <div className="w-full flex flex-col gap-4 text-slate-900 animate-fade-in relative pb-6 font-sans">
      {/* Header Title with Landing Page Indigo/Blue Theme */}
      <div className="mb-3 text-left bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-[#F8FAFC] border border-indigo-200/80 p-5 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xs">
        {/* Soft pulsing background aura matching landing page */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100/90 border border-indigo-300 text-indigo-950 text-[11px] font-black uppercase tracking-widest mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span> 3-Round Placement Campaign
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0F1426] tracking-tight mb-1.5">
            3-Round AI Mock Interview Campaign
          </h1>
          <p className="text-xs sm:text-base text-slate-700 font-medium max-w-2xl leading-relaxed">
            Practice full placement drives across 3 sequential rounds: Standard HR Warmup &rarr; Technical Panel Deep-Dive &rarr; STAR Method Behavioral Probe with 40-minute prep breaks &amp; weakness feedback.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Loading Interview Studio...</div>}>
        <ChatGPTInterviewStudio />
      </Suspense>
    </div>
  );
}
