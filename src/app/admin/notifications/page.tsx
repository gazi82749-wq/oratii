'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Zap,
  Clock,
  Smartphone,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Flame,
  Radio,
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface SubscriptionItem {
  id: string;
  user_id: string | null;
  email: string;
  user_name: string;
  created_at: string;
  last_used_at: string;
  endpoint_domain: string;
}

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    vapidConfigured: boolean;
    totalSubscriptions: number;
    uniqueUsers: number;
    subscriptions: SubscriptionItem[];
  }>({
    vapidConfigured: false,
    totalSubscriptions: 0,
    uniqueUsers: 0,
    subscriptions: [],
  });

  // Broadcast form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUrl, setTargetUrl] = useState('/speech-coach');
  const [targetAudience, setTargetAudience] = useState<'all' | 'specific'>('all');
  const [specificUserId, setSpecificUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; message: string } | null>(null);

  // Manual cron trigger state
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [cronResult, setCronResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/notifications/send', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch notification stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSending(true);
    setBroadcastResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const payload: any = {
        title: title.trim(),
        body: body.trim(),
        url: targetUrl.trim() || '/',
      };

      if (targetAudience === 'specific' && specificUserId) {
        payload.userId = specificUserId;
      }

      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setBroadcastResult({
          success: true,
          message: `Successfully sent to ${data.sent || 0} device(s)${data.failed > 0 ? ` (${data.failed} failed)` : ''}!`,
        });
        setTitle('');
        setBody('');
        fetchStats();
      } else {
        setBroadcastResult({
          success: false,
          message: data.error || 'Failed to dispatch push notification.',
        });
      }
    } catch (err: any) {
      setBroadcastResult({
        success: false,
        message: err?.message || 'Failed to send notification.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleTriggerStreakCron = async () => {
    setTriggeringCron(true);
    setCronResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('/api/cron/streak-reminder', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setCronResult({
          success: true,
          message: `Daily streak reminders dispatched! Sent: ${data.sent || 0}, Expired Cleaned: ${data.cleanedExpired || 0}`,
        });
        fetchStats();
      } else {
        setCronResult({
          success: false,
          message: data.error || 'Failed to trigger cron.',
        });
      }
    } catch (err: any) {
      setCronResult({
        success: false,
        message: err?.message || 'Execution failed.',
      });
    } finally {
      setTriggeringCron(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Push Notification Hub</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                PWA Web Push delivery, automated daily streak triggers, and instant broadcasts.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Registry
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Smartphone size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Devices</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalSubscriptions}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscribed Users</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.uniqueUsers}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">VAPID Protocol</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${stats.vapidConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <p className="text-xs font-bold text-slate-700">
                {stats.vapidConfigured ? 'Active & Verified' : 'Checking Key...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Cron Schedule</p>
            <p className="text-xs font-bold text-slate-800 mt-0.5">8:00 PM IST (14:30 UTC)</p>
            <p className="text-[10px] text-slate-400 font-medium">Automatic via vercel.json</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Streak Reminder Card & Broadcast Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Automated Streak Trigger & Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Streak Automation Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold">
                <Flame size={14} className="fill-amber-400" />
                Streak Retention Loop
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>

            <h2 className="text-lg font-black mt-4">Automated Evening Streak Reminders</h2>
            <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
              Vercel Cron automatically calls <code className="bg-indigo-950 px-1.5 py-0.5 rounded text-indigo-300">/api/cron/streak-reminder</code> daily at 8:00 PM IST. It personalizes alerts based on each user’s current speaking streak.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Segment</span>
                <span className="font-semibold text-white">All Active PWA Devices</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Trigger Time</span>
                <span className="font-semibold text-amber-300">Daily at 8:00 PM IST</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Action On Click</span>
                <span className="font-semibold text-indigo-300">Opens /speech-coach</span>
              </div>
            </div>

            {/* Test Trigger Button */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <button
                onClick={handleTriggerStreakCron}
                disabled={triggeringCron}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {triggeringCron ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Dispatching Reminders...
                  </>
                ) : (
                  <>
                    <Zap size={14} fill="currentColor" />
                    Trigger Streak Reminders Now (Test)
                  </>
                )}
              </button>

              {cronResult && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                    cronResult.success
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                  }`}
                >
                  {cronResult.success ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                  <span>{cronResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Custom Push Broadcast Messenger (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Send Custom Push Broadcast</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Send native OS notifications to subscribers on phones and desktops.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Radio size={20} />
              </div>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 New Viva Defense AI Persona is live!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message Body
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Rehearse with the new aggressive investor persona before your pitch today."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Destination URL
                  </label>
                  <input
                    type="text"
                    placeholder="/viva"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Opens this page when clicked</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e: any) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900 bg-white"
                  >
                    <option value="all">Broadcast to All Devices ({stats.totalSubscriptions})</option>
                    <option value="specific">Target Specific User ID</option>
                  </select>
                </div>
              </div>

              {targetAudience === 'specific' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    User UUID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7c9e6679-7425-40de-944b-e07fc1f90ae7"
                    value={specificUserId}
                    onChange={(e) => setSpecificUserId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
                  />
                </div>
              )}

              {broadcastResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
                    broadcastResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {broadcastResult.success ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{broadcastResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sending || stats.totalSubscriptions === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Sending Push Notifications...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Dispatch Push Broadcast
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Table: Registered Devices */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Subscribed Device Registry</h2>
            <p className="text-xs text-slate-500 font-medium">
              Registered browser endpoints currently receiving web push notifications.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {stats.subscriptions.length} Devices
          </span>
        </div>

        {stats.subscriptions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Smartphone size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No active subscriptions yet</p>
            <p className="text-xs mt-0.5">Visit the dashboard on a browser and allow push notifications to register a device.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Push Service Provider</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                  <th className="py-3 px-4">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {stats.subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{sub.email}</p>
                        {sub.user_name && <p className="text-[11px] text-slate-400">{sub.user_name}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {sub.endpoint_domain || 'Web Push Endpoint'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(sub.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(sub.last_used_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
