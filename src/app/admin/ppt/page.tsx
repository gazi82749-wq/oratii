'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Download, FileText, BarChart3, Layers, Sparkles } from 'lucide-react';
import { pptReports as mockPptReports, type PptReport } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';
import { formatDate, scoreColor, scoreBg, exportToCSV } from '@/lib/admin/utils';

export default function PptReportsPage() {
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

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
            userName: r.user_id ? `User (${r.user_id.substring(0, 6)})` : 'Slide Analyzer User',
            presentationName: sa.title || r.presentation_id || 'Oratii Presentation Deck',
            date: r.created_at || new Date().toISOString(),
            contentScore: sa.contentScore || r.overall_score || 75,
            deliveryScore: sa.designScore || r.overall_score || 70,
            engagementScore: sa.storytellingScore || r.overall_score || 72,
            overallRating: r.overall_score || sa.overallScore || 75,
            slideCount: sa.slideBySlideFeedback?.length || 13,
            category: sa.category || 'Academic / Pitch',
            strengths: sa.strengths || [],
            weaknesses: sa.weaknesses || [],
            suggestions: sa.suggestions || [],
            slides: sa.slideBySlideFeedback || [],
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
  const avgContent = total > 0 ? Math.round(reports.reduce((s, r) => s + r.contentScore, 0) / total) : 0;
  const avgDelivery = total > 0 ? Math.round(reports.reduce((s, r) => s + r.deliveryScore, 0) / total) : 0;
  const avgEngagement = total > 0 ? Math.round(reports.reduce((s, r) => s + r.engagementScore, 0) / total) : 0;

  const filtered = useMemo(() => {
    return reports.filter((r) =>
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.presentationName.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">PPT Coach — Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View all presentation analysis reports.</p>
        </div>
        <button
          onClick={() => exportToCSV('oratii_ppt_reports', filtered.map(r => ({
            Report_ID: r.id,
            User: r.userName,
            Presentation_Name: r.presentationName,
            Category: r.category,
            Date: r.date,
            Content_Score: r.contentScore,
            Delivery_Score: r.deliveryScore,
            Engagement_Score: r.engagementScore,
            Overall_Rating: r.overallRating
          })))}
          className="px-3.5 py-2 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-slate-700 self-start sm:self-auto"
        >
          <Download size={14} /> Export CSV
        </button>
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
            <div key={stat.label} className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all" style={{'--stripe-color': {'text-[#1B2140] dark:text-slate-400':'#fa7c42','text-[#F2A93B] dark:text-indigo-500':'#8b5cf6','text-blue-600 dark:text-blue-400':'#3b82f6','text-emerald-600 dark:text-emerald-400':'#10b981'}[stat.color], '--stripe-color-to': {'text-[#1B2140] dark:text-slate-400':'#818cf8','text-[#F2A93B] dark:text-indigo-500':'#a78bfa','text-blue-600 dark:text-blue-400':'#60a5fa','text-emerald-600 dark:text-emerald-400':'#34d399'}[stat.color]} as React.CSSProperties}>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stat.value}</div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by user or presentation..." value={search} onChange={(e) => setSearch(e.target.value)}
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
                {['User', 'Presentation', 'Date', 'Content', 'Delivery', 'Engagement', 'Overall', 'Category'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr 
                  key={r.id} 
                  onClick={() => setSelectedReport(r)}
                  className={`border-b border-indigo-50 dark:border-slate-800/50 hover:bg-indigo-100/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${filtered.indexOf(r) % 2 === 1 ? 'bg-slate-25 dark:bg-slate-900/50' : ''}`}
                >
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-900 dark:text-white">{r.userName}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-slate-900 dark:text-indigo-300">{r.presentationName}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">{formatDate(r.date)}</td>
                  <td className="px-5 py-3.5"><span className={`text-[13px] font-mono font-semibold ${scoreColor(r.contentScore)}`}>{r.contentScore}%</span></td>
                  <td className="px-5 py-3.5"><span className={`text-[13px] font-mono font-semibold ${scoreColor(r.deliveryScore)}`}>{r.deliveryScore}%</span></td>
                  <td className="px-5 py-3.5"><span className={`text-[13px] font-mono font-semibold ${scoreColor(r.engagementScore)}`}>{r.engagementScore}%</span></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[12px] font-bold ${scoreBg(r.overallRating)} ${scoreColor(r.overallRating)}`}>
                      {r.overallRating}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{r.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Analysis Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">{selectedReport.category}</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{selectedReport.presentationName}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Analyzed on {formatDate(selectedReport.date)} • {selectedReport.userName}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-xl font-bold text-base ${scoreBg(selectedReport.overallRating)} ${scoreColor(selectedReport.overallRating)}`}>
                  Score: {selectedReport.overallRating}%
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg px-2">✕</button>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-50/50 dark:bg-slate-800/50 p-3.5 rounded-xl text-center">
                <div className="text-xs text-slate-500">Content Score</div>
                <div className={`text-lg font-bold font-mono ${scoreColor(selectedReport.contentScore)}`}>{selectedReport.contentScore}%</div>
              </div>
              <div className="bg-indigo-50/50 dark:bg-slate-800/50 p-3.5 rounded-xl text-center">
                <div className="text-xs text-slate-500">Design Score</div>
                <div className={`text-lg font-bold font-mono ${scoreColor(selectedReport.deliveryScore)}`}>{selectedReport.deliveryScore}%</div>
              </div>
              <div className="bg-indigo-50/50 dark:bg-slate-800/50 p-3.5 rounded-xl text-center">
                <div className="text-xs text-slate-500">Storytelling Score</div>
                <div className={`text-lg font-bold font-mono ${scoreColor(selectedReport.engagementScore)}`}>{selectedReport.engagementScore}%</div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            {selectedReport.strengths && selectedReport.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Key Strengths</h4>
                <ul className="space-y-1 text-[13px] text-slate-700 dark:text-slate-300">
                  {selectedReport.strengths.map((st: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                      <span className="text-emerald-500 font-bold">✓</span> {st}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Slide-by-slide Breakdown */}
            {selectedReport.slides && selectedReport.slides.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Slide-by-Slide AI Feedback ({selectedReport.slides.length} Slides)</h4>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {selectedReport.slides.map((s: any) => (
                    <div key={s.slideNumber} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-indigo-100 dark:border-slate-700/80 text-[13px] space-y-1">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">Slide {s.slideNumber}</div>
                      {s.strengths && <div className="text-slate-700 dark:text-slate-300"><strong className="text-emerald-600">Strength:</strong> {s.strengths}</div>}
                      {s.weaknesses && <div className="text-slate-700 dark:text-slate-300"><strong className="text-amber-600">Weakness:</strong> {s.weaknesses}</div>}
                      {s.missing && <div className="text-slate-700 dark:text-slate-300"><strong className="text-blue-600">Recommendation:</strong> {s.missing}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
