import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oratii | AI Speech & Presentation Coach',
    short_name: 'Oratii',
    description: 'Get real-time AI feedback on your vocal pacing, presentation slides, and job interview delivery.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#1B2140',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
