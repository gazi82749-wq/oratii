'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Ban, Trash2, Crown, ArrowDownCircle, ShieldCheck, Download } from 'lucide-react';
import { type AdminUser, type UserPlan, type UserStatus } from '@/lib/admin/data';
import { supabase } from '@/lib/supabaseClient';
import { exportToCSV } from '@/lib/admin/utils';

function timeAgo(ts: string): string {
  if (!ts) return 'Never';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusColors: Record<UserStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  inactive: 'bg-indigo-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  banned: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

const planColors: Record<UserPlan, string> = {
  free: 'bg-indigo-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  pro: 'bg-indigo-50 text-indigo-900 dark:bg-[#F2A93B]/10 dark:text-indigo-500',
  enterprise: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
};

const ITEMS_PER_PAGE = 10;

export default function AllUsersPage() {
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<UserPlan | 'all'>('all');
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: dbProfiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbProfiles) {
      const mapped: AdminUser[] = dbProfiles.map((p: any) => ({
        id: p.id,
        name: p.email ? p.email.split('@')[0] : 'User',
        email: p.email || 'no-email@domain.com',
        avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
        registeredAt: p.created_at || new Date().toISOString(),
        lastActive: p.created_at || new Date().toISOString(),
        plan: (p.current_plan as UserPlan) || 'free',
        status: (p.role === 'admin' ? 'active' : 'active') as UserStatus,
        totalAnalyses: p.xp ? Math.floor(p.xp / 10) : 0,
        speechAnalyses: 0,
        pptAnalyses: 0,
        vivaSessions: 0,
      }));
      setUsersList(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdatePlan = async (userId: string, newPlan: UserPlan) => {
    await supabase.from('profiles').update({ current_plan: newPlan }).eq('id', userId);
    fetchUsers();
    setActionMenu(null);
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: nextRole }).eq('id', userId);
    fetchUsers();
    setActionMenu(null);
  };


  const filtered = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesPlan = planFilter === 'all' || u.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [usersList, search, statusFilter, planFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">All Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all registered users on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV('oratii_users', filtered.map(u => ({
              ID: u.id,
              Name: u.name,
              Email: u.email,
              Plan: u.plan,
              Status: u.status,
              Total_Analyses: u.totalAnalyses,
              Registered_At: u.registeredAt
            })))}
            className="px-3 py-2 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-slate-700"
          >
            <Download size={14} /> Export CSV
          </button>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> users
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as UserStatus | 'all'); setPage(1); }}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value as UserPlan | 'all'); setPage(1); }}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-indigo-100 dark:border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Registration</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Plan</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Analyses</th>
                <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Last Active</th>
                <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-sm text-slate-400 dark:text-slate-500">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
              {paginated.map((user) => (
                <tr key={user.id} className="border-b border-indigo-50 dark:border-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Image src={user.avatar || '/default-avatar.png'} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800" unoptimized />
                      <div>
                        <Link href={`/admin/users/${user.id}`} className="text-[13px] font-semibold text-slate-900 dark:text-white hover:text-[#F2A93B] dark:hover:text-indigo-500 transition-colors">
                          {user.name}
                        </Link>
                        <div className="text-[12px] text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">
                    {new Date(user.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${planColors[user.plan]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${statusColors[user.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : user.status === 'banned' ? 'bg-red-500' : 'bg-slate-400'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-mono text-slate-700 dark:text-indigo-300">{user.totalAnalyses}</td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400">{timeAgo(user.lastActive)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-indigo-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-indigo-300 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {actionMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-20">
                          <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800" onClick={() => setActionMenu(null)}>
                            <Eye size={14} /> View Profile
                          </Link>
                          {user.status !== 'banned' ? (
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setActionMenu(null)}>
                              <Ban size={14} /> Ban User
                            </button>
                          ) : (
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" onClick={() => setActionMenu(null)}>
                              <Ban size={14} /> Unban User
                            </button>
                          )}
                          {user.plan === 'free' && (
                            <button 
                              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-500/10 cursor-pointer" 
                              onClick={() => handleUpdatePlan(user.id, 'pro')}
                            >
                              <Crown size={14} className="text-amber-500" /> Grant Free Pro Plan
                            </button>
                          )}
                          {user.plan !== 'free' && (
                            <button 
                              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer" 
                              onClick={() => handleUpdatePlan(user.id, 'free')}
                            >
                              <ArrowDownCircle size={14} /> Downgrade to Free
                            </button>
                          )}
                          <button 
                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer" 
                            onClick={async () => {
                              await supabase.from('profiles').update({ credits: 100 }).eq('id', user.id);
                              fetchUsers();
                              setActionMenu(null);
                              alert(`Granted 100 VIP Credits to ${user.email}!`);
                            }}
                          >
                            <ShieldCheck size={14} className="text-emerald-500" /> Grant +100 Free Credits
                          </button>
                          <div className="h-px bg-indigo-100 dark:bg-slate-800 my-1" />
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setActionMenu(null)}>
                            <Trash2 size={14} /> Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-indigo-100 dark:border-slate-800">
            <div className="text-[12px] text-slate-500 dark:text-slate-400">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-indigo-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-[13px] font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-indigo-900 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-indigo-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
