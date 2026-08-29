'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Star, MessageCircle, Bug, Lightbulb, AlertCircle } from 'lucide-react';
import { type FeedbackType } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';

function formatDate(ts: string): string {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const typeConfig: Record<FeedbackType, { color: string; icon: React.ReactNode; label: string }> = {
  bug: { color: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20', icon: <Bug size={12} />, label: 'Bug' },
  feature: { color: 'bg-indigo-50 text-indigo-900 dark:bg-[#F2A93B]/10 dark:text-indigo-500 border border-indigo-200 dark:border-indigo-500/20', icon: <Lightbulb size={12} />, label: 'Feature' },
  general: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20', icon: <MessageCircle size={12} />, label: 'General' },
  complaint: { color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20', icon: <AlertCircle size={12} />, label: 'Complaint' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-indigo-200 dark:text-slate-700'} />
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeedback() {
      setLoading(true);
      const { data } = await supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((f: any) => ({
          id: f.id,
          userName: f.user_name || 'Anonymous User',
          type: f.type || 'general',
          rating: f.rating || 5,
          message: f.message || '',
          date: f.created_at || new Date().toISOString(),
        }));
        setItems(mapped);
      } else {
        setItems([]);
      }
      setLoading(false);
    }
    loadFeedback();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((f) => {
      const matchSearch = f.userName.toLowerCase().includes(search.toLowerCase()) || f.message.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || f.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [items, search, typeFilter]);

  const avgRating = items.length > 0 ? (items.reduce((s, f) => s + f.rating, 0) / items.length).toFixed(1) : '5.0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User Feedback</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and manage user feedback submissions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Feedback</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">{items.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Avg. Rating</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 flex items-center gap-2">{avgRating} <Star size={16} className="text-amber-400 fill-amber-400" /></div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Bug Reports</div>
          <div className="text-xl font-bold text-red-500 dark:text-red-400 font-mono mt-1">{items.filter(f => f.type === 'bug').length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Feature Requests</div>
          <div className="text-xl font-bold text-[#F2A93B] dark:text-indigo-500 font-mono mt-1">{items.filter(f => f.type === 'feature').length}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search feedback..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as FeedbackType | 'all')}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
          <option value="all">All Types</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="general">General</option>
          <option value="complaint">Complaint</option>
        </select>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-3">
        {filtered.map((f) => {
          const tc = typeConfig[f.type as FeedbackType] || typeConfig.general;
          return (
            <div key={f.id} className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{f.userName}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${tc.color}`}>
                      {tc.icon} {tc.label}
                    </span>
                    <StarRating rating={f.rating} />
                  </div>
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{f.message}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{formatDate(f.date)}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-slate-400 dark:text-slate-500">No feedback found.</div>
        )}
      </div>
    </div>
  );
}
