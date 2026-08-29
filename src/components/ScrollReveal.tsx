'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal â€” wraps children and reveals them with a polished animation when entering viewport.
 * @param {string} className - additional classes
 * @param {number} delay - delay in ms
 * @param {'up'|'left'|'right'|'scale'} direction - animation type
 */
export default function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: '600px 0px 600px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const initial = {
    up: { transform: 'translateY(16px)' },
    left: { transform: 'translateX(-16px)' },
    right: { transform: 'translateX(16px)' },
    scale: { transform: 'scale(0.98)' },
  };

  const visible = { transform: 'none', opacity: 1 };
  const hidden = { ...initial[direction], opacity: 0 };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(isVisible ? visible : hidden),
        transition: `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
