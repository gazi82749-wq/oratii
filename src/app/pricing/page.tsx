import { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing & Credit Packs | Oratii AI Speech & Presentation Coach',
  description: 'Simple pay-as-you-go credit packs for speech audio auditing, presentation practice, and AI Viva defense sessions. No subscriptions or hidden fees.',
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
        text: 'Credits are simple: 1 Credit = 1 Speech Audio Analysis, 1 Credit = 1 Presentation Practice Session, and 2 Credits = 1 AI Viva Defense Q&A Session. You only pay for what you actually use.',
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
