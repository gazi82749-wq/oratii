'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, Mic, BarChart3, Trophy, Check } from 'lucide-react';

export default function SignupClient() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [selectedRole, setSelectedRole] = useState<'student' | 'trainer'>('student');

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role: selectedRole }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const mins = Math.ceil((data.retryAfterSeconds || 900) / 60);
        setError(`Too many signup attempts. Please try again in ${mins} minute${mins > 1 ? 's' : ''}.`);
        setLoading(false);
        return;
      }

      if (res.status === 409) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      if (data.status === 'confirmation_required') {
        setSuccess(true);
        setLoading(false);
        return;
      }

      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      if (typeof document !== 'undefined') {
        document.cookie = "Oratii_logged_in=true; path=/; max-age=31536000; SameSite=Lax";
      }
      
      if (selectedRole === 'trainer') {
        window.location.href = '/trainer/onboarding';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    const nextUrl = selectedRole === 'trainer' ? '/trainer/onboarding' : '/dashboard';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}&role=${selectedRole}`,
        queryParams: {
          prompt: 'select_account',
        },
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased relative overflow-hidden">
      
      {/* ─── LEFT PANEL: Branding (hidden on mobile) ─── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#151930] relative flex-col justify-between p-12 overflow-hidden text-white border-r border-indigo-900/30">
        
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F2A93B]/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#F2A93B] text-[#151930] flex items-center justify-center font-black text-lg rounded-xl shadow-md">O</div>
            <span className="text-2xl font-black text-white tracking-tight">Oratii</span>
          </Link>
        </div>

        {/* Main Branding Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-6 border border-white/10 w-max">
            <Sparkles size={13} className="text-amber-400" /> Free Starter Account
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Present with <span className="text-[#F2A93B]">unshakeable confidence.</span>
          </h2>
          <p className="text-base lg:text-lg text-slate-300 font-medium leading-relaxed max-w-sm">
            Join thousands of speakers who use AI-powered coaching to eliminate filler words, perfect their pacing, and deliver with clarity.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-4 border-t border-white/10 pt-8">
          {[
            { icon: Mic, text: 'Real-time speech analysis' },
            { icon: BarChart3, text: 'Instant slide deck evaluation' },
            { icon: Trophy, text: 'Gamified challenges & badges' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Icon size={16} />
                </span>
                <span className="text-sm font-bold text-slate-200">{f.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ——— RIGHT PANEL: Signup Form ——— */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        
        {/* Mobile/Tablet Navbar */}
        <nav className="w-full px-6 md:px-10 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-[#151930] text-[#F2A93B] flex items-center justify-center font-black text-lg shadow-sm">O</div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">Oratii</span>
          </Link>
          <div className="flex-1" />
          <Link 
            href="/login"
            className="text-xs font-black text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all bg-white shadow-2xs"
          >
            Log in
          </Link>
        </nav>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-[420px] bg-white border border-indigo-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <Check size={32} className="stroke-[3]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email!</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  We sent a confirmation link to <strong className="text-slate-800">{email}</strong>. Click it to activate your account.
                </p>
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-sm"
                >
                  Return to Login
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Create your account</h1>
                  <p className="text-slate-500 text-sm">Start practicing with AI coaching today</p>
                </div>

                {/* Google Button */}
                <button 
                  id="signup-google"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full py-3 bg-white border border-indigo-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 mb-6 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google for Oratii
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-indigo-200"></div></div>
                  <span className="relative bg-white px-3 text-xs font-medium text-slate-400">Or sign up with email</span>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium text-center">
                    {error}
                  </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  {/* Upwork-style 2-Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-2">I am joining as a:</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          selectedRole === 'student'
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">🎓</span>
                          {selectedRole === 'student' && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          )}
                        </div>
                        <div className="font-extrabold text-xs text-slate-900">Learner / Speaker</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Practice speech, viva & slides</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('trainer')}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          selectedRole === 'trainer'
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-slate-900'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">🏫</span>
                          {selectedRole === 'trainer' && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          )}
                        </div>
                        <div className="font-extrabold text-xs text-slate-900">Educator / Coach</div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Manage batches & students</div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">Full Name</label>
                    <input 
                      id="signup-name"
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Gazi Abbas" 
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-400 transition-all text-slate-900 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">Email Address</label>
                    <input 
                      id="signup-email"
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com" 
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-400 transition-all text-slate-900 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">Password</label>
                    <div className="relative">
                      <input 
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters" 
                        minLength={8}
                        className="w-full bg-white border border-indigo-200 rounded-xl pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-400 transition-all text-slate-900 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      id="signup-submit"
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm hover:shadow disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    >
                      {loading ? 'Creating account...' : 'Create free account'}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-6 border-t border-indigo-100 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-slate-900 font-semibold hover:underline">
                      Log in
                    </Link>
                  </p>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-slate-400">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-slate-600">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
          </p>
        </div>

      </div>

    </main>
  );
}
