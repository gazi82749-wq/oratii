// src/lib/privacyConsent.ts

export interface PrivacyConsentState {
  hasConsented: boolean;
  consentedAt: string | null;
  version: string;
  allowLocalPlaybackOnly: boolean;
  optOutCloudArchiving: boolean;
}

const PRIVACY_CONSENT_KEY = 'oratii_biometric_privacy_consent_v1';
const CURRENT_POLICY_VERSION = '1.2.0-bipa-gdpr';

/**
 * Retrieves stored BIPA & GDPR biometric privacy consent from localStorage.
 */
export function getStoredPrivacyConsent(): PrivacyConsentState {
  if (typeof window === 'undefined') {
    return {
      hasConsented: false,
      consentedAt: null,
      version: CURRENT_POLICY_VERSION,
      allowLocalPlaybackOnly: true,
      optOutCloudArchiving: true,
    };
  }

  try {
    const data = localStorage.getItem(PRIVACY_CONSENT_KEY);
    if (data) {
      const parsed = JSON.parse(data) as PrivacyConsentState;
      if (parsed.version === CURRENT_POLICY_VERSION) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read privacy consent:', e);
  }

  return {
    hasConsented: false,
    consentedAt: null,
    version: CURRENT_POLICY_VERSION,
    allowLocalPlaybackOnly: true,
    optOutCloudArchiving: true,
  };
}

/**
 * Saves user BIPA & GDPR biometric consent preferences.
 */
export function savePrivacyConsent(consent: Partial<PrivacyConsentState>): PrivacyConsentState {
  const updated: PrivacyConsentState = {
    hasConsented: consent.hasConsented ?? true,
    consentedAt: new Date().toISOString(),
    version: CURRENT_POLICY_VERSION,
    allowLocalPlaybackOnly: consent.allowLocalPlaybackOnly ?? true,
    optOutCloudArchiving: consent.optOutCloudArchiving ?? true,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PRIVACY_CONSENT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save privacy consent:', e);
    }
  }

  return updated;
}

/**
 * Revokes stored biometric consent and clears local session cache.
 */
export function revokePrivacyConsent(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(PRIVACY_CONSENT_KEY);
    } catch (e) {
      console.error('Failed to revoke privacy consent:', e);
    }
  }
}

/**
 * Anonymizes session telemetry payload to guarantee zero biometric coordinate or raw video transmission.
 * Converts raw coordinates into un-identifiable numerical scalar aggregates.
 */
export function anonymizeSessionTelemetry(telemetry: {
  eyeContactPercentage: number;
  postureStabilityScore: number;
  gestureFrequency: number;
  wpm: number;
  fillerCount: number;
  pitchVariationHz: number;
}) {
  return {
    // Only scalar percentages and scores are preserved. No 3D facial mesh vectors or facial geometry coordinates exist here.
    eye_contact_score: Math.min(100, Math.max(0, Math.round(telemetry.eyeContactPercentage))),
    posture_score: Math.min(100, Math.max(0, Math.round(telemetry.postureStabilityScore))),
    gesture_activity: Math.min(100, Math.max(0, Math.round(telemetry.gestureFrequency))),
    words_per_minute: Math.round(telemetry.wpm),
    filler_word_count: Math.max(0, Math.round(telemetry.fillerCount)),
    pitch_variation_hz: Math.round(telemetry.pitchVariationHz),
    processed_at: new Date().toISOString(),
    edge_processed: true,
  };
}
