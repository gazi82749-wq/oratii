// src/lib/logger.ts
import { supabase } from './supabaseClient';

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface LogOptions {
  severity: LogSeverity;
  category: string;
  message: string;
  source: string;
  details?: string | Record<string, any> | Error | unknown;
}

/**
 * Normalizes details payload into a clean stringified representation or stack trace.
 */
function formatDetails(details?: string | Record<string, any> | Error | unknown): string {
  if (!details) return '';
  if (typeof details === 'string') return details;
  if (details instanceof Error) {
    return `${details.name}: ${details.message}\n${details.stack || ''}`;
  }
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

/**
 * Log a system event directly to Supabase system_logs.
 * Designed to NEVER throw errors, so logging failures do not break main execution flows or unit test mocks.
 */
export async function logSystemEvent(options: LogOptions): Promise<void> {
  const formattedDetails = formatDetails(options.details);

  // Console output for standard server log stream
  const consolePrefix = `[SystemLog:${options.severity.toUpperCase()}][${options.category}][${options.source}]`;
  if (options.severity === 'critical' || options.severity === 'error') {
    console.error(`${consolePrefix} ${options.message}`, formattedDetails);
  } else if (options.severity === 'warning') {
    console.warn(`${consolePrefix} ${options.message}`, formattedDetails);
  } else {
    console.log(`${consolePrefix} ${options.message}`);
  }

  try {
    if (supabase && typeof supabase.from === 'function') {
      const table = supabase.from('system_logs');
      if (table && typeof table.insert === 'function') {
        const { error } = await table.insert([
          {
            severity: options.severity,
            category: options.category,
            message: options.message,
            source: options.source,
            details: formattedDetails,
            created_at: new Date().toISOString(),
          },
        ]);
        if (error) {
          console.warn('[Logger] Failed to write log to Supabase:', error.message);
        }
      }
    }
  } catch {
    // Intentionally swallowed so logging never disrupts primary application flow
  }
}

/**
 * Sends a client-side log to the /api/admin/log endpoint.
 */
export async function logClientError(
  error: Error | string,
  contextInfo?: { source?: string; category?: string; extraDetails?: any }
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const message = typeof error === 'string' ? error : error.message || 'Client Runtime Exception';
    const details = typeof error === 'string' 
      ? formatDetails(contextInfo?.extraDetails)
      : formatDetails({
          stack: error.stack,
          context: contextInfo?.extraDetails,
          userAgent: window.navigator.userAgent,
          url: window.location.href,
        });

    await fetch('/api/admin/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        severity: 'error',
        category: contextInfo?.category || 'Website Client',
        message,
        source: contextInfo?.source || window.location.pathname || 'Client Browser',
        details,
      }),
    });
  } catch {
    // Ignore client reporting errors
  }
}
