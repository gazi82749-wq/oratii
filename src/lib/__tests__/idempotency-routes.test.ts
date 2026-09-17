import { POST as speechAnalyzerPost } from '../../app/api/speech-analyzer/route';

jest.mock('next/server', () => ({
  NextRequest: class {
    url: string;
    method: string;
    headers: Map<string, string>;
    _body: FormData | any;
    ip: string;
    constructor(url: string, init: any) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = new Map(Object.entries(init.headers || {}));
      this._body = init.body;
      this.ip = '127.0.0.1';
    }
    async formData() { return this._body; }
    async json() { return this._body; }
  },
  NextResponse: {
    json: (body: any, init?: any) => {
      return {
        status: init?.status || 200,
        json: async () => body
      };
    }
  }
}));

import { NextRequest } from 'next/server';

// Mocks
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    }
  }
}));

jest.mock('../../lib/rateLimit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true })
}));

jest.mock('../../lib/trialManager', () => ({
  hasUsedTrial: jest.fn().mockResolvedValue(false),
  setTrialUsed: jest.fn().mockResolvedValue(true)
}));

let memoryCache = new Map();
let memoryLocks = new Set();
let usageDeducted = false;
let refunded = false;

jest.mock('../../lib/billing', () => ({
  checkAndDecrementUsage: jest.fn().mockImplementation(() => {
    usageDeducted = true;
    return Promise.resolve({ allowed: true });
  }),
  refundUsage: jest.fn().mockImplementation(() => {
    refunded = true;
    return Promise.resolve();
  })
}));

jest.mock('../../lib/idempotency', () => ({
  acquireLock: jest.fn().mockImplementation(async (key) => {
    if (memoryLocks.has(key)) return false;
    memoryLocks.add(key);
    return true;
  }),
  releaseLock: jest.fn().mockImplementation(async (key) => {
    memoryLocks.delete(key);
  }),
  checkCache: jest.fn().mockImplementation(async (key) => {
    return memoryCache.get(key) || null;
  }),
  setCache: jest.fn().mockImplementation(async (key, val) => {
    memoryCache.set(key, val);
  })
}));

jest.mock('../../lib/fetchWithRetry', () => ({
  fetchWithRetry: jest.fn().mockImplementation(async () => {
    return {
      ok: true,
      json: async () => ({
        results: { channels: [{ alternatives: [{ transcript: 'test transcript', words: [] }] }] },
        metadata: { duration: 10 }
      })
    };
  })
}));

describe('Idempotency Routes Integration (Speech Analyzer)', () => {
  const originalEnv = process.env;

  beforeAll(() => {
    process.env = { ...originalEnv, DEEPGRAM_API_KEY: 'test-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    memoryCache.clear();
    memoryLocks.clear();
    usageDeducted = false;
    refunded = false;
    jest.clearAllMocks();
  });

  const createRequest = () => {
    const fakeFormData = {
      get: (key: string) => {
        if (key === 'audio') {
          return {
            type: 'audio/wav',
            arrayBuffer: async () => Buffer.from('fake audio')
          };
        }
        if (key === 'language') return 'en-US';
        return null;
      }
    };
    
    return new NextRequest('http://localhost/api/speech-analyzer', {
      method: 'POST',
      body: fakeFormData,
      headers: {
        'authorization': 'Bearer test-token',
        'x-forwarded-for': '127.0.0.1'
      }
    });
  };

  it('First request deducts credit, generates output, sets cache', async () => {
    const req = createRequest();
    const res = await speechAnalyzerPost(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.status).toBe('success');
    expect(usageDeducted).toBe(true);
    expect(refunded).toBe(false);
    expect(memoryCache.size).toBe(1); // Result is cached
  });

  it('Duplicate sequential request uses fast cache, does not deduct credit', async () => {
    // 1. Initial success
    const req1 = createRequest();
    await speechAnalyzerPost(req1);
    usageDeducted = false; // Reset for next check
    
    // 2. Second request (cache hit)
    const req2 = createRequest();
    const res2 = await speechAnalyzerPost(req2);
    
    expect(res2.status).toBe(200);
    expect(usageDeducted).toBe(false); // Should NOT deduct credit on fast cache hit
  });

  it('Concurrent duplicate request returns 429 processing state', async () => {
    // Manually hold a lock to simulate concurrent processing
    // Use the actual hash that would be generated to properly block it
    const crypto = require('crypto');
    const hashString = `${Buffer.from('fake audio').toString('base64')}|en-US|v1_speech_analyzer`;
    const fileHash = crypto.createHash('sha256').update(hashString).digest('hex');
    const key = `speech-analyzer:test-user:${fileHash}`;
    memoryLocks.add(key);
    
    const req = createRequest();
    const res = await speechAnalyzerPost(req);
    
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain('Request is already processing');
    expect(usageDeducted).toBe(false); // Lock prevented deduction
  });

  it('Failed AI request refunds credit', async () => {
    const { fetchWithRetry } = require('../../lib/fetchWithRetry');
    fetchWithRetry.mockRejectedValueOnce(new Error('Deepgram completely failed'));
    
    const req = createRequest();
    const res = await speechAnalyzerPost(req);
    
    expect(res.status).toBe(500);
    expect(usageDeducted).toBe(true); // Must have deducted before fail
    expect(refunded).toBe(true); // Must refund!
  });
});
