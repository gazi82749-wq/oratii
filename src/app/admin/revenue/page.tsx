'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Users, ArrowUpRight, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminRevenuePage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscribers: 0,
    proSubscribers: 0,
    enterpriseSubscribers: 0,
  });

  useEffect(() => {
    async function loadRevenueData() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // 1. Fetch user subscription counts
        const userRes = await fetch('/api/admin/users?limit=1000', {
          headers: { 'authorization': `Bearer ${session?.access_token || ''}` }
        });
        const userJson = await userRes.json();
        let proCount = 0;
        let entCount = 0;
        if (userJson && userJson.users) {
          userJson.users.forEach((u: any) => {
            const plan = (u.current_plan || 'free').toLowerCase();
            if (plan === 'pro') proCount++;
            else if (plan === 'enterprise') entCount++;
          });
        }
        const totalSubscribers = proCount + entCount;

        // 2. Fetch payments table
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        let totalRev = totalSubscribers * 499; // Base MRR calculation
        let monthlyRev = totalRev;
        let txns: any[] = [];

        if (paymentsData && paymentsData.length > 0) {
          txns = paymentsData.map((p: any) => ({
            id: p.id || p.razorpay_payment_id || 'PAY-LIVE',
            user: p.user_email || p.user_id || 'Subscribed User',
            plan: p.plan || 'Pro Tier',
            amount: p.amount ? `₹${p.amount}` : '₹499',
            rawAmount: p.amount || 499,
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
            status: p.status === 'captured' || p.status === 'completed' ? 'Completed' : p.status || 'Completed',
          }));

          const dbTotal = paymentsData
            .filter((p: any) => p.status === 'captured' || p.status === 'completed')
            .reduce((sum: number, p: any) => sum + (p.amount || 499), 0);
          if (dbTotal > 0) totalRev = dbTotal;
        }

        setRevenueStats({
          totalRevenue: totalRev,
          monthlyRevenue: monthlyRev,
          activeSubscribers: totalSubscribers,
          proSubscribers: proCount,
          enterpriseSubscribers: entCount,
        });
        setTransactions(txns);
      } catch (err) {
        console.error('Failed to load revenue stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F2A93B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Revenue Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Live financial metrics and payment records across Oratii platform.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold">
              <IndianRupee size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <ArrowUpRight size={14} /> MRR
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">₹{revenueStats.monthlyRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center font-bold">
              <IndianRupee size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase">All-Time</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gross Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">₹{revenueStats.totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400">Paid Tiers</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Paid Subscribers</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">{revenueStats.activeSubscribers}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">Pro & Ent</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pro / Enterprise Breakup</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{revenueStats.proSubscribers} Pro / {revenueStats.enterpriseSubscribers} Enterprise</h3>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-indigo-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <a href="/admin/subscriptions/payments" className="text-xs font-bold text-[#F2A93B] hover:underline">View All Transactions →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-indigo-50/50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-indigo-100 dark:divide-slate-800">
              {transactions.map((t, i) => (
                <tr key={t.id || i} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{t.user}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{t.plan}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white font-mono">{t.amount}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{t.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                      t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    No payment transactions recorded yet. Live payment transactions processed via Razorpay will be logged here.
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
