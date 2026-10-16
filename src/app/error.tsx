'use client';

import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { WifiOff, AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Detect whether this error was caused by network interruption, offline mode, or chunk load failure
  const errorMessage = (error?.message || '').toLowerCase();
  const errorName = error?.name || '';
  
  const isChunkOrSyntaxError =
    errorName === 'ChunkLoadError' ||
    errorMessage.includes('loading chunk') ||
    errorMessage.includes('dynamically imported module') ||
    errorMessage.includes('unexpected token') ||
    errorMessage.includes('load failed') ||
    errorMessage.includes('failed to fetch');

  const isNetworkIssue =
    isOffline ||
    isChunkOrSyntaxError ||
    (typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    // 1. Safe Sentry exception capture (swallowed so monitoring failures never break UI)
    try {
      Sentry.captureException(error);
    } catch {
      // Ignore monitoring telemetry errors
    }

    // 2. Initial offline check
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    // 3. Auto-recover from chunk load errors once per session
    // When a new deployment occurs or a transient network drop corrupts chunk fetching,
    // a clean page reload automatically fetches the latest JS bundles.
    if (isChunkOrSyntaxError && typeof window !== 'undefined') {
      try {
        const hasAutoReloaded = sessionStorage.getItem('oratii_chunk_reload_attempted');
        if (!hasAutoReloaded && navigator.onLine) {
          sessionStorage.setItem('oratii_chunk_reload_attempted', 'true');
          window.location.reload();
          return;
        }
      } catch {
        // Ignore session storage errors
      }
    }

    // 4. Online/Offline network state listeners for reactive recovery
    const handleOnline = () => {
      setIsOffline(false);
      setIsReconnecting(true);
      // Auto-reload cleanly once internet connectivity is restored
      setTimeout(() => {
        window.location.reload();
      }, 800);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, isChunkOrSyntaxError]);

  const handleHardReload = () => {
    try {
      sessionStorage.removeItem('oratii_chunk_reload_attempted');
    } catch {}
    window.location.reload();
  };

  const handleReset = () => {
    try {
      sessionStorage.removeItem('oratii_chunk_reload_attempted');
    } catch {}
    reset();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {isNetworkIssue ? (
          <>
            {/* Network / Connection Recovery Card */}
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-200/70 shadow-xs">
              <WifiOff size={28} className={isReconnecting ? 'animate-pulse' : ''} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {isReconnecting ? 'Reconnecting to Oratii...' : 'Connection Interrupted'}
            </h2>

            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {isReconnecting
                ? 'Your internet connection was restored! Refreshing page assets now...'
                : 'Unable to load application resources due to an unstable internet connection or offline state. Your data is secure.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleHardReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B2140] hover:bg-[#252c54] text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>Reload & Reconnect</span>
              </button>

              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all text-center cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Standard Unexpected Error Card */}
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100 shadow-xs">
              <AlertTriangle size={28} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>

            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              An unexpected error occurred while loading this page. Our team has been notified.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B2140] hover:bg-[#252c54] text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>Try Again</span>
              </button>

              <button
                onClick={handleHardReload}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all text-center cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </>
        )}

        <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Home size={14} />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
