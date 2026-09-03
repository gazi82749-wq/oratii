'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MakeMeAdminPage() {
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus('Submitting request...');

    try {
      const res = await fetch('/api/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secret }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`Error: ${data.error || 'Failed to promote'}`);
        setLoading(false);
        return;
      }

      setStatus('Success! Account promoted to Admin. Redirecting to /admin...');
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      setStatus(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center">
      <div className="w-16 h-16 bg-[#1B2140] text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold font-heading shadow-md shadow-[#1B2140]/20">O</div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-slate-900 mb-2">
        Admin Provisioning <span className="text-slate-400">Portal</span>
      </h1>
      <p className="text-sm text-slate-500 font-medium mb-6">Secured Administrative Activation</p>

      <form onSubmit={handlePromote} className="max-w-md w-full p-6 bg-white rounded-2xl border border-indigo-200/90 shadow-lg text-left space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Account Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Administrative Passkey (ADMIN_SETUP_SECRET)</label>
          <input
            type="password"
            required
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Promote to Administrator'}
        </button>

        {status && (
          <div className="mt-3 p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 break-words">
            {status}
          </div>
        )}
      </form>
    </div>
  );
}

