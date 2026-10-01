'use client';

import { Sparkles, Video, HelpCircle, Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminVivaDefensePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Viva Defense Examiner</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
              Coming Soon in Presentation Practice
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Interactive AI Viva Defense Examiner integrated with Presentation Practice & Slide Deck evaluations.
          </p>
        </div>
        <Link
          href="/admin/ppt"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={14} /> Back to PPT Slide Decks
        </Link>
      </div>

      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-8 shadow-xl border border-indigo-700/50">
        <div className="max-w-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Viva Defense AI Integration</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Viva Defense is designed as an extension of Presentation Practice. After submitting slide decks, students defend their research against an AI Examiner panel with real-time follow-up questioning.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">v1 Status</div>
              <div className="text-lg font-black mt-1">Presentation Decks Live</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">v2 Roadmap</div>
              <div className="text-lg font-black mt-1">Viva Audio Q&A</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Mock Interview</div>
              <div className="text-lg font-black mt-1">Fully Live in v1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
