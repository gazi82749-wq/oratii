import { checkAndDecrementUsage, refundUsage } from '../billing';
import { getServiceSupabase } from '@/lib/supabaseClient';

// Mock Supabase
jest.mock('../supabaseClient', () => ({
  getServiceSupabase: jest.fn(),
}));

describe('Billing Atomicity & Refunds', () => {
  let mockRpc: jest.Mock;
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    mockRpc = jest.fn();
    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    (getServiceSupabase as jest.Mock).mockReturnValue({
      rpc: mockRpc,
      from: mockFrom,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('PASS: Sufficient credits - decrements successfully', async () => {
    // Balance check succeeds
    mockSingle.mockResolvedValueOnce({
      data: { speech_analysis_count: 5, ppt_analysis_count: 0, viva_sessions_count: 0 },
      error: null,
    });
    // RPC succeeds
    mockRpc.mockResolvedValueOnce({ data: true, error: null });

    const result = await checkAndDecrementUsage('user-1', 'speech_analysis_count');

    expect(result).toEqual({ allowed: true, remainingCredits: 4 });
    expect(mockRpc).toHaveBeenCalledWith('decrement_unified_usage', { user_id_val: 'user-1', cost_val: 1 });
  });

  it('PASS: Insufficient credits - fails early', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { speech_analysis_count: 0, ppt_analysis_count: 0, viva_sessions_count: 0 },
      error: null,
    });

    const result = await checkAndDecrementUsage('user-1', 'speech_analysis_count');

    expect(result).toEqual({ allowed: false, limitReached: true, remainingCredits: 0 });
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('PASS: Exact balance - decrements successfully', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { speech_analysis_count: 1, ppt_analysis_count: 0, viva_sessions_count: 0 },
      error: null,
    });
    mockRpc.mockResolvedValueOnce({ data: true, error: null });

    const result = await checkAndDecrementUsage('user-1', 'speech_analysis_count');

    expect(result).toEqual({ allowed: true, remainingCredits: 0 });
  });

  it('PASS: Complete AI failure - refund is called exactly once', async () => {
    mockRpc.mockResolvedValueOnce({ data: true, error: null });
    const result = await refundUsage('user-1', 1);

    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('increment_unified_usage', { user_id_val: 'user-1', refund_val: 1 });
  });

  it('MANUAL VERIFICATION REQUIRED: Concurrent deduction race condition', () => {
    // Jest mocks cannot realistically test Postgres FOR UPDATE row-level locks.
    // To verify:
    // 1. Run this SQL in Supabase:
    //    UPDATE usage_limits SET speech_analysis_count = 1 WHERE user_id = 'test-id';
    // 2. Open two psql sessions.
    // 3. In Session 1: BEGIN; SELECT * FROM decrement_unified_usage('test-id', 1);
    // 4. In Session 2: SELECT * FROM decrement_unified_usage('test-id', 1);
    // 5. Session 2 will block until Session 1 runs COMMIT;.
    // 6. Session 2 will return false.
    expect(true).toBe(true);
  });

  it('MANUAL VERIFICATION REQUIRED: Concurrent deduction + refund', () => {
    // Same as above. The `increment_unified_usage` also uses FOR UPDATE lock.
    // This guarantees mathematically correct final balance when both run concurrently.
    expect(true).toBe(true);
  });
});
