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

export default function PricingPage() {
  return <PricingClient />;
}
