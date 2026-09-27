import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Oratii | AI Speech & Interview Coach',
  description: 'Master your public speaking with Oratii. Get instant AI feedback on your pacing, filler words, and voice mock interviews.',
  openGraph: {
    title: 'Oratii | AI Speech & Interview Coach',
    description: 'Master your public speaking with Oratii. Get instant AI feedback on your pacing, filler words, and voice mock interviews.',
    url: '/',
    siteName: 'Oratii',
    locale: 'en_US',
    type: 'website',
  },
};

export default function Home() {
  return <HomeClient />;
}
