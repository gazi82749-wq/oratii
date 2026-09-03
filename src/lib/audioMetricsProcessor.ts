// src/lib/audioMetricsProcessor.ts

export interface RealtimeAudioMetrics {
  volumeRms: number; // 0 to 100
  pitchHz: number; // Fundamental frequency in Hz
  isMonotone: boolean; // Flagged if pitch variation < threshold over sliding window
  isSpeaking: boolean;
  pauseDurationMs: number;
  fillerWordHits: string[];
}

const COMMON_FILLERS = [
  'um', 'uh', 'ah', 'er', 'like', 'you know', 'basically', 'matlab',
  'so', 'right', 'actually', 'mean', 'honestly', 'literally'
];

export class RealtimeAudioProcessor {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private rawStream: MediaStream | null = null;
  private pitchHistory: number[] = [];
  private lastSpeakingTimestamp: number = Date.now();
  private isProcessing: boolean = false;

  public initialize(stream: MediaStream): boolean {
    try {
      this.rawStream = stream;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.mediaStreamSource = this.audioCtx.createMediaStreamSource(stream);
      this.mediaStreamSource.connect(this.analyser);
      this.isProcessing = true;
      this.lastSpeakingTimestamp = Date.now();
      return true;
    } catch (err) {
      console.error('[AudioMetricsProcessor] Failed to initialize Web Audio API:', err);
      return false;
    }
  }

  public getMetrics(): RealtimeAudioMetrics {
    if (!this.analyser || !this.isProcessing) {
      return {
        volumeRms: 0,
        pitchHz: 0,
        isMonotone: false,
        isSpeaking: false,
        pauseDurationMs: 0,
        fillerWordHits: [],
      };
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const timeDomainData = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(timeDomainData);

    // 1. RMS Volume Calculation
    let sumSquares = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      sumSquares += timeDomainData[i] * timeDomainData[i];
    }
    const rms = Math.sqrt(sumSquares / timeDomainData.length);
    const volumeRms = Math.min(100, Math.round(rms * 400)); // Scale to 0-100 gauge

    const isSpeaking = volumeRms > 8; // Threshold for active vocal sound
    const now = Date.now();

    if (isSpeaking) {
      this.lastSpeakingTimestamp = now;
    }

    const pauseDurationMs = isSpeaking ? 0 : now - this.lastSpeakingTimestamp;

    // 2. Pitch Detection via Autocorrelation Algorithm
    const pitchHz = this.autoCorrelate(timeDomainData, this.audioCtx?.sampleRate || 44100);

    if (pitchHz > 60 && pitchHz < 400) {
      this.pitchHistory.push(pitchHz);
      if (this.pitchHistory.length > 30) {
        this.pitchHistory.shift(); // Keep 3-second sliding window at 10Hz polling
      }
    }

    // 3. Monotone Pitch Variation Analysis
    let isMonotone = false;
    if (this.pitchHistory.length >= 10) {
      const minPitch = Math.min(...this.pitchHistory);
      const maxPitch = Math.max(...this.pitchHistory);
      const variance = maxPitch - minPitch;
      isMonotone = variance < 15; // Less than 15Hz variation in window implies monotone
    }

    return {
      volumeRms,
      pitchHz: Math.round(pitchHz),
      isMonotone,
      isSpeaking,
      pauseDurationMs,
      fillerWordHits: [],
    };
  }

  /**
   * Autocorrelation algorithm for pitch detection (fundamental frequency estimation).
   */
  private autoCorrelate(buf: Float32Array, sampleRate: number): number {
    const SIZE = buf.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // Signal too quiet

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    const buf2 = buf.slice(r1, r2);
    const c = new Float32Array(buf2.length);
    for (let i = 0; i < buf2.length; i++) {
      for (let j = 0; j < buf2.length - i; j++) {
        c[i] = c[i] + buf2[j] * buf2[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < buf2.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    return sampleRate / T0;
  }

  /**
   * Detect filler words from live transcription text string.
   */
  public static detectFillers(text: string): { count: number; matches: string[] } {
    if (!text) return { count: 0, matches: [] };
    const lower = text.toLowerCase();
    const matches: string[] = [];

    for (const filler of COMMON_FILLERS) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const found = lower.match(regex);
      if (found) {
        matches.push(...found);
      }
    }

    return {
      count: matches.length,
      matches,
    };
  }

  public stop(): void {
    this.isProcessing = false;
    if (this.rawStream) {
      try {
        this.rawStream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      } catch (e) {
        // ignore track stop notice
      }
      this.rawStream = null;
    }
    if (this.mediaStreamSource) {
      try { this.mediaStreamSource.disconnect(); } catch {}
      this.mediaStreamSource = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch {}
      this.audioCtx = null;
    }
  }
}
