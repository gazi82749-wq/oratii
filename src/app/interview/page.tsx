import { Metadata } from 'next';
import InterviewClient from './InterviewClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

export const metadata: Metadata = {
  title: 'AI Voice Mock Interview Studio | Oratii Interview Coach',
  description: 'Practice job interviews with an AI interviewer in real time. Get instant feedback on pacing, filler words, clarity, and STAR answers.',
  alternates: {
    canonical: `${siteUrl}/interview`,
  },
  openGraph: {
    title: 'AI Voice Mock Interview Studio | Oratii Interview Coach',
    description: 'Practice real-time job interviews with photorealistic AI interviewers. Master behavioral, STAR, and technical questions.',
    url: `${siteUrl}/interview`,
    siteName: 'Oratii',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'AI Voice Mock Interview Studio - Oratii',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Voice Mock Interview Studio | Oratii',
    description: 'Practice real-time job interviews with an interactive AI interviewer. Instant pacing and content feedback.',
    images: [`${siteUrl}/og-image.png`],
  },
};

const interviewFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does the Oratii AI Voice Mock Interview Studio work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Oratii AI Mock Interview Studio simulates a live video call with an AI interviewer. You hear realistic voice questions, respond via your microphone and optional webcam, and receive instant feedback on your pacing, filler words, answer structure (STAR method), and eye contact.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of job interviews can I practice on Oratii?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can practice software engineering, product management, marketing, sales, consulting, MBA admissions, academic viva defenses, and standard HR behavioral interviews.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my interview audio and video stored or used for AI training?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Oratii enforces strict zero-retention privacy policies. Video eye-contact analysis runs on-device in your browser using WASM, and speech audio is never stored or used to train third-party AI models.',
      },
    },
  ],
};

export default function InterviewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(interviewFaqSchema) }}
      />
      
      {/* Search Engine Accessible Semantic Header & Overview */}
      <header className="sr-only">
        <h1>AI Voice Mock Interview Studio</h1>
        <p>
          Practice real-time job interviews with interactive AI interviewers. Master behavioral questions, technical screenings, and STAR response pacing with instant vocal feedback.
        </p>
      </header>

      {/* Main Studio Interactive Client */}
      <InterviewClient />
    </>
  );
}
