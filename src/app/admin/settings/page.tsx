'use client';

import { useState, useEffect } from 'react';
import { Save, Globe, Mail, Shield, Key, Smartphone, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState('Oratii');
  const [contactEmail, setContactEmail] = useState('contact@oratii.in');
  const [supportEmail, setSupportEmail] = useState('support@oratii.in');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [upiId, setUpiId] = useState('Oratii@upi');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data?.settings) {
          setPlatformName(data.settings.platform_name || 'Oratii');
          setContactEmail(data.settings.contact_email || 'contact@oratii.in');
          setSupportEmail(data.settings.support_email || 'support@oratii.in');
          setUpiId(data.settings.upi_id || 'Oratii@upi');
          setTwoFactorEnabled(data.settings.two_factor_enabled ?? true);
          setSessionTimeout(data.settings.session_timeout_minutes || 30);
        }
      } catch (err: any) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform_name: platformName,
          contact_email: contactEmail,
          support_email: supportEmail,
          upi_id: upiId,
          two_factor_enabled: twoFactorEnabled,
          session_timeout_minutes: sessionTimeout,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to save settings');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err: any) {
      setError(err.message || 'Network error saving settings');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure platform and security settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveLoading}
          className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm disabled:opacity-60 ${
            saved ? 'bg-emerald-600 text-white' : 'bg-indigo-900 hover:bg-indigo-800 text-white'
          }`}
        >
          {saveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? 'Saved to Database!' : saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
          {error}
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Globe size={16} className="text-[#F2A93B]" /> Platform Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform Name</label>
            <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logo</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-900 text-white flex items-center justify-center font-bold text-lg rounded-xl">V</div>
              <button className="px-3 py-2 bg-indigo-100 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] font-medium text-slate-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-slate-700 transition-colors">
                Upload New
              </button>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Mail size={12} /> Contact Email
            </label>
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Mail size={12} /> Support Email
            </label>
            <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Payment UPI ID
            </label>
            <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="e.g. name@upi" />
            <p className="text-xs text-slate-500 mt-1">This UPI ID will be used for generating QR codes on the pricing page.</p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-slate-800 p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Shield size={16} className="text-emerald-500" /> Security Settings
        </h2>
        <div className="space-y-6">
          {/* Password Change */}
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Key size={12} /> Admin Password
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <input type="password" placeholder="New password" className="px-3 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              <input type="password" placeholder="Confirm password" className="px-3 py-2.5 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
          </div>

          {/* 2FA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-t border-indigo-100 dark:border-slate-800">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Smartphone size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400">Add an extra layer of security to admin access.</div>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 self-end sm:self-auto ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-indigo-300 dark:bg-slate-600'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${twoFactorEnabled ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`}
                style={{ transform: twoFactorEnabled ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
          </div>

          {/* Session Timeout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-t border-indigo-100 dark:border-slate-800">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                <Clock size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-900 dark:text-white">Session Timeout</div>
                <div className="text-[12px] text-slate-500 dark:text-slate-400">Automatically log out after period of inactivity.</div>
              </div>
            </div>
            <select value={sessionTimeout} onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
              className="w-full sm:w-auto px-3 py-2 bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[13px] text-slate-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 p-6">
        <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">These actions are irreversible. Proceed with caution.</p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-[13px] font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            Reset All Data
          </button>
          <button className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-[13px] font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            Delete All Users
          </button>
          <button className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-[13px] font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            Purge Logs
          </button>
        </div>
      </div>
    </div>
  );
}
