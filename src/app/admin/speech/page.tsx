'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Eye, Mic, TrendingUp, Target, AudioWaveform } from 'lucide-react';
import { speechReports as mockSpeechReports, type SpeechReport } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';
import { formatDate, scoreColor, scoreBg } from '@/lib/admin/utils';


export default function SpeechReportsPage() {
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      const { data } = await supabase
        .from('analysis_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((r: any) => {
          const sa = r.slide_analysis || {};
          return {
            id: r.id,
            userId: r.user_id || 'anon',
            userName: r.user_id ? `User (${r.user_id.substring(0, 6)})` : 'Speech Coach User',
            date: r.created_at || new Date().toISOString(),
            wpm: sa.wpm || 135,
            toneClarity: sa.toneClarity || r.overall_score || 82,
            fluencyScore: sa.fluencyScore || r.overall_score || 85,
            fillerWords: sa.fillerWordsCount !== undefined ? sa.fillerWordsCount : 3,
            overallRating: r.overall_score || 80,
          };
        });
        setReports(mapped);
      } else {
        setReports([]);
      }
      setLoading(false);
    }
    loadReports();
  }, []);

  const total = reports.length;
  const avgWPM = total > 0 ? Math.round(reports.reduce((s, r) => s + r.wpm, 0) / total) : 0;
  const avgTone = total > 0 ? Math.round(reports.reduce((s, r) => s + r.toneClarity, 0) / total) : 0;
  const avgFluency = total > 0 ? Math.round(reports.reduce((s, r) => s + r.fluencyScore, 0) / total) : 0;

  const filtered = useMemo(() => {
    return reports.filter((r) => r.userName.toLowerCase().includes(search.toLowerCase()));
  }, [reports, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Speech Coach — Analysis Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage all speech analysis reports (Pace, Tone, WPM, and Fluency).</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Speech Pace', value: `${avgWPM} WPM`, icon: AudioWaveform, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
          { label: 'Avg. Tone & Clarity', value: `${avgTone}%`, icon: TrendingUp, color: 'text-[#F2A93B] dark:text-indigo-500', bg: 'bg-indigo-100 dark:bg-[#F2A93B]/20' },
          { label: 'Avg. Fluency', value: `${avgFluency}%`, icon: Target, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
          { label: 'Total Speech Reports', value: reports.length.toString(), icon: Mic, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all" style={{'--stripe-color': {'text-[#F2A93B] dark:text-indigo-500':'#8b5cf6','text-blue-600 dark:text-blue-400':'#3b82f6','text-emerald-600 dark:text-emerald-400':'#10b981','text-orange-600 dark:text-orange-400':'#f97316'}[stat.color], '--stripe-color-to': {'text-[#F2A93B] dark:text-indigo-500':'#a78bfa','text-blue-600 dark:text-blue-400':'#60a5fa','text-emerald-600 dark:text-emerald-400':'#34d399','text-orange-600 dark:text-orange-400':'#fb923c'}[stat.color]} as React.CSSProperties}>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stat.value}</div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by user..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] font-medium text-slate-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-indigo-100 dark:border-slate-800">
                {['User', 'Date', 'Pace (WPM)', 'Tone & Clarity', 'Fluency', 'Filler Words', 'Overall'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className={`border-b border-indigo-50 dark:border-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 transition-colors ${filtered.indexOf(r) % 2 === 1 ? 'bg-slate-25 dark:bg-slate-900/50' : ''}`}>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-900 dark:text-white">{r.userName}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">{formatDate(r.date)}</td>
                  <td className="px-5 py-3.5"><span className="text-[13px] font-mono font-semibold text-blue-600 dark:text-blue-400">{r.wpm} WPM</span></td>
                  <td className="px-5 py-3.5"><span className={`text-[13px] font-mono font-semibold ${scoreColor(r.toneClarity)}`}>{r.toneClarity}%</span></td>
                  <td className="px-5 py-3.5"><span className={`text-[13px] font-mono font-semibold ${scoreColor(r.fluencyScore)}`}>{r.fluencyScore}%</span></td>
                  <td className="px-5 py-3.5"><span className={`text-[13px] font-mono ${r.fillerWords > 10 ? 'text-red-500' : r.fillerWords > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>{r.fillerWords}</span></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[12px] font-bold ${scoreBg(r.overallRating)} ${scoreColor(r.overallRating)}`}>
                      {r.overallRating}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
