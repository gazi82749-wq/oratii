'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event that Supabase fires
    // when the user arrives via the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if a session already exists (user may have already landed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-400 border-red-500', width: '20%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-amber-400 border-amber-500', width: '40%' };
    if (score <= 3) return { label: 'Good', color: 'bg-amber-300 border-amber-400', width: '60%' };
    if (score <= 4) return { label: 'Strong', color: 'bg-green-400 border-green-500', width: '80%' };
    return { label: 'Excellent', color: 'bg-green-500 border-green-600', width: '100%' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordUpdate = async (e) => {
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
    <main className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans antialiased relative overflow-hidden">
      
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>

      {/* Decorative Shapes */}
      <div className="absolute top-20 right-16 w-16 h-16 bg-green-200 border-4 border-slate-900 rotate-12 opacity-20 hidden md:block"></div>
      <div className="absolute bottom-20 left-16 w-14 h-14 bg-amber-300 border-4 border-slate-900 rounded-full opacity-20 hidden md:block"></div>

      {/* Navbar */}
      <nav className="w-full px-6 md:px-10 py-6 relative z-10 flex justify-between items-center">
        <div 
          onClick={() => router.push('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xl border-3 border-slate-900 group-hover:-rotate-6 transition-transform shadow-[3px_3px_0px_#151930]">V</div>
          <span className="text-xl font-black text-slate-900 tracking-tight">Oratii</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 w-full relative z-10">
        <div className="w-full max-w-md bg-white border-4 border-slate-900 p-8 md:p-10 shadow-[8px_8px_0px_#151930] relative">
          
          {/* Decorative tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-green-200/80 border-2 border-slate-900 -rotate-1"></div>

          {success ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 border-4 border-slate-900 mx-auto mb-6 flex items-center justify-center shadow-[4px_4px_0px_#151930] rotate-3">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Password Updated!</h2>
              <p className="text-slate-500 font-bold text-sm mb-8">
                Your password has been successfully changed. You can now sign in with your new password.
              </p>
              <button 
                onClick={() => router.push('/login')}
                className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest border-3 border-slate-900 hover:bg-amber-400 hover:text-slate-900 hover:shadow-[6px_6px_0px_#151930] hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#151930]"
              >
                Go to Login →
              </button>
            </div>
          ) : !sessionReady ? (
            /* Waiting for session / invalid link */
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-[#FFF9D2] border-4 border-slate-900 mx-auto mb-6 flex items-center justify-center shadow-[4px_4px_0px_#151930] -rotate-3">
                <span className="text-4xl">⏳</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Verifying Link...</h2>
              <p className="text-slate-500 font-bold text-sm mb-6">
                We’re verifying your password reset link. If this takes too long, the link may have expired.
              </p>
              <button 
                onClick={() => router.push('/forgot-password')}
                className="w-full py-3 bg-white border-3 border-slate-900 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-[#FFF9D2] hover:shadow-[4px_4px_0px_#151930] hover:-translate-y-0.5 transition-all shadow-[3px_3px_0px_#151930]"
              >
                Request New Link
              </button>
            </div>
          ) : (
            /* Reset Form */
            <>
              {/* Header */}
              <div className="text-center mb-8 mt-2">
                <div className="w-16 h-16 bg-green-100 border-4 border-slate-900 mx-auto mb-5 flex items-center justify-center shadow-[4px_4px_0px_#151930] -rotate-3">
                  <span className="text-3xl">🔒</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Set New Password</h1>
                <p className="text-slate-500 font-bold font-handwriting text-lg">Make it strong and unique 💪</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-3 border-red-400 text-red-600 text-xs font-bold text-center shadow-[3px_3px_0px_#f87171]">
                  ⚠️ {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <input 
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password" 
                      className="w-full bg-[#FDFBF7] border-3 border-slate-900 px-4 py-3.5 text-sm focus:outline-none focus:shadow-[4px_4px_0px_#151930] focus:-translate-y-0.5 transition-all font-bold text-slate-900 placeholder-slate-400 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-sm font-black transition-colors"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {/* Password Strength Bar */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="w-full h-2 bg-indigo-200 border border-indigo-300">
                        <div 
                          className={`h-full ${strength.color} border-r-2 transition-all duration-300`} 
                          style={{ width: strength.width }}
                        ></div>
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest mt-1 text-slate-500">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input 
                    id="reset-confirm-password"
                    type={showPassword ? 'text' : 'password'} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password" 
                    className={`w-full bg-[#FDFBF7] border-3 px-4 py-3.5 text-sm focus:outline-none focus:shadow-[4px_4px_0px_#151930] focus:-translate-y-0.5 transition-all font-bold text-slate-900 placeholder-slate-400 ${
                      confirmPassword && confirmPassword !== newPassword 
                        ? 'border-red-400' 
                        : confirmPassword && confirmPassword === newPassword 
                          ? 'border-green-500' 
                          : 'border-slate-900'
                    }`}
                    required
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs font-black uppercase tracking-widest mt-1 text-red-500">Passwords don’t match</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs font-black uppercase tracking-widest mt-1 text-green-600">✓ Passwords match</p>
                  )}
                </div>

                <button 
                  id="reset-submit"
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest border-3 border-slate-900 hover:bg-amber-400 hover:text-slate-900 hover:shadow-[6px_6px_0px_#151930] hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#151930] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Updating...
                    </>
                  ) : 'Update Password →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
