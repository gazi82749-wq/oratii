'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollAnimationObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Function to observe explicitly animated elements
    const observeElements = () => {
      const selectors = [
        '.animate-on-scroll',
        '.fade-up-scroll',
        '.scale-up-scroll',
        '.slide-right-scroll',
        '.slide-left-scroll',
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
          rootMargin: '0px 0px -20px 0px',
          threshold: 0.05,
        }
      );

      elements.forEach((el) => {
        observer.observe(el);
      });

      return observer;
    };

    const timer = setTimeout(() => {
      const observer = observeElements();
      return () => observer?.disconnect();
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
