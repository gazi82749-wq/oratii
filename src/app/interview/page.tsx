// src/app/interview/page.tsx
'use client';

import React, { Suspense } from 'react';
import ChatGPTInterviewStudio from '@/components/ChatGPTInterviewStudio';

export default function InterviewPage() {
  return (
    <div className="w-full flex flex-col gap-4 text-slate-900 animate-fade-in relative pb-6 font-sans">
      {/* Header Title */}
      <div className="mb-3 text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-[11px] font-bold uppercase tracking-wider mb-2 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]"></span> 3-Round Placement Campaign
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          3-Round AI Mock Interview Campaign
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-xl">
          Practice full placement drives across 3 sequential rounds: Standard HR Warmup &rarr; Technical Panel Deep-Dive &rarr; STAR Method Behavioral Probe with 40-minute prep breaks &amp; weakness feedback.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Interview Studio...</div>}>
        <ChatGPTInterviewStudio />
      </Suspense>
    </div>
  );
}
