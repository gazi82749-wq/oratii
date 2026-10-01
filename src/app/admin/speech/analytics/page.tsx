'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, AudioWaveform, Mic } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';

export default function SpeechAnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function loadReports() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/sessions?type=speech', {
          headers: {
            'authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        const json = await res.json();
        if (json && json.sessions) {
          setReports(json.sessions);
        } else {
          setReports([]);
        }
      } catch (err) {
        console.error('Failed to load speech analytics:', err);
        setReports([]);
      }
    }
    loadReports();
  }, []);

  const total = reports.length;
  const avgWPM = total > 0 ? Math.round(reports.reduce((s, r) => s + (r.wpm || 0), 0) / total) : 0;
  const avgTone = total > 0 ? Math.round(reports.reduce((s, r) => s + (r.toneClarity || 0), 0) / total) : 0;
  const avgFluency = total > 0 ? Math.round(reports.reduce((s, r) => s + (r.fluencyScore || 0), 0) / total) : 0;
  const avgFillerWords = total > 0 ? Math.round(reports.reduce((s, r) => s + (r.fillerWords || 0), 0) / total) : 0;

  const scoreDistribution = [
    { range: '0-20', count: reports.filter(r => (r.overallRating || 0) < 20).length },
    { range: '20-40', count: reports.filter(r => (r.overallRating || 0) >= 20 && (r.overallRating || 0) < 40).length },
    { range: '40-60', count: reports.filter(r => (r.overallRating || 0) >= 40 && (r.overallRating || 0) < 60).length },
    { range: '60-80', count: reports.filter(r => (r.overallRating || 0) >= 60 && (r.overallRating || 0) < 80).length },
    { range: '80-100', count: reports.filter(r => (r.overallRating || 0) >= 80).length },
  ];

  const scoreTrendsData = ['W1', 'W2', 'W3', 'W4'].map((week, idx) => {
    if (total === 0) return { week, pace: 0, tone: 0, fluency: 0 };
    return {
      week,
      pace: avgWPM,
      tone: avgTone,
      fluency: avgFluency,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Speech Coach — Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aggregated insights from all speech analyses (Speech Pace WPM, Tone, Clarity, and Fluency).</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Speech Pace', value: `${avgWPM} WPM`, icon: AudioWaveform, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
          { label: 'Avg. Tone & Clarity', value: `${avgTone}%`, icon: TrendingUp, color: 'text-[#F2A93B] dark:text-indigo-500', bg: 'bg-indigo-100 dark:bg-[#F2A93B]/20' },
          { label: 'Avg. Fluency', value: `${avgFluency}%`, icon: Target, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
          { label: 'Avg. Filler Words', value: avgFillerWords.toString(), icon: Mic, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Average scores over the last 8 weeks</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="pace" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Pace (WPM)" />
                <Line type="monotone" dataKey="tone" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Tone & Clarity" />
                <Line type="monotone" dataKey="fluency" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Fluency" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Score Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Overall rating distribution</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
