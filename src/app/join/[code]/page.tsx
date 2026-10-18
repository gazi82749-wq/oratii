'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Mic,
  Briefcase,
  Tv,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function StudentJoinBatchPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params?.code as string)?.toUpperCase();

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  useEffect(() => {
    async function checkState() {
      try {
        setLoading(true);
        // 1. Check user session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        // 2. Fetch batch info
        if (code) {
          const res = await fetch(`/api/trainer/join?code=${code}`);
          if (res.ok) {
            const data = await res.json();
            setBatch(data.batch);
          } else {
            setError('Invalid or expired batch code. Please check your link.');
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load batch info.');
      } finally {
        setLoading(false);
      }
    }
    checkState();
  }, [code]);

  const handleJoin = async () => {
    if (!user) {
      router.push(`/signup?redirect=/join/${code}`);
      return;
    }

    setJoining(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/trainer/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (res.ok) {
        setJoinedSuccess(true);
        setTimeout(() => {
          router.push('/dashboard?batch_joined=true');
        }, 2000);
      } else {
        setError(data.error || 'Failed to join batch');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while joining.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Resolving Class Invite...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-black text-slate-900">Batch Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The batch code <span className="font-mono font-bold text-slate-700">[{code}]</span> could not be verified. Please ask your trainer for an updated link.
          </p>
          <Link
            href="/dashboard"
            rel="nofollow"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-indigo-100 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Academy Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <GraduationCap size={32} />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase tracking-wider">
            Official Class Invite
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {batch.academies?.name || 'Partner Academy'}
          </h1>
          {batch.academies?.city && (
            <p className="text-xs text-slate-400 font-medium">📍 {batch.academies.city}</p>
          )}
        </div>

        {/* Batch Info Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classroom Batch</span>
            <span className="font-mono text-xs font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
              {batch.code}
            </span>
          </div>

          <h2 className="text-base font-black text-slate-900">{batch.name}</h2>

          {batch.description && (
            <p className="text-xs text-slate-500 leading-relaxed">{batch.description}</p>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-xs font-semibold text-slate-600">
            {batch.track === 'speech' ? (
              <span className="flex items-center gap-1.5 text-rose-600">
                <Mic size={14} /> Speech & Fluency Track
              </span>
            ) : batch.track === 'interview' ? (
              <span className="flex items-center gap-1.5 text-amber-600">
                <Briefcase size={14} /> Placement Mock Interview Track
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-indigo-600">
                <Tv size={14} /> Presentation Practice & Academic Viva Track
              </span>
            )}
          </div>
        </div>

        {/* Success Banner */}
        {joinedSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 size={28} className="text-emerald-600 mx-auto" />
            <h3 className="text-sm font-black text-emerald-900">Enrolled Successfully!</h3>
            <p className="text-xs text-emerald-700 font-medium">
              Redirecting you to your practice dashboard...
            </p>
          </div>
        ) : (
          /* Join Actions */
          <div className="space-y-3 pt-2">
            {user ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {joining ? 'Joining Class...' : 'Join Classroom & Start Practice'}
                <ArrowRight size={15} />
              </button>
            ) : (
              <div className="space-y-2.5">
                <Link
                  href={`/signup?redirect=/join/${code}`}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-center"
                >
                  Create Account & Join (Get 10 Free Credits)
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href={`/login?redirect=/join/${code}`}
                  className="w-full py-2.5 px-6 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-all block text-center"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            )}

            <p className="text-[11px] text-center text-slate-400 font-medium">
              ✨ Free for students. Your practice drills will automatically sync with your teacher.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
