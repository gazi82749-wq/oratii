import { Metadata } from 'next';
import FeedbackClient from './FeedbackClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'User Feedback & Reviews | Oratii AI Speech Coach',
  description: 'Share your experience with Oratii AI Speech & Presentation Coach. Help us improve vocal pacing, slide auditing, and viva preparation features.',
  alternates: {
    canonical: `${siteUrl}/feedback`,
  },
  openGraph: {
    title: 'User Feedback & Reviews | Oratii AI Speech Coach',
    description: 'Share your feedback or feature requests for Oratii AI Speech & Presentation Coach.',
    url: `${siteUrl}/feedback`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'User Feedback - Oratii AI Speech Coach',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'User Feedback & Reviews | Oratii',
    description: 'Help us improve Oratii AI speech coaching and mock interview features.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
