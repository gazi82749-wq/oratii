'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Clock, Video } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';

export default function MockInterviewAnalyticsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/sessions?type=interview', {
          headers: {
            'authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        const json = await res.json();
        if (json && json.sessions) {
          setSessions(json.sessions);
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error('Failed to load interview analytics:', err);
        setSessions([]);
      }
      setLoading(false);
    }
    loadSessions();
  }, []);

  const total = sessions.length;
  const avgScore = total > 0 ? Math.round(sessions.reduce((s, v) => s + v.score, 0) / total) : 0;
  const avgDuration = total > 0 ? Math.round(sessions.reduce((s, v) => s + v.duration, 0) / total) : 0;
  const avgQuestions = total > 0 ? Math.round(sessions.reduce((s, v) => s + v.questionsAsked, 0) / total) : 0;

  const scoreDistribution = [
    { range: '0-20', count: sessions.filter(v => v.score < 20).length },
    { range: '20-40', count: sessions.filter(v => v.score >= 20 && v.score < 40).length },
    { range: '40-60', count: sessions.filter(v => v.score >= 40 && v.score < 60).length },
    { range: '60-80', count: sessions.filter(v => v.score >= 60 && v.score < 80).length },
    { range: '80-100', count: sessions.filter(v => v.score >= 80).length },
  ];

  const scoreTrendsData = [
    { week: 'W1', score: 0 },
    { week: 'W2', score: 0 },
    { week: 'W3', score: 0 },
    { week: 'W4', score: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mock Interview — Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aggregated insights from all mock interview practice sessions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Interviews', value: total.toString(), icon: Video, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
          { label: 'Avg. Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-[#F2A93B] dark:text-indigo-500', bg: 'bg-indigo-100 dark:bg-[#F2A93B]/20' },
          { label: 'Avg. Duration (sec)', value: avgDuration.toString(), icon: Clock, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
          { label: 'Avg. Questions', value: avgQuestions.toString(), icon: Target, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trends */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Score Trends</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Average interview scores over time</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Score (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Score Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Overall interview rating distribution</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Interviews" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
