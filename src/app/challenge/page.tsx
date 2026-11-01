import { Metadata } from 'next';
import ChallengeClient from './ChallengeClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: '20-Day Public Speaking Challenge | Oratii Daily Speech Habits',
  description: 'Build daily public speaking confidence with 10-day progressive vocal drills, real-time AI speech pacing audits, and habit streaks.',
  alternates: {
    canonical: `${siteUrl}/challenge`,
  },
  openGraph: {
    title: '20-Day Public Speaking Challenge | Oratii Daily Speech Habits',
    description: 'Build daily vocal confidence with 10-day progressive speech drills and AI pacing feedback.',
    url: `${siteUrl}/challenge`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '20-Day Public Speaking Challenge - Oratii',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '20-Day Public Speaking Challenge | Oratii',
    description: 'Practice daily vocal habits, reduce filler words, and master presentation pacing.',
    images: [`${siteUrl}/og-image.png`],
  },
};

const challengeFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the Oratii Daily Public Speaking Challenge?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Oratii Daily Challenge provides daily 1-to-2 minute speech prompts designed to build speaking confidence, eliminate filler words, and calibrate natural conversational pacing without overwhelming preparation.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do streaks work in the Oratii speech challenge?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Completing your daily speaking prompt advances your streak and awards XP badges. Keeping your streak active builds vocal muscle memory and fluency over time.',
      },
    },
  ],
};

export default function ChallengePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(challengeFaqSchema) }}
      />
      <ChallengeClient />
    </>
  );
}
