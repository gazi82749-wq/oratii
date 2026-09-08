'use client';

import React, { Suspense } from 'react';
import SupportFeedbackHub from '@/components/support/SupportFeedbackHub';

export default function FeedbackClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <SupportFeedbackHub initialTab="feedback" />
    </Suspense>
  );
}
