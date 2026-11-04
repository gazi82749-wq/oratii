/**
 * Oratii Client Analytics & Funnel Event Tracking
 * Tracks high-value user activation events without recording private voice or PII.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type AnalyticsEventName =
  | 'practice_cta_click'
  | 'practice_session_start'
  | 'mic_permission_granted'
  | 'mic_permission_denied'
  | 'recording_start'
  | 'recording_complete'
  | 'feedback_generated'
  | 'first_session_complete'
  | 'challenge_day_started'
  | 'challenge_day_completed'
  | 'seo_landing_page_view'
  | 'interview_prompt_selected'
  | 'share_report_clicked';

export function trackEvent(
  eventName: AnalyticsEventName,
  eventParams: Record<string, string | number | boolean | undefined> = {}
): void {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        timestamp: new Date().toISOString(),
        ...eventParams,
      });
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        timestamp: new Date().toISOString(),
        ...eventParams,
      });
    }
  } catch (err) {
    // Fail silently in production so user interaction is never blocked
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] Failed to track event:', eventName, err);
    }
  }
}

