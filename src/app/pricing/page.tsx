import { Metadata } from 'next';
import PricingClient from './PricingClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Pricing & Credit Packs | Oratii AI Speech & Interview Coach',
  description: 'Simple pay-as-you-go credit packs for speech audio auditing, daily habit drills, and voice mock interview sessions. No subscriptions or hidden fees.',
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: 'Pricing & Credit Packs | Oratii AI',
    description: 'Simple pay-as-you-go credit packs for AI speech coaching and voice mock interviews.',
    url: `${siteUrl}/pricing`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Pricing & Credit Packs - Oratii AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
