import { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: 'Create Free Account',
  description: 'Sign up for a free Oratii account and get 10 free credits to test real-time AI speech coaching and mock interview prep.',
  openGraph: {
    title: 'Create Free Account | Oratii AI Speech Coach',
    description: 'Sign up for free and master your public speaking with Oratii AI Speech & Mock Interview Coach.',
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
