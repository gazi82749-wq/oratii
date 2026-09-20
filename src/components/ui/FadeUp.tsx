'use client';

import React, { useState, useEffect, useRef } from 'react';

// Modern Intersection-Observer Scroll Reveal with Stagger & Smooth Transitions
export function FadeUp({
  children,
  className = '',
  delay = 0,
  duration = 700,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
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
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elRef}
      style={{ transitionDuration: `${duration}ms` }}
      className={`transition-all cubic-bezier(0.16,1,0.3,1) ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.98]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Directional Left Slide Scroll Reveal
export function FadeInLeft({
  children,
  className = '',
  delay = 0,
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
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elRef}
      className={`transition-all duration-700 cubic-bezier(0.16,1,0.3,1) ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Directional Right Slide Scroll Reveal
export function FadeInRight({
  children,
  className = '',
  delay = 0,
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
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elRef}
      className={`transition-all duration-700 cubic-bezier(0.16,1,0.3,1) ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
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
