'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Download, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { type LogSeverity } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';

function formatTimestamp(ts: string): string {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function timeAgo(ts: string): string {
  if (!ts) return 'Just now';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const severityConfig: Record<LogSeverity, { color: string; bg: string; icon: React.ReactNode }> = {
  info: { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: <Info size={12} /> },
  warning: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: <AlertTriangle size={12} /> },
  error: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: <AlertCircle size={12} /> },
  critical: { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', icon: <ShieldAlert size={12} /> },
};

export default function SystemLogsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'all'>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((l: any) => ({
          id: l.id,
          timestamp: l.created_at || new Date().toISOString(),
          severity: l.severity || 'info',
          category: l.category || 'System',
          message: l.message || 'System operation executed',
          source: l.source || 'VOCALIZE Core',
          details: l.details || '',
        }));
        setLogs(mapped);
      } else {
        setLogs([]);
      }
      setLoading(false);
    }
    loadLogs();
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch = l.message.toLowerCase().includes(search.toLowerCase()) || l.source.toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severityFilter === 'all' || l.severity === severityFilter;
      return matchSearch && matchSeverity;
    });
  }, [logs, search, severityFilter]);

  const errorCount = logs.filter(l => l.severity === 'error').length;
  const criticalCount = logs.filter(l => l.severity === 'critical').length;
  const warningCount = logs.filter(l => l.severity === 'warning').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Logs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor system events, errors, and diagnostics.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all" style={{'--stripe-color':'#fa7c42','--stripe-color-to':'#818cf8'} as React.CSSProperties}>
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Logs</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">{logs.length}</div>
        </div>
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all" style={{'--stripe-color':'#e11d48','--stripe-color-to':'#fb7185'} as React.CSSProperties}>
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Critical</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">{criticalCount}</div>
        </div>
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all" style={{'--stripe-color':'#ef4444','--stripe-color-to':'#f87171'} as React.CSSProperties}>
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Errors</div>
          <div className="text-xl font-bold text-red-500 dark:text-red-400 font-mono mt-1">{errorCount}</div>
        </div>
        <div className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all" style={{'--stripe-color':'#f59e0b','--stripe-color-to':'#fbbf24'} as React.CSSProperties}>
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Warnings</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">{warningCount}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as LogSeverity | 'all')}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] font-medium text-slate-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 overflow-hidden divide-y divide-indigo-100 dark:divide-slate-800">
        {filtered.map((log) => {
          const sc = severityConfig[log.severity];
          const isExpanded = expandedLog === log.id;
          return (
            <div key={log.id} className={`px-5 py-3.5 hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer border-l-[3px] ${log.severity === 'critical' ? 'border-rose-500' : log.severity === 'error' ? 'border-red-400' : log.severity === 'warning' ? 'border-amber-400' : 'border-blue-400'}`} onClick={() => setExpandedLog(isExpanded ? null : log.id)}>
              <div className="flex items-start gap-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold capitalize mt-0.5 shrink-0 ${sc.bg} ${sc.color}`}>
                  {sc.icon} {log.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-900 dark:text-white font-medium">{log.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 dark:text-slate-500">{formatTimestamp(log.timestamp)}</span>
                    <span className="text-xs text-indigo-300 dark:text-slate-600">Â·</span>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{log.source}</span>
                    <span className="text-xs text-indigo-300 dark:text-slate-600">Â·</span>
                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-medium">{log.category}</span>
                  </div>
                  {isExpanded && log.details && (
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-slate-800 rounded-lg text-[12px] font-mono text-slate-600 dark:text-slate-400 leading-relaxed">
                      {log.details}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{timeAgo(log.timestamp)}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-slate-400 dark:text-slate-500">No logs found.</div>
        )}
      </div>
    </div>
  );
}
