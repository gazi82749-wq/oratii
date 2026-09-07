import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oratii - AI Speech & Presentation Coach',
    short_name: 'Oratii',
    description: 'Get real-time AI feedback on your vocal pacing, presentation slides, and job interview delivery.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8FAFC',
    theme_color: '#1B2140',
    scope: '/',
    id: '/',
    categories: ['education', 'productivity', 'utilities'],
    shortcuts: [
      {
        name: '3-Min Speech Coach',
        short_name: 'Speech Coach',
        description: 'Live Vocal Pacing & Filler Word Analyzer',
        url: '/speech-coach',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Campus Mock Interview',
        short_name: 'Interview',
        description: 'Resume PDF & Voice AI Placement Round',
        url: '/interview',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Slide Deck & Viva Studio',
        short_name: 'Viva Studio',
        description: 'Webcam Rehearsal & Academic Viva Defense',
        url: '/presentation',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
