'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Video, Clock, HelpCircle, BarChart3 } from 'lucide-react';
import { vivaSessions as mockVivaSessions, type VivaSession } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';
import { formatDate, formatDuration, scoreColor } from '@/lib/admin/utils';


export default function VivaSessionsPage() {
  const [search, setSearch] = useState('');
  const [sessions, setSessions] = useState<VivaSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      setLoading(true);
      const { data } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped: VivaSession[] = data.map((v: any) => ({
          id: v.id,
          userId: v.user_id || 'anon',
          userName: 'Viva Participant',
          subject: v.session_type || 'General Viva',
          date: v.created_at || new Date().toISOString(),
          questionsAsked: 5,
          score: Number(v.score) || 0,
          duration: 300,
        }));
        setSessions(mapped);
      } else {
        setSessions([]);
      }
      setLoading(false);
    }
    loadSessions();
  }, []);

  const total = sessions.length;
  const avgScore = total > 0 ? Math.round(sessions.reduce((s, v) => s + v.score, 0) / total) : 0;
  const avgDuration = total > 0 ? Math.round(sessions.reduce((s, v) => s + v.duration, 0) / total) : 0;
  const totalQuestions = sessions.reduce((s, v) => s + v.questionsAsked, 0);

  const filtered = useMemo(() => {
    return sessions.filter((v) =>
      v.userName.toLowerCase().includes(search.toLowerCase()) ||
      v.subject.toLowerCase().includes(search.toLowerCase())
    );
  }, [sessions, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Viva AI — Sessions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All viva practice sessions across the platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: sessions.length.toString(), icon: Video, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-500/20' },
          { label: 'Avg. Score', value: `${avgScore}%`, icon: BarChart3, color: 'text-[#F2A93B] dark:text-indigo-500', bg: 'bg-indigo-100 dark:bg-[#F2A93B]/20' },
          { label: 'Avg. Duration', value: formatDuration(avgDuration), icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
          { label: 'Total Questions', value: totalQuestions.toString(), icon: HelpCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stat.value}</div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search by user or subject..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-indigo-100 dark:border-slate-800">
                {['User', 'Subject', 'Date', 'Questions', 'Score', 'Duration'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-indigo-50 dark:border-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-900 dark:text-white">{v.userName}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">{v.subject}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">{formatDate(v.date)}</td>
                  <td className="px-5 py-3.5 text-[13px] font-mono text-slate-700 dark:text-indigo-300">{v.questionsAsked}</td>
                  <td className="px-5 py-3.5"><span className={`text-[13px] font-mono font-semibold ${scoreColor(v.score)}`}>{v.score}%</span></td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">{formatDuration(v.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
