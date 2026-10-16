"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Safe Sentry exception capture
    try {
      Sentry.captureException(error);
    } catch {
      // Swallowed
    }

    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => {
      setIsOffline(false);
      window.location.reload();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#F8FAFC' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#F8FAFC',
          color: '#0F172A',
          padding: '1.5rem',
          boxSizing: 'border-box',
        }}>
          <div style={{
            maxWidth: '460px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '2.5rem 2rem',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: isOffline ? '#FEF3C7' : '#FEE2E2',
              color: isOffline ? '#D97706' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '24px',
              fontWeight: 700,
            }}>
              !
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              margin: '0 0 0.75rem 0',
            }}>
              {isOffline ? 'Connection Interrupted' : 'Application Error'}
            </h1>

            <p style={{
              fontSize: '0.925rem',
              lineHeight: '1.6',
              color: '#64748B',
              margin: '0 0 2rem 0',
            }}>
              {isOffline
                ? 'Unable to load page assets due to an offline state or network interruption. Reconnecting once internet is restored.'
                : 'An unexpected issue occurred while rendering the page. Our engineering team has been notified.'}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleReload}
                style={{
                  padding: '0.75rem 1.75rem',
                  background: '#151930',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'background 0.2s',
                }}
              >
                Reload Page
              </button>

              <button
                onClick={() => reset()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#F1F5F9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>

              <a
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#F1F5F9',
                  color: '#334155',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
