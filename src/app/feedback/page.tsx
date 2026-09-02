import { Metadata } from 'next';
import FeedbackClient from './FeedbackClient';

export const metadata: Metadata = {
  title: 'User Feedback & Reviews',
  description: 'Share your experience with Oratii AI Speech & Presentation Coach. Help us improve vocal pacing, slide auditing, and viva preparation features.',
  openGraph: {
    title: 'User Feedback | Oratii AI Speech Coach',
    description: 'Share your feedback or feature requests for Oratii AI Speech & Presentation Coach.',
  },
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
