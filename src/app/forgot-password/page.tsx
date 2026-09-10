'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <nav className="w-full px-6 md:px-10 py-6 flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#151930] text-[#F2A93B] flex items-center justify-center font-black text-lg shadow-sm">
            O
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">Oratii</span>
        </Link>
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all bg-white shadow-2xs"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 w-full">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50">
          {sent ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Check Your Inbox</h2>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                We’ve sent a secure password reset link to:
              </p>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm mb-6 inline-block max-w-full truncate">
                {email}
              </div>
              <p className="text-slate-400 text-xs mb-8">
                Didn’t receive the email? Check your spam folder or try submitting again.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  Try Another Email
                </button>
                <Link 
                  href="/login"
                  className="w-full py-3 bg-[#151930] hover:bg-[#1f2547] text-white text-sm font-bold rounded-xl transition-all text-center shadow-sm"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-xs">
                  <Mail size={26} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Forgot Password?
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Enter your registered email address and we’ll send you a password recovery link.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetRequest} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Account Email
                  </label>
                  <input 
                    id="forgot-email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium text-slate-900 placeholder-slate-400"
                    required
                  />
                </div>

                <button 
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#151930] hover:bg-[#1f2547] text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending link...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Remembered your password?{' '}
                  <Link 
                    href="/login"
                    className="text-[#151930] hover:underline font-bold transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
