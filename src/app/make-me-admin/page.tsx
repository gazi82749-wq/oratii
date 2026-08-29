'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, notFound } from 'next/navigation';

export default function MakeMeAdminPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [status, setStatus] = useState('Checking session...');
  const router = useRouter();

  useEffect(() => {
    async function execute() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setStatus('Error: You are not logged in! Please go to the homepage, log in with Google first, then come back to this page.');
          return;
        }

        setStatus(`Logged in as ${session.user.email}. Attempting to upgrade to Admin...`);

        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!existingProfile) {
          setStatus('Profile not found. Creating profile as admin...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: session.user.id, email: session.user.email, role: 'admin' }]);
            
          if (insertError) {
            setStatus(`Error creating profile: ${insertError.message}`);
            return;
          }
        } else {
          setStatus('Profile found. Updating role to admin...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', session.user.id);
            
          if (updateError) {
            setStatus(`Error updating profile: ${updateError.message}`);
            return;
          }
        }

        setStatus('Success! You are now an Admin. Redirecting to Admin Panel in 3 seconds...');
        setTimeout(() => {
          router.push('/admin');
        }, 3000);

      } catch (err: any) {
        setStatus(`Unexpected error: ${err.message}`);
      }
    }

    execute();
  }, [router]);

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center">
      <div className="w-16 h-16 bg-[#1B2140] text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold font-heading shadow-md shadow-[#1B2140]/20">O</div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-slate-900 mb-3">
        Admin Upgrade <span className="text-slate-400">Tool.</span>
      </h1>
      <p className="text-sm text-slate-500 font-medium mb-6">Oratii Development Environment</p>
      <div className="max-w-md w-full p-6 bg-white rounded-2xl border border-indigo-200/90 shadow-lg text-sm font-mono text-slate-700">
        {status}
      </div>
    </div>
  );
}
