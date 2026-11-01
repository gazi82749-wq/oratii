import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'AI Speech Coach & Vocal Pacing Analyzer | Oratii',
  description: 'Analyze vocal pacing, count filler words, and polish public speaking clarity with real-time AI evaluation and speech score audits.',
  alternates: {
    canonical: `${siteUrl}/speech-coach`,
  },
  openGraph: {
    title: 'AI Speech Coach & Vocal Pacing Analyzer | Oratii',
    description: 'Analyze vocal pacing, detect filler words, and master presentation delivery with instant AI coaching.',
    url: `${siteUrl}/speech-coach`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'AI Speech Coach & Vocal Pacing Analyzer - Oratii',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Speech Coach & Vocal Pacing Analyzer | Oratii',
    description: 'Instant AI speech feedback on pacing, filler words, clarity, and vocal tone.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function SpeechCoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
