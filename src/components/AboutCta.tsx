'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AboutCta() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/speech-coach"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          Start Practice Drills <ArrowRight size={16} />
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-200 shadow-sm transition-all"
        >
          View Credit Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
      {user ? (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          Go to Dashboard <ArrowRight size={16} />
        </Link>
      ) : (
        <Link
          href="/signup"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          Create Account (5 Welcome Credits) <ArrowRight size={16} />
        </Link>
      )}

      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-200 shadow-sm transition-all"
      >
        View Credit Plans
      </Link>
    </div>
  );
}
