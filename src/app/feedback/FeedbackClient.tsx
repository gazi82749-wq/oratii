'use client';

import React, { Suspense } from 'react';
import SupportFeedbackHub from '@/components/support/SupportFeedbackHub';

export default function FeedbackClient() {
  return <SupportFeedbackHub initialTab="feedback" />;
}
