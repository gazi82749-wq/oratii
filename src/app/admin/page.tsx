'use client';

import { useState, useEffect } from 'react';
import {
  Users, UserCheck, Crown, Mic, FileText, Video, DollarSign, Zap,
  TrendingUp, TrendingDown, ArrowUpRight, UserPlus, CreditCard,
  BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  users, activityFeed, userGrowthData, revenueData,
  dailyActiveUsersData, moduleUsageData, speechReports, pptReports, vivaSessions
} from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';

const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
  violet: { bg: 'bg-indigo-50 dark:bg-[#F2A93B]/10', iconBg: 'bg-indigo-100 dark:bg-[#F2A93B]/20', text: 'text-[#F2A93B] dark:text-indigo-500' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconBg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', iconBg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', iconBg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
  indigo: { bg: 'bg-indigo-100 dark:bg-[#F2A93B]/10', iconBg: 'bg-indigo-200 dark:bg-[#F2A93B]/20', text: 'text-[#1B2140] dark:text-slate-400' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', iconBg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400' },
  green: { bg: 'bg-green-50 dark:bg-green-500/10', iconBg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', iconBg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
};

const activityIcons: Record<string, React.ReactNode> = {
  registration: <UserPlus size={14} className="text-blue-500" />,
  subscription: <CreditCard size={14} className="text-[#F2A93B]" />,
  speech: <Mic size={14} className="text-emerald-500" />,
  ppt: <FileText size={14} className="text-[#F2A93B]" />,
  viva: <Video size={14} className="text-cyan-500" />,
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    speechAnalyses: 0,
    pptAnalyses: 0,
    vivaSessions: 0,
    revenue: 0,
    aiRequests: 0,
  });

  const [moduleUsage, setModuleUsage] = useState([
    { name: 'Speech Coach', value: 100, color: '#10b981' },
  ]);

  const [liveActivity, setLiveActivity] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Fetch User Stats via Admin API route (bypassing client RLS)
      let usersCount = 0;
      let premiumCount = 0;
      let feed: any[] = [];

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userRes = await fetch('/api/admin/users?limit=5', {
          headers: {
            'authorization': `Bearer ${session?.access_token || ''}`
          }
        });
        const userJson = await userRes.json();
        if (userJson && userJson.users) {
          usersCount = userJson.total || userJson.users.length;
          premiumCount = userJson.users.filter((u: any) => u.current_plan && u.current_plan !== 'free').length;
          feed = userJson.users.map((p: any) => ({
            id: p.id,
            userName: p.full_name || p.email || 'Platform User',
            message: p.role === 'admin' ? 'signed in as Administrator' : 'registered on Oratii platform',
            type: 'registration',
            timestamp: p.updated_at || p.created_at || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.error('Failed to fetch admin dashboard user stats:', err);
      }
      
      // 2. Fetch Module Counts
      const { count: reportsCount } = await supabase.from('analysis_reports').select('*', { count: 'exact', head: true });

      const speechCount = reportsCount || 0;
      const totalModules = speechCount;

      setStats({
        totalUsers: usersCount || 0,
        activeUsers: usersCount || 0,
        premiumUsers: premiumCount || 0,
        speechAnalyses: speechCount,
        pptAnalyses: 0,
        vivaSessions: 0,
        revenue: (premiumCount || 0) * 499,
        aiRequests: totalModules,
      });

      // Calculate real module usage distribution
      if (totalModules > 0) {
        setModuleUsage([
          { name: 'Speech Coach', value: 100, color: '#10b981' },
        ]);
      } else {
        setModuleUsage([
          { name: 'Speech Coach', value: 0, color: '#10b981' },
        ]);
      }

      setLiveActivity(feed);
    }

    loadDashboardData();
  }, []);

  const kpis = [
    { label: 'Total Users', value: stats.totalUsers.toString(), change: '+100%', trend: 'up' as const, icon: Users, color: 'violet' },
    { label: 'Active Users', value: stats.activeUsers.toString(), change: '100%', trend: 'up' as const, icon: UserCheck, color: 'emerald' },
    { label: 'Premium Users', value: stats.premiumUsers.toString(), change: '0%', trend: 'up' as const, icon: Crown, color: 'amber' },
    { label: 'Speech Analyses', value: stats.speechAnalyses.toString(), change: '+15%', trend: 'up' as const, icon: Mic, color: 'blue' },
    { label: 'Monthly Revenue', value: `₹${stats.revenue}`, change: '+15%', trend: 'up' as const, icon: DollarSign, color: 'green' },
    { label: 'AI Requests', value: stats.aiRequests.toString(), change: '+30%', trend: 'up' as const, icon: Zap, color: 'orange' },
  ];
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back. Here’s what’s happening with Oratii.</p>
        </div>
        <a
          href="/admin/ai-settings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all shadow-sm w-max"
        >
          <Zap size={14} className="text-amber-400" />
          <span>Manage AI Token Limits →</span>
        </a>
      </div>

      {/* 🚨 AI Model Health & Token Limit Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300 dark:border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 animate-pulse">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Token & Model Health Monitor Active</h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">Waterfall Active</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Gemini 2.5 Flash & Cerebras Llama-3.3 daily tokens are monitored in real-time. Automatic fallback triggers if any model reaches 80% usage capacity.
            </p>
          </div>
        </div>
        <a
          href="/admin/ai-settings"
          className="px-3.5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors shrink-0 text-center"
        >
          Check AI Health
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const c = colorMap[kpi.color];
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="stripe-top bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200" style={{'--stripe-color': {'violet':'#8b5cf6','emerald':'#10b981','amber':'#f59e0b','blue':'#3b82f6','indigo':'#fa7c42','cyan':'#06b6d4','green':'#22c55e','orange':'#f97316'}[kpi.color], '--stripe-color-to': {'violet':'#a78bfa','emerald':'#34d399','amber':'#fbbf24','blue':'#60a5fa','indigo':'#818cf8','cyan':'#22d3ee','green':'#4ade80','orange':'#fb923c'}[kpi.color]} as React.CSSProperties}>
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-lg ${c.iconBg} flex items-center justify-center`}>
                  <Icon size={18} className={c.text} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {kpi.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.change}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">{kpi.value}</div>
                <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">User Growth</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly user registrations</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp size={12} /> +12.5%
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} fill="url(#userGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Revenue</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly recurring revenue</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp size={12} /> +5.1%
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Active Users */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Daily Active Users</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This week’s daily activity</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActiveUsersData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} />
                <Bar dataKey="users" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module Usage Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Module Usage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution by module</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moduleUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {moduleUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {moduleUsage.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{m.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest platform activity</p>
          </div>
          <button className="text-xs text-[#F2A93B] dark:text-indigo-500 hover:underline font-medium">View all</button>
        </div>
        <div className="space-y-0">
          {liveActivity.map((activity, i) => (
            <div
              key={activity.id}
              className={`flex items-center gap-4 py-3 ${i < liveActivity.length - 1 ? 'border-b border-indigo-100 dark:border-slate-800' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                {activityIcons[activity.type] || <UserPlus size={14} className="text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-slate-700 dark:text-indigo-300">
                  <span className="font-semibold text-slate-900 dark:text-white">{activity.userName}</span>{' '}
                  {activity.message}
                </p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{timeAgo(activity.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
