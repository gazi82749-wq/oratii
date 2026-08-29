// src/lib/sessionRecorder.ts
// Session data capture utility for Presentation Replay (Module 3) and Real-Time Coach (Module 6)

import { saveSessionRecording } from './storage';

class SessionRecorder {
  private sessionId: string | null = null;
  private events: any[] = [];
  private metrics: any[] = [];
  private startTime: number | null = null;
  private active = false;

  start(sessionId?: string): string {
    this.sessionId = sessionId || `rec-${Date.now()}`;
    this.events = [];
    this.metrics = [];
    this.startTime = Date.now();
    this.active = true;
    return this.sessionId;
  }

  logEvent(type: string, data: any = {}) {
    if (!this.active) return;
    const elapsed = Math.round((Date.now() - this.startTime!) / 1000);
    this.events.push({ type, timestamp: elapsed, time: formatTime(elapsed), ...data });
  }

  logMetricSample(metrics: any) {
    if (!this.active) return;
    const elapsed = Math.round((Date.now() - this.startTime!) / 1000);
    this.metrics.push({ timestamp: elapsed, ...metrics });
  }

  stop(): string | null {
    if (!this.active) return null;
    this.active = false;

    const recording = {
      sessionId: this.sessionId,
      duration: Math.round((Date.now() - this.startTime!) / 1000),
      events: this.events,
      metrics: this.metrics,
      recordedAt: new Date().toISOString()
    };

    saveSessionRecording(this.sessionId!, recording);

    const savedId = this.sessionId;
    this.sessionId = null;
    this.events = [];
    this.metrics = [];
    this.startTime = null;
    return savedId;
  }

  isActive() { return this.active; }
  getSessionId() { return this.sessionId; }
  getElapsed() {
    if (!this.active || !this.startTime) return 0;
    return Math.round((Date.now() - this.startTime) / 1000);
  }
}

// Singleton instance
const recorder = new SessionRecorder();

// Backwards-compatible named exports
export const startRecording = (id?: string) => recorder.start(id);
export const logEvent = (type: string, data?: any) => recorder.logEvent(type, data);
export const logMetricSample = (metrics: any) => recorder.logMetricSample(metrics);
export const stopRecording = () => recorder.stop();
export const isRecordingActive = () => recorder.isActive();
export const getCurrentSessionId = () => recorder.getSessionId();
export const getElapsedTime = () => recorder.getElapsed();

// â”€â”€â”€ Event type helpers â”€â”€â”€
export const EVENT_TYPES = {
  EYE_CONTACT_LOST: 'eye_contact_lost',
  EYE_CONTACT_RECOVERED: 'eye_contact_recovered',
  SPEAKING_FAST: 'speaking_fast',
  SPEAKING_SLOW: 'speaking_slow',
  CONFIDENCE_DROP: 'confidence_drop',
  CONFIDENCE_HIGH: 'confidence_high',
  FILLER_WORD: 'filler_word',
  LONG_PAUSE: 'long_pause',
  SLIDE_CHANGE: 'slide_change',
  EXCELLENT_MOMENT: 'excellent_moment',
  POOR_POSTURE: 'poor_posture',
  VOICE_TOO_LOW: 'voice_too_low',
  TEXT_HEAVY_SLIDE: 'text_heavy_slide'
};

export const EVENT_LABELS = {
  [EVENT_TYPES.EYE_CONTACT_LOST]: 'Eye Contact Lost',
  [EVENT_TYPES.EYE_CONTACT_RECOVERED]: 'Eye Contact Recovered',
  [EVENT_TYPES.SPEAKING_FAST]: 'Speaking Too Fast',
  [EVENT_TYPES.SPEAKING_SLOW]: 'Speaking Too Slow',
  [EVENT_TYPES.CONFIDENCE_DROP]: 'Confidence Drop',
  [EVENT_TYPES.CONFIDENCE_HIGH]: 'High Confidence',
  [EVENT_TYPES.FILLER_WORD]: 'Filler Word Detected',
  [EVENT_TYPES.LONG_PAUSE]: 'Long Pause Detected',
  [EVENT_TYPES.SLIDE_CHANGE]: 'Slide Changed',
  [EVENT_TYPES.EXCELLENT_MOMENT]: 'Excellent Explanation',
  [EVENT_TYPES.POOR_POSTURE]: 'Poor Posture Detected',
  [EVENT_TYPES.VOICE_TOO_LOW]: 'Voice Too Low',
  [EVENT_TYPES.TEXT_HEAVY_SLIDE]: 'Slide Contains Too Much Text'
};

