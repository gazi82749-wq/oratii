/**
 * Oratii Client Analytics & Funnel Event Tracking
 * Tracks high-value user activation events without recording private voice or PII.
 *
 * Funnel Events (P1):
 * landing_page_view → signup_completed → practice_started → practice_completed
 * → feedback_viewed → second_session_completed → upgrade_clicked → subscription_completed
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type AnalyticsEventName =
  // Existing events
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
  | 'share_report_clicked'
  // P1 Funnel events
  | 'landing_page_view'
  | 'signup_completed'
  | 'practice_started'
  | 'practice_completed'
  | 'feedback_viewed'
  | 'second_session_completed'
  | 'upgrade_clicked'
  | 'subscription_completed'
  // Daily practice journey events
  | 'journey_day_started'
  | 'journey_day_completed'
  | 'journey_completed';

export function trackEvent(
  eventName: AnalyticsEventName,
  eventParams: Record<string, string | number | boolean | undefined> = {}
): void {
  if (typeof window === 'undefined') return;

  try {
    // Strip any PII fields as a safety net
    const safeParams = { ...eventParams };
    delete safeParams.email;
    delete safeParams.name;
    delete safeParams.phone;

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        timestamp: new Date().toISOString(),
        ...safeParams,
      });
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        timestamp: new Date().toISOString(),
        ...safeParams,
      });
    }
  } catch (err) {
    // Fail silently in production so user interaction is never blocked
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] Failed to track event:', eventName, err);
    }
  }
}

