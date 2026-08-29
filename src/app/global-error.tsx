"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          background: '#fafafa',
          color: '#151930',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            border: '4px solid #151930',
            padding: '3rem',
            maxWidth: '500px',
            background: '#fff',
            boxShadow: '8px 8px 0px #151930',
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>
              Something went wrong!
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '2rem' }}>
              An unexpected error occurred. Our team has been notified and is working on a fix.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 2rem',
                background: '#151930',
                color: '#fff',
                border: '3px solid #151930',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #151930',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
