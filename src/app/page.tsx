import { Metadata } from 'next';
import HomeClient from './HomeClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Oratii | AI Speech & Interview Coach',
  description: 'Master your public speaking with Oratii. Get instant AI feedback on your pacing, filler words, and voice mock interviews.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Oratii | AI Speech & Interview Coach',
    description: 'Master your public speaking with Oratii. Get instant AI feedback on your pacing, filler words, and voice mock interviews.',
    url: siteUrl,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Oratii - AI Speech & Interview Coach',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function Home() {
  return <HomeClient />;
}
