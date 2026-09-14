'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  MapPin,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Footer from '@/components/Footer';

export default function TrainerOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [instituteName, setInstituteName] = useState('');
  const [designation, setDesignation] = useState('Speech Coach');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login?redirectedFrom=/trainer/onboarding');
          return;
        }
        setUser(session.user);

        // Pre-fill name based on email prefix
        const defaultName = session.user.email?.split('@')[0] || '';
        setInstituteName(`${defaultName.charAt(0).toUpperCase() + defaultName.slice(1)} Speech Academy`);

        // Check user role: normal students cannot access educator onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.role !== 'trainer' && profile?.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        // Check if user has already registered an academy
        const { data: academy } = await supabase
          .from('academies')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (academy) {
          // Already registered trainer -> go straight to trainer portal
          router.push('/trainer');
          return;
        }
      } catch (err: any) {
        console.error('Onboarding auth check error:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instituteName.trim()) {
      setError('Please enter your Institute or Academy name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Session expired. Please log in again.');

      // 1. Update user profile role to 'trainer'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'trainer',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (profileError) {
        console.warn('Profile role update notice:', profileError.message);
      }

      // 2. Create or update academy record for trainer
      const res = await fetch('/api/trainer/academy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: instituteName.trim(),
          city: city.trim() || undefined,
          designation: designation.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.warn('Academy creation response notice:', data.error);
      }

      // 3. Success -> redirect to trainer dashboard
      router.push('/trainer');
    } catch (err: any) {
      setError(err?.message || 'Failed to complete educator setup.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
          <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading Educator Studio...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="w-full bg-[#151930] text-white py-8 px-6 sm:px-12 border-b border-indigo-900/40 relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F2A93B] text-[#151930] font-black text-xl flex items-center justify-center shadow-lg">
              O
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Oratii <span className="text-[#F2A93B]">Educator Studio</span>
              </h1>
              <p className="text-xs text-slate-300 font-medium">For Speech Coaches, Professors & Educational Institutions</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            ← Back to Student View
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white border border-indigo-100 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold uppercase tracking-wider mb-3">
              <Sparkles size={13} className="text-indigo-600" /> Educator Onboarding
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Set up your Teaching Hub
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">
              Create student batches, assign AI-scored presentation homework, and track class speaking progress analytics.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="institute-name" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Institute / Academy / Organization Name *
              </label>
              <div className="relative">
                <Building2 size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  id="institute-name"
                  type="text"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  placeholder="e.g. Oxford Speech Academy or Prof. Sharma's Batch"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="designation" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Your Role / Designation
                </label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    id="designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Public Speaking Coach"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  City / Region (Optional)
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Delhi, Mumbai, Bengaluru"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Feature Perks Box */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
              <span className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider block">
                Educator Perks Included:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-indigo-950">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-indigo-600 shrink-0" /> Unique 6-Digit Student Invite Codes
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-indigo-600 shrink-0" /> Automated Speech & Viva Grading
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-indigo-600 shrink-0" /> Student Pacing & Filler Word Metrics
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-indigo-600 shrink-0" /> Private Financial & Earnings Portal
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying Educator Hub...
                </>
              ) : (
                <>
                  Activate Educator Studio <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
