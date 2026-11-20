'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Compass, 
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';

export interface ActionableCoachingProps {
  type: 'speech' | 'interview' | 'presentation' | 'viva' | string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  whatToCut?: string[];
  modelAnswer?: string;
  wpm?: number;
  totalFillers?: number;
  starScore?: number;
}

export default function ActionableCoachingReport({
  type,
  strengths = [],
  weaknesses = [],
  suggestions = [],
  whatToCut = [],
  modelAnswer = '',
  wpm = 0,
  totalFillers = 0,
  starScore,
}: ActionableCoachingProps) {
  // 1. What did I do well? Fallbacks if AI returned sparse bullets
  const resolvedStrengths = strengths.length > 0 ? strengths : [
    wpm >= 120 && wpm <= 160
      ? `Maintained an engaging conversational pace of ${wpm} WPM.`
      : 'Maintained continuous vocal delivery throughout the response.',
    totalFillers <= 2
      ? `Kept filler word frequency low (${totalFillers} total detected).`
      : 'Clear articulation and audible voice projection.',
  ];

  // 2. What should I improve?
  const resolvedWeaknesses = weaknesses.length > 0 ? weaknesses : [
    wpm > 165
      ? `Speaking rate is somewhat hurried (${wpm} WPM). Deliberate pauses after sentences will improve listener retention.`
      : wpm < 115 && wpm > 0
      ? `Speaking pace is measured (${wpm} WPM). Aim for 130-150 WPM for maximum engagement.`
      : totalFillers > 3
      ? `Detected ${totalFillers} filler words. Work on breathing during pauses rather than bridging with 'um/like'.`
      : 'Add more quantifiable examples to back up key assertions.',
  ];

  // 3. How can I improve it?
  const resolvedSuggestions = suggestions.length > 0 ? suggestions : [
    totalFillers > 2
      ? 'Practice the 2-second pause technique: when reaching a transition, close your lips and take a soft breath instead of saying filler words.'
      : 'Structure your answers using the STAR format: 15% Situation, 15% Task, 50% Action, 20% Result.',
    'Anchor each core point with a metric, specific tool, or concrete outcome.',
  ];

  // 4. What should I practice next?
  const getNextPracticeRecommendation = () => {
    if (type === 'interview' || (starScore !== undefined && starScore < 75)) {
      return {
        title: 'STAR Method Response Structuring',
        desc: 'Rehearse behavioral interview probes to ensure 50% of your answer highlights specific actions you took.',
        cta: 'Practice STAR Response',
        href: '/star-method-practice',
      };
    }
    if (totalFillers > 3) {
      return {
        title: '30-Second Clean Re-Do Drill',
        desc: 'Re-speak your last answer with intentional silent pauses to eliminate repeat filler words.',
        cta: 'Run Clean Drill',
        href: '/speech-coach',
      };
    }
    if (wpm < 115 || wpm > 165) {
      return {
        title: '60-Second Speech Pacing Test',
        desc: 'Calibrate your natural conversational speed into the 130-155 WPM executive sweet-spot.',
        cta: 'Calibrate Speech Pace',
        href: '/tools/speech-speed-wpm-calculator',
      };
    }
    return {
      title: 'Daily Communication Challenge',
      desc: 'Build continuous vocal muscle memory with today\'s 60-second speech habit prompt.',
      cta: 'Continue Daily Habit',
      href: '/challenge',
    };
  };

  const nextStep = getNextPracticeRecommendation();

  return (
    <div className="bg-[#151930] border border-indigo-900/50 rounded-3xl p-5 sm:p-7 text-left space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#F2A93B] flex items-center justify-center font-bold">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
              Actionable Coaching Framework
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              4 key questions answered for your practice session
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full w-fit">
          Continuous Improvement
        </span>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: What did I do well? */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1426] border border-emerald-900/40 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 size={16} />
              <span>1. What did I do well?</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-medium leading-relaxed">
              {resolvedStrengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
          <span className="text-[10px] font-bold text-emerald-400/90 pt-1">
            Build on these strengths in future sessions
          </span>
        </div>

        {/* Card 2: What should I improve? */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1426] border border-amber-900/40 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <AlertTriangle size={16} />
              <span>2. What should I improve?</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-medium leading-relaxed">
              {resolvedWeaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
          <span className="text-[10px] font-bold text-amber-400/90 pt-1">
            Focus areas for your next rehearsal
          </span>
        </div>

        {/* Card 3: How can I improve it? */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1426] border border-indigo-900/40 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Lightbulb size={16} />
              <span>3. How can I improve it?</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-medium leading-relaxed">
              {resolvedSuggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">→</span>
                  <span>{sug}</span>
                </li>
              ))}
              {whatToCut.length > 0 && (
                <li className="pt-1 text-[11px] text-rose-300/90">
                  <span className="font-bold">Phrases to cut: </span>
                  {whatToCut.join(', ')}
                </li>
              )}
            </ul>
          </div>
          <span className="text-[10px] font-bold text-indigo-400/90 pt-1">
            Specific, actionable technique adjustments
          </span>
        </div>

        {/* Card 4: What should I practice next? */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#0F1426] to-[#0F1426] border border-[#F2A93B]/40 hover:border-[#F2A93B] transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#F2A93B] text-xs font-black uppercase tracking-wider">
              <Compass size={16} />
              <span>4. What should I practice next?</span>
            </div>
            <h4 className="text-sm font-extrabold text-white">
              {nextStep.title}
            </h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {nextStep.desc}
            </p>
          </div>

          <Link
            href={nextStep.href}
            className="w-full mt-2 py-2.5 px-3.5 bg-[#F2A93B] hover:bg-amber-500 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{nextStep.cta}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Model Benchmark Answer (if present) */}
      {modelAnswer && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1426] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
            <Target size={15} />
            <span>Executive Model Answer (How to phrase it)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium italic bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            &ldquo;{modelAnswer}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
