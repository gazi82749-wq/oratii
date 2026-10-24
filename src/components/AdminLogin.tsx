'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isAuthorizedAdminEmail } from '@/lib/adminAuth';
import { Logo } from './Logo';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin`,
        queryParams: {
          prompt: 'select_account',
        },
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      if (isAuthorizedAdminEmail(data.user?.email)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Mesh gradient */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1B2140]/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-900/15 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 noise-grain pointer-events-none opacity-30"></div>

        <div className="relative z-10 max-w-md text-center">
          <div className="flex justify-center mb-8">
            <Logo className="text-white text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Admin Portal</h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Manage your platform, monitor analytics, and configure AI settings from one powerful dashboard.
          </p>
          <div className="flex flex-col gap-4 text-left">
            {[
              { label: 'Real-time Analytics', desc: 'Track user growth, engagement, and revenue live.' },
              { label: 'AI Configuration', desc: 'Fine-tune model prompts, temperature, and limits.' },
              { label: 'Full User Management', desc: 'View, manage, and support your entire user base.' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#F2A93B] to-amber-300 mt-1.5 shrink-0"></div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo className="text-slate-900 text-3xl" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 mt-2 text-sm">Sign in with your administrator account to continue.</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-[#F2A93B]/20 focus:border-[#F2A93B] outline-none transition-all bg-indigo-50/50"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-[#F2A93B]/20 focus:border-[#F2A93B] outline-none transition-all bg-indigo-50/50"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1B2140] text-white font-semibold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 shadow-sm shadow-[#1B2140]/20 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-indigo-200"></div>
            <span className="text-sm font-medium text-slate-400">OR</span>
            <div className="flex-1 h-px bg-indigo-200"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-white text-slate-700 font-semibold border border-indigo-200 rounded-xl hover:bg-indigo-50 hover:shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google to Oratii Admin
          </button>
        </div>
      </div>
    </div>
  );
}
