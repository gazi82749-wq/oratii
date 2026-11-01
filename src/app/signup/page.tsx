import { Suspense } from 'react';
import { Metadata } from 'next';
import SignupClient from './SignupClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Create Free Account | Oratii AI Speech & Interview Coach',
  description: 'Create your free Oratii account. Get 15 free AI coaching credits for real-time speech analysis, vocal pacing, and voice mock interviews.',
  alternates: {
    canonical: `${siteUrl}/signup`,
  },
  openGraph: {
    title: 'Create Free Account | Oratii AI Speech & Interview Coach',
    description: 'Create your free Oratii account. Claim 15 free AI coaching credits for vocal pacing and mock interview practice.',
    url: `${siteUrl}/signup`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Create Free Account - Oratii AI Speech Coach',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Free Account | Oratii AI Speech Coach',
    description: 'Get started with 15 free AI speech coaching and mock interview credits.',
    images: [`${siteUrl}/og-image.png`],
  },
};

const signupFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Oratii free to get started?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Creating a free Oratii account gives you 10 base welcome credits (or 15 credits with a referral link) to test speech analysis, pacing evaluation, and mock interview practice with zero credit card required.',
      },
    },
    {
      '@type': 'Question',
      name: 'What can I do with a free Oratii account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can practice real-time speech coaching with words-per-minute (WPM) tracking, filler word detection, daily speech habits, and video mock interviews.',
      },
    },
  ],
};

export default function SignupPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(signupFaqSchema) }}
      />
      <header className="sr-only">
        <h1>Create Your Free Oratii Account</h1>
        <p>Sign up to unlock real-time speech evaluation, vocal pacing audits, and AI mock interview practice.</p>
      </header>
      <Suspense fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      }>
        <SignupClient />
      </Suspense>
    </>
  );
}
