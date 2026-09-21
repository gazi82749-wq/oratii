'use client';

import React from 'react';
import ModernBackgroundAnimation, { BackgroundVariant } from './ModernBackgroundAnimation';
import { FadeUp } from './FadeUp';

interface SectionWrapperProps {
  id?: string;
  variant?: BackgroundVariant;
  className?: string;
  containerClassName?: string;
  animateContent?: boolean;
  children: React.ReactNode;
}

export default function SectionWrapper({
  id,
  variant = 'global',
  className = '',
  containerClassName = 'max-w-7xl mx-auto px-4 sm:px-6',
  animateContent = true,
  children,
}: SectionWrapperProps) {
  return (
    <section id={id} className={`relative py-12 sm:py-24 scroll-mt-20 overflow-hidden ${className}`}>
      <ModernBackgroundAnimation variant={variant}>
        <div className={containerClassName}>
          {animateContent ? (
            <FadeUp delay={100}>{children}</FadeUp>
          ) : (
            children
          )}
        </div>
      </ModernBackgroundAnimation>
    </section>
  );
}
