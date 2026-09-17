

jest.mock('@upstash/redis', () => {
  const store = new Map();
  return {
    Redis: {
      fromEnv: jest.fn().mockImplementation(() => ({
        set: jest.fn(async (key, value, options) => {
          if (options?.nx) {
            if (store.has(key)) return null;
            store.set(key, value);
            return 'OK';
          }
          store.set(key, value);
          return 'OK';
        }),
        get: jest.fn(async (key) => store.get(key)),
        del: jest.fn(async (key) => store.delete(key)),
      })),
    },
  };
});

describe('Cache Security & Idempotency', () => {
  const userId = 'user-123';
  const fileHash = 'abc123hash';
  const idempotencyKey = `analyze-slides:${userId}:${fileHash}`;
  
  let acquireLock: any, releaseLock: any, setCache: any, checkCache: any;

  beforeEach(() => {
    jest.resetModules();
    process.env.UPSTASH_REDIS_REST_URL = 'http://localhost';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    const idempotency = require('../idempotency');
    acquireLock = idempotency.acquireLock;
    releaseLock = idempotency.releaseLock;
    setCache = idempotency.setCache;
    checkCache = idempotency.checkCache;
  });

  afterEach(async () => {
    await releaseLock(idempotencyKey);
  });

  it('PASS: User A + presentation X returns identical cache', async () => {
    await setCache(`cache:${idempotencyKey}`, { data: 'test-data' }, 3600);
    
    const cached = await checkCache(`cache:${idempotencyKey}`);
    expect(cached).toEqual({ data: 'test-data' });
  });

  it('PASS: User B + presentation X has different cache key (Cache Isolation)', async () => {
    // User A cached it
    await setCache(`cache:${idempotencyKey}`, { data: 'test-data' }, 3600);

    // User B tries to access it
    const userBKey = `analyze-slides:user-456:${fileHash}`;
    const userBCached = await checkCache(`cache:${userBKey}`);
    
    expect(userBCached).toBeNull(); // Cache isolated by User ID
  });

  it('PASS: User A + presentation Y has different cache key', async () => {
    // User A cached presentation X
    await setCache(`cache:${idempotencyKey}`, { data: 'test-data' }, 3600);

    // User A tries to access presentation Y
    const presYKey = `analyze-slides:${userId}:def456hash`;
    const userACached = await checkCache(`cache:${presYKey}`);
    
    expect(userACached).toBeNull(); // Cache isolated by file hash
  });

  it('PASS: acquireLock prevents concurrent processing', async () => {
    // First request acquires lock
    const locked1 = await acquireLock(idempotencyKey);
    expect(locked1).toBe(true);

    // Second concurrent request fails to acquire lock
    const locked2 = await acquireLock(idempotencyKey);
    expect(locked2).toBe(false);
  });

  it('PASS: releaseLock frees the lock for retry', async () => {
    await acquireLock(idempotencyKey);
    await releaseLock(idempotencyKey);
    
    // Now another request can acquire it
    const locked = await acquireLock(idempotencyKey);
    expect(locked).toBe(true);
  });
});
