import { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: 'Create Free Account',
  description: 'Sign up for a free Oratii account and get 10 Base + 5 Bonus Credits (15 Total Credits) to test real-time AI speech coaching and voice mock interviews.',
  openGraph: {
    title: 'Create Free Account | Oratii AI Speech & Mock Interview Coach',
    description: 'Sign up for free and get 10 Base + 5 Bonus Credits (15 Total Credits) for AI speech coaching and voice mock interviews.',
  },
};

export default function SignupPage() {
  return <SignupClient />;
}
