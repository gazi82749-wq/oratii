import { Suspense } from 'react';
import { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Oratii account to access your AI speech reports, vocal analysis, and mock interview coaching dashboard.',
  openGraph: {
    title: 'Log In | Oratii AI Speech Coach',
    description: 'Log in to access real-time AI public speaking and mock interview coaching.',
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