export const EVENT_SEVERITY = {
  [EVENT_TYPES.EYE_CONTACT_LOST]: 'warning',
  [EVENT_TYPES.EYE_CONTACT_RECOVERED]: 'success',
  [EVENT_TYPES.SPEAKING_FAST]: 'warning',
  [EVENT_TYPES.SPEAKING_SLOW]: 'info',
  [EVENT_TYPES.CONFIDENCE_DROP]: 'danger',
  [EVENT_TYPES.CONFIDENCE_HIGH]: 'success',
  [EVENT_TYPES.FILLER_WORD]: 'warning',
  [EVENT_TYPES.LONG_PAUSE]: 'warning',
  [EVENT_TYPES.SLIDE_CHANGE]: 'info',
  [EVENT_TYPES.EXCELLENT_MOMENT]: 'success',
  [EVENT_TYPES.POOR_POSTURE]: 'danger',
  [EVENT_TYPES.VOICE_TOO_LOW]: 'warning',
  [EVENT_TYPES.TEXT_HEAVY_SLIDE]: 'warning'
};

// â”€â”€â”€ Utility â”€â”€â”€
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// â”€â”€â”€ Generate mock recording data for demo/testing â”€â”€â”€
export function generateMockRecording(durationSeconds = 300) {
  const events = [
    { type: EVENT_TYPES.SLIDE_CHANGE, timestamp: 0, time: '00:00', slideNumber: 1 },
    { type: EVENT_TYPES.EYE_CONTACT_LOST, timestamp: 42, time: '00:42', message: 'Looked away for 4 seconds' },
    { type: EVENT_TYPES.SPEAKING_FAST, timestamp: 75, time: '01:15', message: '165 WPM detected', wpm: 165 },
    { type: EVENT_TYPES.SLIDE_CHANGE, timestamp: 90, time: '01:30', slideNumber: 2 },
    { type: EVENT_TYPES.FILLER_WORD, timestamp: 110, time: '01:50', message: 'um, like', words: ['um', 'like'] },
    { type: EVENT_TYPES.CONFIDENCE_DROP, timestamp: 151, time: '02:31', message: 'Confidence dropped to 62%', value: 62 },
    { type: EVENT_TYPES.SLIDE_CHANGE, timestamp: 165, time: '02:45', slideNumber: 3 },
    { type: EVENT_TYPES.EXCELLENT_MOMENT, timestamp: 190, time: '03:10', message: 'Clear and confident explanation' },
    { type: EVENT_TYPES.LONG_PAUSE, timestamp: 220, time: '03:40', message: '6 second pause detected', duration: 6 },
    { type: EVENT_TYPES.SLIDE_CHANGE, timestamp: 240, time: '04:00', slideNumber: 4 },
    { type: EVENT_TYPES.TEXT_HEAVY_SLIDE, timestamp: 241, time: '04:01', message: 'Slide 4 has too much text' },
    { type: EVENT_TYPES.EYE_CONTACT_RECOVERED, timestamp: 260, time: '04:20', message: 'Eye contact restored' },
    { type: EVENT_TYPES.CONFIDENCE_HIGH, timestamp: 280, time: '04:40', message: 'Confidence at 91%', value: 91 },
  ];

  // Generate metric samples every 5 seconds
  const metrics = [];
  for (let t = 0; t <= durationSeconds; t += 5) {
    metrics.push({
      timestamp: t,
      confidence: Math.round(70 + Math.sin(t / 60) * 15 + Math.random() * 10),
      eyeContact: Math.round(80 + Math.cos(t / 45) * 12 + Math.random() * 8),
      pace: Math.round(120 + Math.sin(t / 30) * 25 + Math.random() * 15),
      fillerRate: Math.max(0, Math.round(2 + Math.sin(t / 50) * 3 + Math.random() * 2))
    });
  }

  return {
    sessionId: `mock-${Date.now()}`,
    duration: durationSeconds,
    events,
    metrics,
    recordedAt: new Date().toISOString()
  };
}
