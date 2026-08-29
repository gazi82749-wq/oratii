'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Trash2, X, ShieldAlert, Sparkles, UserPlus, CreditCard, ArrowRight } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'user' | 'payment' | 'system' | 'ai';
  link?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Pro Subscriber',
    message: 'User completed ₹799 Pro Pack credit purchase.',
    time: '2m ago',
    read: false,
    type: 'payment',
    link: '/admin/subscriptions/payments',
  },
  {
    id: 'n2',
    title: 'High AI Traffic Spike',
    message: 'Deepgram & Gemini API requests spiked to 450/min.',
    time: '25m ago',
    read: false,
    type: 'ai',
    link: '/admin/ai-settings',
  },
  {
    id: 'n3',
    title: 'New Admin User Registered',
    message: 'New user account created with 5 starter credits.',
    time: '1h ago',
    read: false,
    type: 'user',
    link: '/admin/users',
  },
  {
    id: 'n4',
    title: 'Database Backup Completed',
    message: 'Supabase automatic database snapshot verified cleanly.',
    time: '4h ago',
    read: true,
    type: 'system',
    link: '/admin/logs',
  },
];

interface AdminNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminNotificationsDrawer({ isOpen, onClose }: AdminNotificationsDrawerProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayed = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard size={14} className="text-emerald-500" />;
      case 'user': return <UserPlus size={14} className="text-indigo-500" />;
      case 'ai': return <Sparkles size={14} className="text-amber-500" />;
      default: return <ShieldAlert size={14} className="text-sky-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">System Notifications</h3>
              <p className="text-[11px] text-slate-400">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter & Quick Actions */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
          {displayed.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Bell size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-700 opacity-60" />
              No {filter === 'unread' ? 'unread' : ''} notifications at this time.
            </div>
          ) : (
            displayed.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  toggleReadStatus(n.id);
                  if (n.link) {
                    router.push(n.link);
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${
                  !n.read
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {getTypeIcon(n.type)}
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-7">{n.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
            <button
              onClick={clearAll}
              className="text-red-500 hover:text-red-600 text-[11px] font-semibold flex items-center gap-1"
            >
              <Trash2 size={12} /> Clear all
            </button>
            <button
              onClick={() => {
                router.push('/admin/logs');
                onClose();
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
            >
              System logs <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
