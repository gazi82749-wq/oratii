// src/app/interview/page.tsx
'use client';

import React from 'react';
import ChatGPTInterviewStudio from '@/components/ChatGPTInterviewStudio';

export default function InterviewPage() {
  return (
    <div className="w-full flex flex-col gap-4 text-slate-900 animate-fade-in relative pb-6 font-sans">
      {/* Deep ambient glows matching Speech Coach 100% */}
      <div className="absolute top-10 right-10 w-[600px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] bg-[#F2A93B]/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Header Title (1-to-1 exact match with Speech Coach page typography & spacing) */}
      <div className="mb-3 text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[#F2A93B] text-[11px] font-extrabold uppercase tracking-widest mb-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#F2A93B] animate-pulse"></span> Job Interview AI Module
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
  );
}
