'use client';

import { Users, GraduationCap, Share2, Award, CheckCircle2, TrendingUp, Sparkles, MessageCircle } from 'lucide-react';

export default function PartnerAcademyMockup() {
  const students = [
    { name: 'Rahul Sharma', wpm: 144, score: '94%', cefr: 'C1 Advanced', status: 'Graded' },
    { name: 'Ananya Verma', wpm: 138, score: '91%', cefr: 'C1 Advanced', status: 'Graded' },
    { name: 'Priya Nair', wpm: 140, score: '88%', cefr: 'B2 Upper-Int', status: 'Graded' },
  ];

  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/15 blur-[80px] pointer-events-none" />

      {/* Top Bar: Batch Info & 1-Click Code */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <GraduationCap size={18} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              Placement Batch 2026 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">45 Students Enrolled • Verified Partner Hub</span>
          </div>
        </div>

        {/* WhatsApp Invite Button Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
          <MessageCircle size={13} className="fill-emerald-400 text-slate-900" />
          <span>Code: PLACEMENT26</span>
        </div>
      </div>

      {/* Analytics Metric Bar */}
      <div className="grid grid-cols-3 gap-2 my-3.5 z-10">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Class WPM</span>
          <span className="text-sm sm:text-base font-black text-amber-400 mt-0.5">141 WPM</span>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Drills Graded</span>
          <span className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">45 / 45</span>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex flex-col">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">CEFR Rating</span>
          <span className="text-sm sm:text-base font-black text-indigo-300 mt-0.5">C1 Band</span>
        </div>
      </div>

      {/* Live Batch Leaderboard Table */}
      <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 z-10 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={12} className="text-indigo-400" /> Auto-Graded Student Roster
          </span>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            Live Sync
          </span>
        </div>

        <div className="space-y-1.5">
          {students.map((st, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                  #{i + 1}
                </span>
                <span className="font-bold text-slate-200">{st.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-400">{st.wpm} WPM</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  {st.cefr}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Ribbon */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 z-10">
        <span className="flex items-center gap-1 font-semibold text-slate-300">
          <Sparkles size={13} className="text-amber-400" /> Batch Assessment: <strong className="text-amber-300">45 Active Submissions</strong>
        </span>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <CheckCircle2 size={12} /> Auto WhatsApp Sync
        </span>
      </div>
    </div>
  );
}
