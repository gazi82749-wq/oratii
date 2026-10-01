'use client';

import { useState, useEffect } from 'react';
import { Flame, Target, Trophy, Users, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';

export default function DailyHabitsAdminPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfiles() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/users?limit=1000', {
          headers: { 'authorization': `Bearer ${session?.access_token || ''}` }
        });
        const json = await res.json();
        if (json && json.users) {
          setProfiles(json.users);
        } else {
          setProfiles([]);
        }
      } catch (err) {
        console.error('Failed to load challenge analytics:', err);
        setProfiles([]);
      }
      setLoading(false);
    }
    loadProfiles();
  }, []);

  const totalUsers = profiles.length;
  // If no streak column exists, just default to 0 for now
  const usersWithStreaks = profiles.filter(p => p.streak && p.streak > 0).length;
  const avgStreak = usersWithStreaks > 0 
    ? Math.round(profiles.reduce((s, p) => s + (p.streak || 0), 0) / usersWithStreaks) 
    : 0;

  const streakDistribution = [
    { range: '0 days', count: profiles.filter(p => !p.streak || p.streak === 0).length },
    { range: '1-3 days', count: profiles.filter(p => p.streak >= 1 && p.streak <= 3).length },
    { range: '4-7 days', count: profiles.filter(p => p.streak >= 4 && p.streak <= 7).length },
    { range: '8-14 days', count: profiles.filter(p => p.streak >= 8 && p.streak <= 14).length },
    { range: '15+ days', count: profiles.filter(p => p.streak >= 15).length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Habits</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform-wide analytics on user engagement and challenge streaks.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: totalUsers.toString(), icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
          { label: 'Active Streaks', value: usersWithStreaks.toString(), icon: Flame, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
          { label: 'Avg. Streak Length', value: `${avgStreak} days`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
          { label: 'Completion Rate', value: '0%', icon: Trophy, color: 'text-[#F2A93B] dark:text-[#F2A93B]', bg: 'bg-[#F2A93B]/20 dark:bg-[#F2A93B]/20' },
        ].map((stat) => {
          const Icon = stat.icon as any;
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

      <div className="grid grid-cols-1 gap-6">
        {/* Streak Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Streak Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">How many users have maintained continuous habits</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streakDistribution} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
