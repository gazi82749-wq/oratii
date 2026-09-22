'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkDashboardAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAuthorized(false);
        setLoading(false);
        router.push('/login?redirectedFrom=' + pathname);
        return;
      }

      // If logged in user is a trainer without an academy, enforce onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role === 'trainer') {
        const { data: academy } = await supabase
          .from('academies')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (!academy) {
          router.push('/trainer/onboarding');
          return;
        }
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkDashboardAuth();
  }, [pathname, router]);

  if (loading) {
    return null; // Prevent flash of content while checking DB
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
