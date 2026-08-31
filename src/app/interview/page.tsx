// src/app/interview/page.tsx
'use client';

import React from 'react';
import ChatGPTInterviewStudio from '@/components/ChatGPTInterviewStudio';

export default function InterviewPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-20 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-start relative overflow-hidden font-sans">
      {/* Deep ambient glows matching Speech Coach */}
      <div className="absolute top-10 right-10 w-[600px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] bg-[#F2A93B]/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* Header Title (Identical layout to Speech Coach) */}
        <div className="mb-3 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-800 text-[11px] font-extrabold uppercase tracking-widest mb-2 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span> Job Interview AI Module
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-1 flex items-center gap-2">
            <span>💼</span> AI Job Interview Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
            Practice unscripted mock interviews, behavioral STAR questions, and resume-grounded technical queries with an AI interviewer.
          </p>
        </div>

        <ChatGPTInterviewStudio />
      </div>
    </main>
  );
}
