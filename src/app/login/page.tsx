import { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your Oratii account to access your AI speech reports, presentation slide audits, and viva coaching dashboard.',
  openGraph: {
    title: 'Log In | Oratii AI Speech Coach',
    description: 'Log in to access real-time AI public speaking coaching and slide deck analysis.',
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
