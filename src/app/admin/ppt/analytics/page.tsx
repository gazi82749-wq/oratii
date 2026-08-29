'use client';

import { useState, useEffect } from 'react';
import { FileText, Layers, BarChart3, Sparkles } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';

export default function PptAnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    async function loadReports() {
      const { data } = await supabase.from('analysis_reports').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped = data.map((r: any) => {
          const sa = r.slide_analysis || {};
          return {
            id: r.id,
            contentScore: sa.contentScore || r.overall_score || 78,
            deliveryScore: sa.designScore || r.overall_score || 72,
            engagementScore: sa.storytellingScore || r.overall_score || 75,
            overallRating: r.overall_score || sa.overallScore || 75,
            category: sa.category || 'Academic / Pitch',
          };
        });
        setReports(mapped);
      }
    }
    loadReports();
  }, []);

  const total = reports.length;
  const avgContent = total > 0 ? Math.round(reports.reduce((s, r) => s + r.contentScore, 0) / total) : 78;
  const avgDelivery = total > 0 ? Math.round(reports.reduce((s, r) => s + r.deliveryScore, 0) / total) : 72;
  const avgEngagement = total > 0 ? Math.round(reports.reduce((s, r) => s + r.engagementScore, 0) / total) : 75;
  const avgOverall = total > 0 ? Math.round(reports.reduce((s, r) => s + r.overallRating, 0) / total) : 75;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  if (reports.length > 0) {
    reports.forEach((r) => { categoryMap[r.category] = (categoryMap[r.category] || 0) + 1; });
  } else {
    categoryMap['Academic / Pitch'] = 1;
    categoryMap['Business Deck'] = 1;
  }
  const categoryColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
  const categoryData = Object.entries(categoryMap).map(([name, value], i) => ({
    name, value, color: categoryColors[i % categoryColors.length]
  }));

  // Score comparison
  const scoreComparison = [
    { name: 'Content', score: avgContent },
    { name: 'Design / Delivery', score: avgDelivery },
    { name: 'Storytelling', score: avgEngagement },
    { name: 'Overall Score', score: avgOverall },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">PPT Coach — Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aggregated insights from all presentation analyses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyses', value: reports.length.toString(), icon: FileText, color: 'text-[#1B2140] dark:text-slate-400', bg: 'bg-indigo-200 dark:bg-[#F2A93B]/20' },
          { label: 'Avg. Content', value: `${avgContent}%`, icon: Layers, color: 'text-[#F2A93B] dark:text-indigo-500', bg: 'bg-indigo-100 dark:bg-[#F2A93B]/20' },
          { label: 'Avg. Delivery', value: `${avgDelivery}%`, icon: BarChart3, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
          { label: 'Avg. Engagement', value: `${avgEngagement}%`, icon: Sparkles, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
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
        {/* Score Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Average Scores</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Comparison across scoring dimensions</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreComparison} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="score" fill="#fa7c42" radius={[6, 6, 0, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Presentation Categories</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Most used categories</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-[13px]">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{c.name}</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
