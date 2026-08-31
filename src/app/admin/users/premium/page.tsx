'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, Eye, MoreHorizontal, ArrowDownCircle } from 'lucide-react';
import { users as mockUsers, type AdminUser, type UserPlan } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';

function timeAgo(ts: string): string {
  if (!ts) return 'Never';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PremiumUsersPage() {
  const [premiumUsers, setPremiumUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPremiumUsers() {
      setLoading(true);
      const { data } = await supabase.from('profiles').select('*').neq('current_plan', 'free').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped: AdminUser[] = data.map((p: any) => ({
          id: p.id,
          name: p.email ? p.email.split('@')[0] : 'User',
          email: p.email || '',
          avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
          registeredAt: p.created_at || new Date().toISOString(),
          lastActive: p.created_at || new Date().toISOString(),
          plan: (p.current_plan as UserPlan) || 'pro',
          status: 'active',
          totalAnalyses: p.xp ? Math.floor(p.xp / 10) : 0,
          speechAnalyses: 0,
          pptAnalyses: 0,
          vivaSessions: 0,
        }));
        setPremiumUsers(mapped);
      } else {
        setPremiumUsers([]);
      }
      setLoading(false);
    }
    loadPremiumUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Premium Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Users on Pro and Enterprise plans.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[13px] text-slate-500 dark:text-slate-400">Total Premium</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{premiumUsers.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[13px] text-slate-500 dark:text-slate-400">Pro Users</div>
          <div className="text-2xl font-bold text-[#F2A93B] dark:text-indigo-500 mt-1 font-mono">{premiumUsers.filter(u => u.plan === 'pro').length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-5">
          <div className="text-[13px] text-slate-500 dark:text-slate-400">Enterprise Users</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">{premiumUsers.filter(u => u.plan === 'enterprise').length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-indigo-100 dark:border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Plan</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Total Analyses</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Last Active</th>
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {premiumUsers.map((user) => (
                <tr key={user.id} className="border-b border-indigo-50 dark:border-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Image src={user.avatar || '/default-avatar.png'} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800" unoptimized />
                      <div>
                        <Link href={`/admin/users/${user.id}`} className="text-[13px] font-semibold text-slate-900 dark:text-white hover:text-[#F2A93B] dark:hover:text-indigo-500 transition-colors">{user.name}</Link>
                        <div className="text-[12px] text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${user.plan === 'pro' ? 'bg-indigo-50 text-indigo-900 dark:bg-[#F2A93B]/10 dark:text-indigo-500' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                      <Crown size={10} /> {user.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-mono text-slate-700 dark:text-indigo-300">{user.totalAnalyses}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">{timeAgo(user.lastActive)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/users/${user.id}`} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-indigo-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-indigo-300 transition-colors">
                        <Eye size={14} />
                      </Link>
                    </div>
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
