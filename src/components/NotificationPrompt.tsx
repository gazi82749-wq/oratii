'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import {
  isPushSupported,
  shouldShowPrompt,
  subscribeToPush,
  dismissPrompt,
  isPushSubscribed,
  getPermissionStatus,
} from '@/lib/pushManager';
import { supabase } from '@/lib/supabaseClient';

/**
 * Non-intrusive notification opt-in banner.
 * Shows on the 2nd+ dashboard visit, only if push is supported and permission is 'default'.
 */
export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // Don't show if already subscribed or permission already decided
    async function check() {
      if (!isPushSupported()) return;

      const permission = getPermissionStatus();
      if (permission !== 'default') return;

      const alreadySubscribed = await isPushSubscribed();
      if (alreadySubscribed) return;

      if (shouldShowPrompt()) {
        setVisible(true);
      }
    }
    check();
  }, []);

  const handleAccept = async () => {
    setSubscribing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const success = await subscribeToPush(token);
      if (success) {
        setVisible(false);
      }
    } catch (error) {
      console.error('[Notification Prompt] Subscribe failed:', error);
    } finally {
      setSubscribing(false);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-4 shadow-sm animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 rounded-lg bg-indigo-100 p-2.5">
          <Bell size={20} className="text-indigo-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            🔔 Get daily practice reminders?
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            We&apos;ll remind you to keep your streak alive and notify you when sessions complete.
          </p>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleAccept}
              disabled={subscribing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {subscribing ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enabling...
                </>
              ) : (
                'Enable Notifications'
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              Not now
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Dismiss notification prompt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
