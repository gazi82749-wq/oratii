import { checkRateLimit } from '../rateLimit';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Mock Upstash
jest.mock('@upstash/redis', () => {
  return {
    Redis: {
      fromEnv: jest.fn(),
    },
  };
});
// Mock Upstash RateLimit
let globalMockLimit: jest.Mock;

jest.mock('@upstash/ratelimit', () => {
  class MockRatelimit {
    static slidingWindow = jest.fn();
    limit = jest.fn().mockImplementation(() => {
      if (globalMockLimit) return globalMockLimit();
      return Promise.resolve({ success: true, remaining: 9, reset: 12345 });
    });
  }
  return { Ratelimit: MockRatelimit };
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.UPSTASH_REDIS_REST_URL = 'http://localhost';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    globalMockLimit = undefined as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('PASS: Allows request under limit', async () => {
    globalMockLimit = jest.fn().mockResolvedValueOnce({ success: true, remaining: 9, reset: 12345 });
    const { checkRateLimit } = require('../rateLimit');

    const result = await checkRateLimit('test-ip', { maxAttempts: 10, windowMs: 10000 });
    
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('PASS: Rejects request over limit', async () => {
    globalMockLimit = jest.fn().mockResolvedValueOnce({ success: false, remaining: 0, reset: Date.now() + 5000 });
    const { checkRateLimit } = require('../rateLimit');

    const result = await checkRateLimit('test-ip', { maxAttempts: 10, windowMs: 10000 });
    
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(5);
  });

  it('PASS: Graceful fallback if Redis is unavailable', async () => {
    globalMockLimit = jest.fn().mockRejectedValueOnce(new Error('Network error'));
    const { checkRateLimit } = require('../rateLimit');
    
    // The fallback sliding window in memory will take over
    const result = await checkRateLimit('fallback-ip', { maxAttempts: 2, windowMs: 10000 });
    expect(result.allowed).toBe(true);

    const result2 = await checkRateLimit('fallback-ip', { maxAttempts: 2, windowMs: 10000 });
    expect(result2.allowed).toBe(true);

    // Third request should be blocked by in-memory fallback
    const result3 = await checkRateLimit('fallback-ip', { maxAttempts: 2, windowMs: 10000 });
    expect(result3.allowed).toBe(false);
  });

  it('PASS: Graceful fallback if UPSTASH environment variables are missing', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { checkRateLimit } = require('../rateLimit');

    // Call it
    const result = await checkRateLimit('missing-env-ip', { maxAttempts: 1, windowMs: 10000 });
    expect(result.allowed).toBe(true);

    const result2 = await checkRateLimit('missing-env-ip', { maxAttempts: 1, windowMs: 10000 });
    expect(result2.allowed).toBe(false);
  });
});
