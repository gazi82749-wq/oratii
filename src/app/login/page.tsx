import { Suspense } from 'react';
import { Metadata } from 'next';
import LoginClient from './LoginClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Log In to Your Account | Oratii AI Speech Coach',
  description: 'Log in to your Oratii account to access your AI speech reports, vocal pacing audits, and mock interview coaching dashboard.',
  alternates: {
    canonical: `${siteUrl}/login`,
  },
  openGraph: {
    title: 'Log In to Your Account | Oratii AI Speech Coach',
    description: 'Log in to access your AI speech reports, vocal pacing audits, and mock interview practice.',
    url: `${siteUrl}/login`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Log In to Oratii - AI Speech Coach',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Log In to Your Account | Oratii AI Speech Coach',
    description: 'Log in to access your AI speech analysis and mock interview sessions.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function LoginPage() {
  return (
    <>
      <header className="sr-only">
        <h1>Log In to Your Oratii Account</h1>
        <p>Access your AI speech evaluation dashboard, vocal pacing insights, and interview practice reports.</p>
      </header>
      <Suspense fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      }>
        <LoginClient />
      </Suspense>
    </>
  );
}
