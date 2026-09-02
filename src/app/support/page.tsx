import { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Support & Help Center',
  description: 'Get help with Oratii AI Speech & Presentation Coach. Submit support tickets, search help guides, or contact technical support.',
  openGraph: {
    title: 'Support Center | Oratii AI Speech Coach',
    description: 'Need help with Oratii? Search guides or submit a support ticket for technical assistance.',
  },
};

export default function SupportPage() {
  return <SupportClient />;
}
