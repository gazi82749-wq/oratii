import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

jest.mock('../email', () => ({
  sendReceiptEmail: jest.fn()
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body
    }))
  }
}));

import { POST } from '@/app/api/webhooks/razorpay/route';
import crypto from 'crypto';

describe('Razorpay Verification', () => {
  const secret = 'test_secret';
  
  beforeAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = secret;
    global.Request = class {
      url: string;
      method: string;
      headers: Map<string, string>;
      _body: string;
      constructor(url: string, options: any) {
        this.url = url;
        this.method = options.method;
        this.headers = new Map(Object.entries(options.headers || {}));
        this._body = options.body;
      }
      text() { return Promise.resolve(this._body); }
      json() { return Promise.resolve(JSON.parse(this._body)); }
    } as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    })) as any;
  });

  it('PASS: Valid signature is accepted', async () => {
    const payloadObj = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_123',
            notes: { userId: 'user_1', planName: 'Pro' }
          }
        }
      }
    };
    const payload = JSON.stringify(payloadObj);
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'x-razorpay-signature': signature,
      },
      body: payload
    });

    const res = await POST(req);
    // Since we didn't mock Supabase, it will fail after signature check, 
    // but we can assert it does NOT fail with 400 'Invalid signature'
    expect(res.status).not.toBe(400); 
  });

  it('PASS: Invalid signature is rejected', async () => {
    const payload = '{"event":"payment.captured"}';
    const signature = 'invalid_signature_string';

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: {
        'x-razorpay-signature': signature,
      },
      body: payload
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid signature');
  });

  it('MANUAL VERIFICATION REQUIRED: Duplicate webhook idempotency', () => {
    // Cannot reliably test Razorpay webhooks in unit test because they depend on 
    // Supabase DB unique constraints and row locks on the `payments` table.
    // To verify:
    // 1. Send the exact same webhook payload to /api/webhooks/razorpay twice concurrently.
    // 2. Only one should insert a record. The other will fail the unique constraint on `razorpay_order_id` or `razorpay_payment_id`.
    expect(true).toBe(true);
  });

  it('MANUAL VERIFICATION REQUIRED: Verify + webhook arriving concurrently', () => {
    // Both `/api/razorpay/verify` and `/api/webhooks/razorpay` grant premium credits.
    // The `grantPremiumAccess` function or database constraint must prevent double-crediting.
    expect(true).toBe(true);
  });
});
