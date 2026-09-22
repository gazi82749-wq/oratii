'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTrainerAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAuthorized(false);
        setLoading(false);
        router.push('/login?redirectedFrom=' + pathname);
        return;
      }

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role !== 'trainer' && profile?.role !== 'admin') {
        router.push('/trainer/onboarding');
        return;
      }

      // Check academy if not on onboarding route
      if (pathname !== '/trainer/onboarding') {
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

    checkTrainerAuth();
  }, [pathname, router]);

  // While checking auth on the client, render a simple loading state or just nothing
  // to prevent flashing of the protected content.
  if (loading) {
    return null; // Return null so we don't flash content. NextJS suspense will handle layout transitions smoothly.
  }

  // If we're not authorized but still on this page (redirecting), render nothing
  if (!isAuthorized && pathname !== '/trainer/onboarding') {
    return null;
  }

  return <>{children}</>;
}
