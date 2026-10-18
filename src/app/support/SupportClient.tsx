'use client';

import React, { Suspense } from 'react';
import SupportFeedbackHub from '@/components/support/SupportFeedbackHub';

export default function SupportClient() {
  return <SupportFeedbackHub initialTab="ticket" />;
}
