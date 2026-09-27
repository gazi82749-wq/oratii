import { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing & Credit Packs | Oratii AI Speech & Interview Coach',
  description: 'Simple pay-as-you-go credit packs for speech audio auditing, daily habit drills, and voice mock interview sessions. No subscriptions or hidden fees.',
  alternates: {
    canonical: 'https://oratii.in/pricing',
  },
  openGraph: {
    title: 'Pricing & Credit Packs | Oratii AI',
    description: 'Simple pay-as-you-go credit packs for AI speech coaching and voice mock interviews.',
    url: 'https://oratii.in/pricing',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do Oratii credits work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Credits are simple: 1 Credit = 1 Speech Audio Analysis, 1 Credit = 1 Voice Mock Interview, and 1 Credit = 1 Daily Challenge Drill. You only pay for what you actually use.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do paid credits ever expire?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No! Paid credit packs come with lifetime validity. Your credits never expire, so you can use them whenever you need to prepare for a speech or presentation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is included in the Free Trial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'When you sign up, you automatically receive 5 Free Credits with full access to test out Speech Analysis, PPT Slide Audits, and AI Viva Defense sessions.',
      },
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingClient />
    </>
  );
}
