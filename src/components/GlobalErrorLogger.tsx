'use client';

import { useEffect } from 'react';
import { logClientError } from '@/lib/logger';

export default function GlobalErrorLogger() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handle uncaught standard JavaScript runtime errors
    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message || 'Uncaught Client Error');
      logClientError(error, {
        source: window.location.pathname || 'Client Window',
        category: 'Website Client',
        extraDetails: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    // Handle unhandled Promise rejections (e.g. failed async fetch, unhandled async throw)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const error = reason instanceof Error ? reason : new Error(String(reason || 'Unhandled Promise Rejection'));
      logClientError(error, {
        source: window.location.pathname || 'Client Window',
        category: 'Website Client',
        extraDetails: {
          type: 'UnhandledPromiseRejection',
          reason: String(reason),
        },
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
