// src/lib/rateLimit.ts
// In-memory sliding-window rate limiter.
// For multi-instance/serverless at scale, swap this for Upstash (@upstash/ratelimit).

interface RateLimitEntry {
  attempts: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      entry.attempts = entry.attempts.filter(ts => now - ts < windowMs);
      if (entry.attempts.length === 0) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  // Don't block process exit
  if (cleanupTimer.unref) cleanupTimer.unref();
}

export interface RateLimitConfig {
  /** Maximum number of attempts allowed within the window */
  maxAttempts: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining attempts in the current window */
  remaining: number;
  /** Seconds until the oldest attempt expires (i.e. when they can retry) */
  retryAfterSeconds: number;
}

/**
 * Check and consume a rate limit attempt for the given key.
 * Returns whether the request is allowed, remaining attempts, and retry-after time.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  startCleanup(config.windowMs);

  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { attempts: [] };
    store.set(key, entry);
  }

  // Remove expired attempts outside the window
  entry.attempts = entry.attempts.filter(ts => now - ts < config.windowMs);

  if (entry.attempts.length >= config.maxAttempts) {
    // Rate limited — calculate retry-after from the oldest attempt in window
    const oldestAttempt = entry.attempts[0];
    const retryAfterMs = config.windowMs - (now - oldestAttempt);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  // Record this attempt
  entry.attempts.push(now);

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.attempts.length,
    retryAfterSeconds: 0,
  };
}

// Pre-configured rate limiters for auth endpoints
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};
