import { Redis } from '@upstash/redis';
import crypto from 'crypto';

let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn('[Idempotency] Failed to initialize Upstash Redis for caching:', e);
}

export function generateCacheKey(prefix: string, data: any): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return `${prefix}:${hash}`;
}

export async function checkCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const cached = await redis.get<T>(key);
    return cached || null;
  } catch (e) {
    console.error('[Idempotency] Cache GET error:', e);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 86400): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (e) {
    console.error('[Idempotency] Cache SET error:', e);
  }
}

/**
 * Attempts to acquire an idempotency lock for a given key.
 * Returns true if the lock was acquired, false if it's already locked (processing).
 */
export async function acquireLock(key: string, timeoutSeconds: number = 60): Promise<boolean> {
  if (!redis) return true; // Fail-open if Redis is missing
  try {
    const lockKey = `lock:${key}`;
    const acquired = await redis.set(lockKey, 'locked', { nx: true, ex: timeoutSeconds });
    return acquired !== null;
  } catch (e) {
    console.error('[Idempotency] Lock acquire error:', e);
    return true; // Fail-open
  }
}

export async function releaseLock(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(`lock:${key}`);
  } catch (e) {
    console.error('[Idempotency] Lock release error:', e);
  }
}
