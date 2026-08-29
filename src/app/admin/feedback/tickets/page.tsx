'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, MessageSquare, Send, X } from 'lucide-react';
import { type TicketStatus, type TicketPriority } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';

function formatDate(ts: string): string {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  in_progress: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  closed: 'bg-indigo-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-indigo-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  high: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  critical: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export default function SupportTicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      setLoading(true);
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((t: any) => ({
          id: t.id.substring(0, 8),
          rawId: t.id,
          userId: t.user_id || 'anon',
          userName: t.user_name || 'Support User',
          subject: t.subject || 'Platform Inquiry',
          status: t.status || 'open',
          priority: t.priority || 'medium',
          createdAt: t.created_at || new Date().toISOString(),
          lastReply: t.updated_at || t.created_at || new Date().toISOString(),
          messages: t.messages_count || 1,
        }));
        setTickets(mapped);
      } else {
        setTickets([]);
      }
      setLoading(false);
    }
    loadTickets();
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = t.userName.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Support Tickets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and respond to user support requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Tickets</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">{tickets.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Open</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-1">{openCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">In Progress</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">{inProgressCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Resolved</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">{tickets.filter(t => t.status === 'resolved').length}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-indigo-100 dark:border-slate-800">
                {['Ticket ID', 'User', 'Subject', 'Priority', 'Status', 'Last Reply', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-indigo-50 dark:border-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-mono text-slate-500 dark:text-slate-400">{t.id}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-900 dark:text-white">{t.userName}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-700 dark:text-indigo-300 max-w-xs truncate">{t.subject}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${priorityColors[t.priority]}`}>{t.priority}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400">{timeAgo(t.lastReply)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedTicket(t.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-indigo-50 dark:hover:bg-[#F2A93B]/10 hover:text-[#F2A93B] dark:hover:text-indigo-500 transition-colors"
                        title="Reply"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedTicket && (() => {
        const ticket = tickets.find(t => t.id === selectedTicket);
        if (!ticket) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{ticket.subject}</h2>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">From {ticket.userName} Â· {ticket.id}</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-indigo-300">
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${statusColors[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{ticket.messages} messages</span>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Reply</label>
                <textarea rows={4} className="mt-1 w-full px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="Write your reply..." />
              </div>
              <div className="flex items-center gap-3">
                <select className="px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  <option value="open">Mark as Open</option>
                  <option value="in_progress">Mark In Progress</option>
                  <option value="resolved">Mark Resolved</option>
                  <option value="closed">Close Ticket</option>
                </select>
                <div className="flex-1" />
                <button onClick={() => setSelectedTicket(null)} className="px-4 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
                <button onClick={() => setSelectedTicket(null)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900 hover:bg-indigo-900 text-white rounded-lg text-[13px] font-semibold transition-colors">
                  <Send size={14} /> Send Reply
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
