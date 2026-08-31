// src/app/interview/page.tsx
'use client';

import React from 'react';
import ChatGPTInterviewStudio from '@/components/ChatGPTInterviewStudio';

export default function InterviewPage() {
  return (
    <main className="min-h-screen bg-[#0B0E27] text-slate-100 pt-24 sm:pt-32 pb-12 sm:pb-16 px-2.5 sm:px-6 lg:px-8 flex flex-col justify-start sm:justify-center relative overflow-hidden font-sans">
      {/* Landing Page Animated Mesh Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-900/20 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-purple-900/15 blur-[140px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto my-auto">
        <ChatGPTInterviewStudio />
      </div>
    </main>
  );
}
