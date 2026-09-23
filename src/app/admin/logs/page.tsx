'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, Download, AlertTriangle, AlertCircle, Info, ShieldAlert, 
  RefreshCw, Trash2, Cpu, Code, Globe, Shield, Database, DollarSign, Terminal, X, Copy, Check, Play 
} from 'lucide-react';
import { type LogSeverity } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';

function formatTimestamp(ts: string): string {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleString('en-US', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });
}

function timeAgo(ts: string): string {
  if (!ts) return 'Just now';
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 0) return 'Just now';
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const severityConfig: Record<LogSeverity, { color: string; bg: string; icon: React.ReactNode }> = {
  info: { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800', icon: <Info size={12} /> },
  warning: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800', icon: <AlertTriangle size={12} /> },
  error: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800', icon: <AlertCircle size={12} /> },
  critical: { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-800', icon: <ShieldAlert size={12} /> },
};

const categoryIcons: Record<string, React.ReactNode> = {
  'AI Provider': <Cpu size={14} className="text-purple-500" />,
  'AI Service Failure': <Cpu size={14} className="text-rose-500" />,
  'API Route': <Code size={14} className="text-emerald-500" />,
  'API Rate Limit': <AlertTriangle size={14} className="text-amber-500" />,
  'Website Client': <Globe size={14} className="text-sky-500" />,
  'Auth': <Shield size={14} className="text-indigo-500" />,
  'Database': <Database size={14} className="text-yellow-500" />,
  'Payment': <DollarSign size={14} className="text-green-500" />,
  'System': <Terminal size={14} className="text-slate-500" />,
};

export default function SystemLogsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/log');
      const json = await res.json();

      if (json && json.logs) {
        const mapped = json.logs.map((l: any) => ({
          id: l.id,
          timestamp: l.created_at || new Date().toISOString(),
          severity: (l.severity as LogSeverity) || 'info',
          category: l.category || 'System',
          message: l.message || 'System operation executed',
          source: l.source || 'Oratii Core',
          details: l.details || '',
        }));
        setLogs(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();

    // Set up Supabase Realtime subscription for instant log stream
    const channel = supabase
      .channel('system_logs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    // Periodic auto-refresh backup
    const interval = setInterval(() => {
      if (autoRefresh) fetchLogs();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchLogs, autoRefresh]);

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all system logs?')) return;
    setLoading(true);
    try {
      await fetch('/api/admin/log', { method: 'DELETE' });
      await fetchLogs();
    } catch (err) {
      alert('Failed to clear logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateError = async (type: string) => {
    setSimulating(type);
    try {
      await fetch('/api/admin/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate_test', type }),
      });
      await fetchLogs();
    } catch (err) {
      alert('Failed to simulate error');
    } finally {
      setSimulating(null);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (logs.length === 0) return;
    let content = '';
    let mimeType = '';
    let filename = `system_logs_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
      mimeType = 'application/json';
      filename += '.json';
    } else {
      const headers = ['ID', 'Timestamp', 'Severity', 'Category', 'Source', 'Message', 'Details'];
      const rows = logs.map(l => [
        l.id,
        l.timestamp,
        l.severity,
        l.category,
        `"${l.source.replace(/"/g, '""')}"`,
        `"${l.message.replace(/"/g, '""')}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      mimeType = 'text/csv';
      filename += '.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => set.add(l.category));
    return Array.from(set);
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.message.toLowerCase().includes(search.toLowerCase()) ||
        l.source.toLowerCase().includes(search.toLowerCase()) ||
        l.category.toLowerCase().includes(search.toLowerCase()) ||
        (l.details && l.details.toLowerCase().includes(search.toLowerCase()));

      const matchSeverity = severityFilter === 'all' || l.severity === severityFilter;
      const matchCategory = categoryFilter === 'all' || l.category === categoryFilter;

      return matchSearch && matchSeverity && matchCategory;
    });
  }, [logs, search, severityFilter, categoryFilter]);

  const criticalCount = logs.filter(l => l.severity === 'critical').length;
  const errorCount = logs.filter(l => l.severity === 'error').length;
  const warningCount = logs.filter(l => l.severity === 'warning').length;
  const aiErrorCount = logs.filter(l => l.category.includes('AI') || l.source.includes('Groq') || l.source.includes('Gemini') || l.source.includes('OpenRouter') || l.source.includes('Cerebras')).length;

  const copyLogDetails = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            System & Diagnostics Logs
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              Live Realtime Stream
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time error tracking for API crashes, AI provider failures, and website exceptions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {autoRefresh ? 'Live Stream Active' : 'Live Stream Paused'}
          </button>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            onClick={handleClearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <Trash2 size={14} /> Clear Logs
          </button>
        </div>
      </div>

      {/* Interactive Simulation & Test Suite */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 rounded-xl text-white shadow-md border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold flex items-center gap-1.5">
              <Play size={12} /> Diagnostic Simulator Tool
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Test live real-time error logging by triggering simulated system failures:
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleSimulateError('ai_failure')}
              disabled={simulating !== null}
              className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Cpu size={13} /> {simulating === 'ai_failure' ? 'Simulating...' : 'Simulate AI Provider Failure'}
            </button>
            <button
              onClick={() => handleSimulateError('api_crash')}
              disabled={simulating !== null}
              className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Code size={13} /> {simulating === 'api_crash' ? 'Simulating...' : 'Simulate API 500 Crash'}
            </button>
            <button
              onClick={() => handleSimulateError('client_error')}
              disabled={simulating !== null}
              className="px-3 py-1.5 bg-sky-600/80 hover:bg-sky-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Globe size={13} /> {simulating === 'client_error' ? 'Simulating...' : 'Simulate Client Error'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Logs</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">{logs.length}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/40 p-4 shadow-sm">
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <ShieldAlert size={12} /> Critical
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">{criticalCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/40 p-4 shadow-sm">
          <div className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={12} /> API & Server Errors
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono mt-1">{errorCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-900/40 p-4 shadow-sm">
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Cpu size={12} /> AI Provider Issues
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono mt-1">{aiErrorCount}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/40 p-4 shadow-sm">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle size={12} /> Warnings
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">{warningCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by error message, route, provider, or stack trace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as LogSeverity | 'all')}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="all">All Severity Levels</option>
          <option value="critical">Critical</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download size={13} /> CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download size={13} /> JSON
          </button>
        </div>
      </div>

      {/* Main Logs List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.map((log) => {
          const sc = severityConfig[log.severity] || severityConfig.info;
          const isSelected = selectedLog?.id === log.id;

          return (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className={`px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-l-4 ${
                log.severity === 'critical'
                  ? 'border-l-rose-500'
                  : log.severity === 'error'
                  ? 'border-l-red-500'
                  : log.severity === 'warning'
                  ? 'border-l-amber-500'
                  : 'border-l-blue-500'
              } ${isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold capitalize shrink-0 border ${sc.bg} ${sc.color}`}>
                  {sc.icon} {log.severity}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                      {categoryIcons[log.category] || <Terminal size={12} />}
                      {log.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                      {log.source}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1.5 leading-snug">
                    {log.message}
                  </p>

                  {log.details && (
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 truncate">
                      {log.details}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">{timeAgo(log.timestamp)}</div>
                  <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600 mt-0.5">{formatTimestamp(log.timestamp)}</div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 px-4">
            <Info size={32} className="mx-auto text-slate-400 mb-2" />
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">No matching system logs found</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Try adjusting your filter or search criteria, or click &quot;Simulate Error&quot; above to create a test log.
            </p>
          </div>
        )}
      </div>

      {/* Log Detail Inspector Modal / Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold uppercase border ${severityConfig[selectedLog.severity as LogSeverity]?.bg} ${severityConfig[selectedLog.severity as LogSeverity]?.color}`}>
                  {severityConfig[selectedLog.severity as LogSeverity]?.icon}
                  {selectedLog.severity}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  ID: {selectedLog.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Log Message</label>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedLog.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400">Category:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedLog.category}</span>
                </div>
                <div>
                  <span className="text-slate-400">Source:</span>{' '}
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedLog.source}</span>
                </div>
                <div>
                  <span className="text-slate-400">Timestamp:</span>{' '}
                  <span className="font-mono text-slate-700 dark:text-slate-300">{formatTimestamp(selectedLog.timestamp)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Relative:</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">{timeAgo(selectedLog.timestamp)}</span>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Technical Stack Trace & Details
                    </label>
                    <button
                      onClick={() => copyLogDetails(selectedLog.details)}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy details'}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
                    {selectedLog.details}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
