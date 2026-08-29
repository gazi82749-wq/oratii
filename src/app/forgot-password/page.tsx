'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleResetRequest = async (e) => {
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
    <main className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans antialiased relative overflow-hidden">
      
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>

      {/* Decorative Shapes */}
      <div className="absolute top-16 left-20 w-14 h-14 bg-amber-300 border-4 border-slate-900 rotate-6 opacity-20 hidden md:block"></div>
      <div className="absolute bottom-24 right-16 w-18 h-18 bg-[#FFF9D2] border-4 border-slate-900 -rotate-12 opacity-20 hidden md:block"></div>

      {/* Navbar */}
      <nav className="w-full px-6 md:px-10 py-6 relative z-10 flex justify-between items-center">
        <div 
          onClick={() => router.push('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xl border-3 border-slate-900 group-hover:-rotate-6 transition-transform shadow-[3px_3px_0px_#151930]">V</div>
          <span className="text-xl font-black text-slate-900 tracking-tight">Oratii</span>
        </div>
        <button 
          onClick={() => router.push('/login')}
          className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 border-2 border-indigo-300 hover:border-slate-900 px-4 py-2 hover:shadow-[3px_3px_0px_#151930] hover:-translate-y-0.5 transition-all"
        >
          Back to Login
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 w-full relative z-10">
        <div className="w-full max-w-md bg-white border-4 border-slate-900 p-8 md:p-10 shadow-[8px_8px_0px_#151930] relative">
          
          {/* Decorative tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#FFF9D2]/80 border-2 border-slate-900 rotate-1"></div>

          {sent ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-amber-100 border-4 border-slate-900 mx-auto mb-6 flex items-center justify-center shadow-[4px_4px_0px_#151930] -rotate-3">
                <span className="text-4xl">📬</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Check Your Inbox!</h2>
              <p className="text-slate-500 font-bold text-sm mb-2">
                We’ve sent a password reset link to:
              </p>
              <p className="text-slate-900 font-black text-sm mb-6 underline decoration-amber-400 decoration-2 underline-offset-4">{email}</p>
              <p className="text-slate-400 text-xs font-bold mb-8">
                Didn’t receive the email? Check your spam folder or try again.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full py-3 bg-white border-3 border-slate-900 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-[#FFF9D2] hover:shadow-[4px_4px_0px_#151930] hover:-translate-y-0.5 transition-all shadow-[3px_3px_0px_#151930]"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest border-3 border-slate-900 hover:bg-amber-400 hover:text-slate-900 hover:shadow-[4px_4px_0px_#151930] hover:-translate-y-0.5 transition-all shadow-[3px_3px_0px_#151930]"
                >
                  Back to Login →
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Header */}
              <div className="text-center mb-8 mt-2">
                <div className="w-16 h-16 bg-[#FFF9D2] border-4 border-slate-900 mx-auto mb-5 flex items-center justify-center shadow-[4px_4px_0px_#151930] rotate-3">
                  <span className="text-3xl">🔑</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Forgot Password?</h1>
                <p className="text-slate-500 font-bold font-handwriting text-lg">No worries, we’ll send you a reset link ✨</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-3 border-red-400 text-red-600 text-xs font-bold text-center shadow-[3px_3px_0px_#f87171]">
                  ⚠️ {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleResetRequest} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    id="forgot-email"
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your account email" 
                    className="w-full bg-[#FDFBF7] border-3 border-slate-900 px-4 py-3.5 text-sm focus:outline-none focus:shadow-[4px_4px_0px_#151930] focus:-translate-y-0.5 transition-all font-bold text-slate-900 placeholder-slate-400"
                    required
                  />
                </div>

                <button 
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest border-3 border-slate-900 hover:bg-amber-400 hover:text-slate-900 hover:shadow-[6px_6px_0px_#151930] hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#151930] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Sending...
                    </>
                  ) : 'Send Reset Link →'}
                </button>
              </form>

              {/* Bottom Link */}
              <p className="mt-8 text-center text-sm text-slate-500 font-bold">
                Remember your password?{' '}
                <button 
                  onClick={() => router.push('/login')}
                  className="text-slate-900 underline underline-offset-4 decoration-2 decoration-amber-400 hover:decoration-amber-600 font-black transition-colors"
                >
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
