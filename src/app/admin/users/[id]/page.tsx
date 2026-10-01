'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Calendar, Crown, Mic, FileText, Video, Clock, Shield, Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function formatDate(ts: string): string {
  if (!ts) return 'N/A';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const planColors: Record<string, string> = {
  free: 'bg-indigo-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  pro: 'bg-indigo-50 text-indigo-900 dark:bg-[#F2A93B]/10 dark:text-indigo-500',
  enterprise: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  inactive: 'bg-indigo-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  banned: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [speechReports, setSpeechReports] = useState<any[]>([]);
  const [pptReports, setPptReports] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function loadUserData() {
      if (!userId) return;
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // 1. Fetch User Info via Admin Users API
        const userRes = await fetch(`/api/admin/users?limit=1000`, {
          headers: { 'authorization': `Bearer ${session?.access_token || ''}` }
        });
        const userJson = await userRes.json();
        if (userJson && userJson.users) {
          const found = userJson.users.find((u: any) => u.id === userId);
          if (found) {
            setUser({
              id: found.id,
              name: found.full_name || (found.email ? found.email.split('@')[0] : 'User'),
              email: found.email || 'No Email',
              avatar: found.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${found.id}`,
              registeredAt: found.created_at || new Date().toISOString(),
              lastActive: found.last_active || found.updated_at || found.created_at || new Date().toISOString(),
              plan: (found.current_plan || 'free').toLowerCase(),
              status: 'active',
              totalAnalyses: found.analyses_count || 0,
              speechAnalyses: 0,
              pptAnalyses: 0,
              vivaSessions: 0,
            });
          }
        }

        // 2. Fetch Sessions for this user
        const sessRes = await fetch(`/api/admin/sessions?type=all`, {
          headers: { 'authorization': `Bearer ${session?.access_token || ''}` }
        });
        const sessJson = await sessRes.json();
        if (sessJson && sessJson.sessions) {
          const userSessions = sessJson.sessions.filter((s: any) => s.userId === userId);
          const speech = userSessions.filter((s: any) => s.sessionType === 'speech');
          const ppt = userSessions.filter((s: any) => s.sessionType === 'ppt' || s.sessionType === 'presentation');

          setSpeechReports(speech);
          setPptReports(ppt);

          setUser((prev: any) => prev ? ({
            ...prev,
            speechAnalyses: speech.length,
            pptAnalyses: ppt.length,
            totalAnalyses: userSessions.length,
          }) : prev);
        }

        // 3. Fetch Payments for this user
        const { data: payData } = await supabase.from('payments').select('*').eq('user_id', userId);
        if (payData) {
          setPayments(payData);
        }

      } catch (err) {
        console.error('Failed to fetch user details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#F2A93B] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">User not found</p>
        <p className="text-xs text-slate-500 mt-1">ID: {userId}</p>
        <Link href="/admin/users" className="text-sm text-[#F2A93B] dark:text-indigo-400 font-bold hover:underline mt-4">← Back to All Users</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back */}
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft size={14} /> Back to Users
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Image src={user.avatar || '/default-avatar.png'} alt={user.name} width={64} height={64} className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-slate-800" unoptimized />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${planColors[user.plan] || planColors.free}`}>
                <Crown size={10} /> {user.plan}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${statusColors[user.status]}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-[13px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><Mail size={13} /> {user.email}</span>
              <span className="flex items-center gap-1"><Calendar size={13} /> Joined {formatDate(user.registeredAt)}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> Last seen {formatDate(user.lastActive)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Sessions', value: user.totalAnalyses, icon: Activity, color: 'text-[#F2A93B] dark:text-indigo-500', bg: 'bg-indigo-100 dark:bg-[#F2A93B]/20' },
          { label: 'Speech Analyses', value: user.speechAnalyses, icon: Mic, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
          { label: 'PPT Analyses', value: user.pptAnalyses, icon: FileText, color: 'text-[#1B2140] dark:text-slate-400', bg: 'bg-indigo-200 dark:bg-[#F2A93B]/20' },
          { label: 'Viva Sessions', value: user.vivaSessions, icon: Video, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-500/20' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{stat.value}</div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Analysis History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speech */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Mic size={16} className="text-blue-500" /> Speech History</h3>
          {speechReports.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No speech analyses yet.</p>
          ) : (
            <div className="space-y-3">
              {speechReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-indigo-50 dark:border-slate-800 last:border-0">
                  <div>
                    <div className="text-[13px] text-slate-700 dark:text-indigo-300">{formatDate(r.createdAt)}</div>
                    <div className="text-xs text-slate-400">Pace: {r.wpm} WPM · Fluency: {r.fluencyScore}%</div>
                  </div>
                  <div className={`text-sm font-bold ${r.overallRating >= 80 ? 'text-emerald-600' : r.overallRating >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                    {r.overallRating}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PPT */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><FileText size={16} className="text-[#F2A93B]" /> PPT History</h3>
          {pptReports.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No PPT analyses yet.</p>
          ) : (
            <div className="space-y-3">
              {pptReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-indigo-50 dark:border-slate-800 last:border-0">
                  <div>
                    <div className="text-[13px] font-medium text-slate-700 dark:text-indigo-300">{r.presentationName || 'Presentation Deck'}</div>
                    <div className="text-xs text-slate-400">{formatDate(r.createdAt)}</div>
                  </div>
                  <div className={`text-sm font-bold ${r.overallRating >= 80 ? 'text-emerald-600' : r.overallRating >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                    {r.overallRating}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Shield size={16} className="text-green-500" /> Payment History</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No payment records for this user.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-indigo-100 dark:border-slate-800">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Plan</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Amount</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-indigo-50 dark:border-slate-800/50">
                    <td className="px-4 py-2.5 text-[13px] text-slate-600 dark:text-slate-400">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-2.5 text-[13px] text-slate-700 dark:text-indigo-300 font-medium">{p.plan || 'Pro Tier'}</td>
                    <td className="px-4 py-2.5 text-[13px] font-mono text-slate-900 dark:text-white">₹{p.amount || 499}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{p.status || 'completed'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
