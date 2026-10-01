'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Download, IndianRupee, AlertTriangle, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { exportToCSV } from '@/lib/admin/utils';

function formatDate(ts: string): string {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  completed: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: <CheckCircle size={10} /> },
  captured: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: <CheckCircle size={10} /> },
  failed: { color: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400', icon: <AlertTriangle size={10} /> },
  refunded: { color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: <RefreshCw size={10} /> },
  pending: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', icon: <Clock size={10} /> },
};

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      const { data } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((p: any) => {
          let rawAmt = p.amount || 149;
          if (rawAmt > 2000) rawAmt = rawAmt / 100; // Convert paise to rupees if stored in paise
          return {
            id: p.id || p.razorpay_payment_id || p.payment_id || 'PAY-LIVE',
            userId: p.user_id || 'anon',
            userName: p.user_email || p.user_id || 'Subscribed User',
            amount: rawAmt,
            plan: p.plan || (rawAmt === 499 ? 'Premium Credit Pack (200 Cr)' : rawAmt === 149 ? 'Pro Credit Pack (40 Cr)' : 'Credit Pack'),
            date: p.created_at || new Date().toISOString(),
            status: p.status === 'captured' || p.status === 'completed' ? 'completed' : p.status || 'completed',
            method: p.payment_method || p.method || 'Razorpay / UPI',
          };
        });
        setPaymentsList(mapped);
      } else {
        setPaymentsList([]);
      }
      setLoading(false);
    }
    loadPayments();
  }, []);

  const totalRevenue = paymentsList.filter(p => p.status === 'completed' || p.status === 'captured').reduce((s, p) => s + p.amount, 0);
  const failedCount = paymentsList.filter(p => p.status === 'failed').length;
  const refundedCount = paymentsList.filter(p => p.status === 'refunded').length;

  const filtered = useMemo(() => {
    return paymentsList.filter((p) => {
      const matchSearch = p.userName.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [paymentsList, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F2A93B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Subscriptions — Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live Razorpay transaction history, UPI payments, and credit pack purchase logs.</p>
        </div>
        <button
          onClick={() => exportToCSV('oratii_payments', filtered.map(p => ({
            Transaction_ID: p.id,
            User: p.userName,
            Amount_INR: p.amount,
            Plan: p.plan,
            Date: p.date,
            Method: p.method,
            Status: p.status
          })))}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Recorded Revenue</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Total Transactions</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">{paymentsList.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Failed</div>
          <div className="text-xl font-bold text-red-500 dark:text-red-400 font-mono mt-1">{failedCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[12px] text-slate-500 dark:text-slate-400">Refunded</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">{refundedCount}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by transaction ID or user email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
          <option value="all">All Status</option>
          <option value="completed">Completed / Captured</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-indigo-100 dark:border-slate-800">
                {['Transaction ID', 'User', 'Amount', 'Credit Pack / Tier', 'Date', 'Method', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const sc = statusConfig[p.status] || statusConfig.completed;
                return (
                  <tr key={p.id} className="border-b border-indigo-50 dark:border-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-mono text-slate-500 dark:text-slate-400">{p.id.toUpperCase()}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-900 dark:text-white">{p.userName}</td>
                    <td className="px-5 py-3.5 text-[13px] font-mono font-bold text-slate-900 dark:text-white">₹{p.amount}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400 font-medium">{p.plan}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">{formatDate(p.date)}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">{p.method}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${sc.color}`}>
                        {sc.icon} {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    No payment records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
