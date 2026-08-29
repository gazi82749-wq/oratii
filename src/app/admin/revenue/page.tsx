'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Users, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminRevenuePage() {
  const [loading, setLoading] = useState(true);
  
  // Revenue data for Admin Panel
  const metrics = {
    totalRevenue: '₹84,500',
    monthlyRevenue: '₹24,300',
    activeSubscribers: 142,
    churnRate: '2.4%',
    revenueGrowth: '+12.5%',
    subscribersGrowth: '+8.2%'
  };

  const recentTransactions = [
    { id: 'txn_1', user: 'Priya Sharma', amount: '₹2,990', plan: 'Pro (Annual)', date: 'Today, 10:42 AM', status: 'Completed' },
    { id: 'txn_2', user: 'Rahul Verma', amount: '₹299', plan: 'Pro (Monthly)', date: 'Today, 09:15 AM', status: 'Completed' },
    { id: 'txn_3', user: 'Tech Corp', amount: '₹19,990', plan: 'Team (Annual)', date: 'Yesterday', status: 'Completed' },
    { id: 'txn_4', user: 'Amit Kumar', amount: '₹699', plan: 'Premium (Monthly)', date: 'Yesterday', status: 'Failed' },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#F2A93B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Revenue Dashboard</h1>
        <p className="text-slate-500 mt-1">Monitor payments, subscriptions, and financial metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
              <ArrowUpRight size={16} /> {metrics.revenueGrowth}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.monthlyRevenue}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-indigo-200 text-[#1B2140] rounded-lg flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400">All Time</span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.totalRevenue}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
              <ArrowUpRight size={16} /> {metrics.subscribersGrowth}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Subscribers</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.activeSubscribers}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-rose-600">
              <ArrowDownRight size={16} />
            </span>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Churn Rate</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.churnRate}</h3>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-indigo-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
          <button className="text-sm font-semibold text-[#1B2140] hover:text-[#151930]">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-indigo-50/50 text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-indigo-100">
              {recentTransactions.map((t, i) => (
                <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{t.user}</td>
                  <td className="p-4 text-slate-600">{t.plan}</td>
                  <td className="p-4 font-bold text-slate-900">{t.amount}</td>
                  <td className="p-4 text-slate-500">{t.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                      t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
