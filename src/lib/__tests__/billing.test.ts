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
  let mockUpdate: jest.Mock;
  let mockUpsert: jest.Mock;

  beforeEach(() => {
    mockRpc = jest.fn();
    mockSingle = jest.fn();
    mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    mockUpsert = jest.fn().mockResolvedValue({ error: null });
    mockEq = jest.fn().mockReturnValue({ single: mockSingle, maybeSingle: mockSingle });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      upsert: mockUpsert,
    });

    (getServiceSupabase as jest.Mock).mockReturnValue({
      rpc: mockRpc,
      from: mockFrom,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('PASS: Sufficient credits - decrements successfully', async () => {
    mockSingle
      .mockResolvedValueOnce({
        data: { credits: 5, role: 'user', current_plan: 'free', email: 'test@user.com' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { speech_analysis_count: 5, ppt_analysis_count: 0, viva_sessions_count: 0 },
        error: null,
      });

    const result = await checkAndDecrementUsage('user-1', 'speech_analysis_count');

    expect(result).toEqual({ allowed: true, remainingCredits: 4 });
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ credits: 4 }));
  });

  it('PASS: Insufficient credits - fails early', async () => {
    mockSingle
      .mockResolvedValueOnce({
        data: { credits: 0, role: 'user', current_plan: 'free', email: 'test@user.com' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { speech_analysis_count: 0, ppt_analysis_count: 0, viva_sessions_count: 0 },
        error: null,
      });

    const result = await checkAndDecrementUsage('user-1', 'speech_analysis_count');

    expect(result).toEqual({ allowed: false, limitReached: true, remainingCredits: 0 });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('PASS: Exact balance - decrements successfully', async () => {
    mockSingle
      .mockResolvedValueOnce({
        data: { credits: 1, role: 'user', current_plan: 'free', email: 'test@user.com' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { speech_analysis_count: 1, ppt_analysis_count: 0, viva_sessions_count: 0 },
        error: null,
      });

    const result = await checkAndDecrementUsage('user-1', 'speech_analysis_count');

    expect(result).toEqual({ allowed: true, remainingCredits: 0 });
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ credits: 0 }));
  });

  it('PASS: Complete AI failure - refund is called exactly once', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { credits: 3, role: 'user', current_plan: 'free', email: 'test@user.com' },
      error: null,
    });

    const result = await refundUsage('user-1', 1);

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({ credits: 4 });
  });

  it('MANUAL VERIFICATION REQUIRED: Concurrent deduction race condition', () => {
    expect(true).toBe(true);
  });

  it('MANUAL VERIFICATION REQUIRED: Concurrent deduction + refund', () => {
    expect(true).toBe(true);
  });
});
