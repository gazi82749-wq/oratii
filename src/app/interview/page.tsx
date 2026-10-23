// src/app/interview/page.tsx
'use client';

import React, { Suspense } from 'react';
import ChatGPTInterviewStudio from '@/components/ChatGPTInterviewStudio';

export default function InterviewPage() {
  return (
    <div className="w-full text-slate-900 animate-fade-in relative pb-6 font-sans">
      <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Loading Interview Studio...</div>}>
        <ChatGPTInterviewStudio />
      </Suspense>
    </div>
  );
}
