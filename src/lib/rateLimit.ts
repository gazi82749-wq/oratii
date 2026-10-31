import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// src/lib/rateLimit.ts
// Upstash Redis sliding-window rate limiter.

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

// Fallback in-memory map for graceful degradation if Redis fails
interface RateLimitEntry {
  attempts: number[];
}
const fallbackStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: NodeJS.Timeout | null = null;
function startCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of fallbackStore.entries()) {
      entry.attempts = entry.attempts.filter(ts => now - ts < windowMs);
      if (entry.attempts.length === 0) fallbackStore.delete(key);
    }
  }, CLEANUP_INTERVAL);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

function fallbackRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  startCleanup(config.windowMs);
  const now = Date.now();
  let entry = fallbackStore.get(key);
  if (!entry) {
    if (fallbackStore.size > 10000) {
      let count = 0;
      for (const k of fallbackStore.keys()) {
        fallbackStore.delete(k);
        count++;
        if (count >= 2000) break;
      }
    }
    entry = { attempts: [] };
    fallbackStore.set(key, entry);
  }
  entry.attempts = entry.attempts.filter(ts => now - ts < config.windowMs);
  if (entry.attempts.length >= config.maxAttempts) {
    const oldestAttempt = entry.attempts[0] || now;
    const retryAfterMs = Math.max(1000, config.windowMs - (now - oldestAttempt));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }
  entry.attempts.push(now);
  if (entry.attempts.length > config.maxAttempts + 5) {
    entry.attempts = entry.attempts.slice(-config.maxAttempts);
  }
  return {
    allowed: true,
    remaining: config.maxAttempts - entry.attempts.length,
    retryAfterSeconds: 0,
  };
}

// Pre-configured rate limiters
export const AUTH_RATE_LIMIT: RateLimitConfig = { maxAttempts: 5, windowMs: 15 * 60 * 1000 };
export const AI_RATE_LIMIT: RateLimitConfig = { maxAttempts: 10, windowMs: 10 * 60 * 1000 };
export const CONVERT_RATE_LIMIT: RateLimitConfig = { maxAttempts: 3, windowMs: 60 * 1000 };

// Create a single Upstash Ratelimit instance factory
const createLimiter = (config: RateLimitConfig) => {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    const redis = Redis.fromEnv();
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.maxAttempts, `${Math.ceil(config.windowMs / 1000)} s`),
      analytics: false,
      ephemeralCache: new Map(),
    });
  } catch (err) {
    console.warn('[RateLimit] Failed to initialize Upstash Redis:', err);
    return null;
  }
};

const limiters = {
  auth: createLimiter(AUTH_RATE_LIMIT),
  ai: createLimiter(AI_RATE_LIMIT),
  convert: createLimiter(CONVERT_RATE_LIMIT),
};

let redisDisabledUntil = 0;

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now();
  if (now < redisDisabledUntil) {
    return fallbackRateLimit(key, config);
  }

  let type: 'auth' | 'ai' | 'convert' = 'ai';
  if (config.windowMs === AUTH_RATE_LIMIT.windowMs) type = 'auth';
  else if (config.windowMs === CONVERT_RATE_LIMIT.windowMs) type = 'convert';
  
  const limiter = limiters[type];
  
  if (!limiter) {
    return fallbackRateLimit(key, config);
  }

  try {
    let timer: NodeJS.Timeout | undefined;
    const limitPromise = limiter.limit(key);
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('RateLimit timeout')), 800);
    });

    const res = await Promise.race([limitPromise, timeoutPromise]).finally(() => {
      if (timer) clearTimeout(timer);
    });
    
    const { success, remaining, reset } = res as { success: boolean; limit: number; remaining: number; reset: number };
    
    return {
      allowed: success,
      remaining,
      retryAfterSeconds: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (err) {
    // If Redis timed out or threw (e.g. ENOTFOUND or network failure), circuit-break to memory store for 10 minutes
    redisDisabledUntil = Date.now() + 10 * 60 * 1000;
    console.warn('[RateLimit] Upstash Redis unreachable/slow, circuit-breaking to memory store for 10m:', (err as Error)?.message || err);
    return fallbackRateLimit(key, config);
  }
}
