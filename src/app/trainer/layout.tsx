'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ShieldAlert, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import EducatorSwitchModal from '@/components/EducatorSwitchModal';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isNormalUser, setIsNormalUser] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showEducatorModal, setShowEducatorModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkTrainerAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            setIsAuthorized(false);
            setLoading(false);
            router.push('/login?redirectedFrom=' + encodeURIComponent(pathname));
          }
          return;
        }

        if (isMounted) {
          setUserId(session.user.id);
        }

        // Parallelize profile role & academy queries to eliminate sequential waterfalls
        const [profileRes, academyRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle(),
          supabase
            .from('academies')
            .select('id')
            .eq('owner_id', session.user.id)
            .maybeSingle(),
        ]);

        if (!isMounted) return;

        const role = profileRes.data?.role;
        const academy = academyRes.data;

        // Normal students (role !== trainer && role !== admin) MUST NOT access Trainer Portal
        if (role !== 'trainer' && role !== 'admin') {
          setIsNormalUser(true);
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // User is a valid trainer/admin. If no academy setup yet, guide to onboarding.
        if (!academy && pathname !== '/trainer/onboarding') {
          router.push('/trainer/onboarding');
          return;
        }

        // If academy already configured and user visits onboarding, direct to dashboard
        if (academy && pathname === '/trainer/onboarding') {
          router.push('/trainer');
          return;
        }

        setIsAuthorized(true);
        setIsNormalUser(false);
      } catch (err) {
        console.error('Trainer auth check error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkTrainerAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // Loading skeleton with branded Oratii style
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1426] flex items-center justify-center p-6 text-white font-sans antialiased">
        <div className="flex flex-col items-center gap-3.5 max-w-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F2A93B] to-amber-500 flex items-center justify-center font-black text-slate-900 shadow-xl shadow-amber-500/20 animate-pulse">
            O
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#F2A93B] border-t-transparent rounded-full animate-spin" />
              Opening Trainer Portal
            </p>
            <p className="text-xs text-slate-400 font-medium">Verifying instructor academy credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // Normal User Gate: Strictly protect Trainer Portal from student accounts
  if (isNormalUser) {
    return (
      <div className="min-h-screen bg-[#0F1426] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full bg-[#151930] border border-indigo-900/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#F2A93B] flex items-center justify-center shadow-lg mb-5">
            <GraduationCap size={28} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#F2A93B] text-[11px] font-black uppercase tracking-wider mb-3">
            <ShieldAlert size={12} /> Instructor Access Only
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white mb-2">
            Trainer Portal Restricted
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed mb-6">
            The Trainer Portal is reserved exclusively for verified speech coaches, university professors, and partner institutions. Your account is currently in <strong>Student / Learner Mode</strong>.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setShowEducatorModal(true)}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-[#F2A93B] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles size={14} /> Switch to Educator Mode (₹0)
            </button>

            <Link
              href="/dashboard"
              className="w-full py-3 px-5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              <ArrowLeft size={14} /> Return to Student Dashboard
            </Link>
          </div>
        </div>

        <EducatorSwitchModal
          isOpen={showEducatorModal}
          onClose={() => setShowEducatorModal(false)}
          userId={userId}
        />
      </div>
    );
  }

  // Not authorized fallback (redirect in progress)
  if (!isAuthorized && pathname !== '/trainer/onboarding') {
    return null;
  }

  return <>{children}</>;
}
