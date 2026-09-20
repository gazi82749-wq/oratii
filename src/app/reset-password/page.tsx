'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Check, Loader2, Lock, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY or SIGNED_IN event that Supabase fires on link click
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true);
      }
    });

    // Also check if a session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    // Timeout fallback after 4 seconds if link token is invalid/missing
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', width: '20%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: '40%' };
    if (score <= 3) return { label: 'Good', color: 'bg-amber-400', width: '60%' };
    if (score <= 4) return { label: 'Strong', color: 'bg-emerald-500', width: '80%' };
    return { label: 'Excellent', color: 'bg-emerald-600', width: '100%' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      {/* Navbar */}
      <nav className="w-full px-6 md:px-10 py-6 flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#151930] text-[#F2A93B] flex items-center justify-center font-black text-lg shadow-sm">
            O
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">Oratii</span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 w-full">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50">
          {success ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Password Updated!
              </h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Your password has been securely updated. You can now sign in with your new credentials.
              </p>
              <Link 
                href="/login"
                className="w-full py-3.5 bg-[#151930] hover:bg-[#1f2547] text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Go to Sign In
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : !sessionReady ? (
            /* Waiting for session */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xs">
                {timedOut ? (
                  <AlertCircle size={32} className="text-amber-600" />
                ) : (
                  <Loader2 size={32} className="text-indigo-600 animate-spin" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                {timedOut ? 'Reset Link Expired or Invalid' : 'Verifying Reset Link'}
              </h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                {timedOut 
                  ? 'We could not verify your password reset link. Please click below to send a fresh reset link to your email.'
                  : 'We’re authenticating your secure reset token. If this takes more than a few seconds, your link may have expired.'}
              </p>
              <Link 
                href="/forgot-password"
                className="inline-block px-6 py-3 bg-[#151930] hover:bg-[#1f2547] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Request New Password Link
              </Link>
            </div>
          ) : (
            /* Reset Form */
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-xs">
                  <Lock size={26} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Set New Password
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Choose a strong, unique password for your Oratii account.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input 
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters" 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium text-slate-900 placeholder-slate-400 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2.5">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${strength.color} transition-all duration-300 rounded-full`} 
                          style={{ width: strength.width }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[11px] text-slate-400 font-medium">Strength</span>
                        <span className="text-[11px] font-bold text-slate-600">{strength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input 
                    id="reset-confirm-password"
                    type={showPassword ? 'text' : 'password'} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password" 
                    className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-medium text-slate-900 placeholder-slate-400 ${
                      confirmPassword && confirmPassword !== newPassword 
                        ? 'border-rose-300' 
                        : confirmPassword && confirmPassword === newPassword 
                          ? 'border-emerald-300' 
                          : 'border-slate-200'
                    }`}
                    required
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs font-semibold mt-1.5 text-rose-600">
                      Passwords don’t match
                    </p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs font-semibold mt-1.5 text-emerald-600 flex items-center gap-1">
                      <Check size={12} className="stroke-[3]" /> Passwords match
                    </p>
                  )}
                </div>

                <button 
                  id="reset-submit"
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full py-3.5 bg-[#151930] hover:bg-[#1f2547] text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating password...
                    </>
                  ) : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
