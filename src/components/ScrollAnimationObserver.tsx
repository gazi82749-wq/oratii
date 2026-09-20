'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollAnimationObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Function to initialize intersection observer on animatable elements
    const observeElements = () => {
      const selectors = [
        '.animate-on-scroll',
        '.fade-up-scroll',
        '.scale-up-scroll',
        '.mobile-card-vibrant',
        '.app-card',
        '.card-elevated',
        'section',
      ];

      const elements = document.querySelectorAll(selectors.join(', '));

      if (!('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            }
          });
        },
        {
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.08,
        }
      );

      elements.forEach((el) => {
        // Add base class if not present
        if (!el.classList.contains('fade-up-scroll') && !el.classList.contains('animate-on-scroll')) {
          el.classList.add('fade-up-scroll');
        }
        observer.observe(el);
      });

      return observer;
    };

    // Run on initial mount and route changes
    const timer = setTimeout(() => {
      const observer = observeElements();
      return () => observer?.disconnect();
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
