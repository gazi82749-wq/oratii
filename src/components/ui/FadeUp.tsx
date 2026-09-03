'use client';

import React, { useState, useEffect, useRef } from 'react';

// Zero-Delay Pre-Loading Scroll Reveal (Pre-loads 600px ahead so content is instant)
export function FadeUp({
  children,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: '600px 0px 600px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elRef}
      className={`transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function useInViewAnim(options = { threshold: 0.5 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.threshold]);

  return [ref, isVisible] as const;
}
