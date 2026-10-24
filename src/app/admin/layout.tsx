'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { isAuthorizedAdminEmail } from '@/lib/adminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import ThemeProvider from '@/components/admin/ThemeProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAuthorized(false);
        setLoading(false);
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        return;
      }

      // Role-based admin check: Query profiles.role from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      const userEmail = session.user.email?.toLowerCase().trim() || '';
      const isAllowedAdmin = isAuthorizedAdminEmail(userEmail) || profile?.role === 'admin';

      if (isAllowedAdmin) {
        setIsAuthorized(true);
        if (pathname === '/admin/login') {
          router.push('/admin');
        }
      } else {
        setIsAuthorized(false);
        setErrorMsg('Your account does not have administrator privileges.');
        router.push('/');
      }

      setLoading(false);
    };

    checkAdminAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAdminAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  if (loading && pathname !== '/admin/login') {
    return (
      <div className="h-screen flex items-center justify-center bg-indigo-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-indigo-900 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-semibold tracking-wide">Checking administrator authorization...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return (
      <>
        {errorMsg && (
          <div className="absolute top-0 left-0 w-full p-3 bg-red-500 text-white text-center text-sm font-semibold z-50">
            {errorMsg}
          </div>
        )}
        {children}
      </>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-indigo-50 dark:bg-slate-950 overflow-hidden">
        <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader onToggleMobileMenu={() => setMobileOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto bg-indigo-50 dark:bg-slate-950">
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
