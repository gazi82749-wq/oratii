import { Metadata } from 'next';
import SupportClient from './SupportClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'Help & Support Desk | Oratii AI Speech Coach',
  description: 'Get help with Oratii AI Speech & Presentation Coach. Submit support tickets, search help guides, or contact technical support.',
  alternates: {
    canonical: `${siteUrl}/support`,
  },
  openGraph: {
    title: 'Help & Support Desk | Oratii AI Speech Coach',
    description: 'Need help with Oratii? Search guides or submit a support ticket for technical assistance.',
    url: `${siteUrl}/support`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Oratii Help & Support Desk',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help & Support Desk | Oratii',
    description: 'Search guides or submit a support ticket for Oratii AI assistance.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function SupportPage() {
  return <SupportClient />;
}
