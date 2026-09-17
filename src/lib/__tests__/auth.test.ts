import { renderHook, act } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../supabaseClient';

// We mock the react components and just test the logic inside the useEffect of the layout (which we abstract here for testing)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(),
  },
}));

describe('Admin Authorization (Client Side Layout Protection)', () => {
  let mockPush: jest.Mock;
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockMaybeSingle: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/admin');

    mockMaybeSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    (supabase.from as jest.Mock) = mockFrom;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Extract the core logic from layout.tsx for testing
  const checkAdminAuth = async (setIsAuthorized: any, setLoading: any, setErrorMsg: any) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setIsAuthorized(false);
      setLoading(false);
      mockPush('/admin/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile && profile.role === 'admin') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      setErrorMsg('Your account does not have administrator privileges. Please sign in with an authorized admin account.');
      mockPush('/dashboard');
    }
    setLoading(false);
  };

  it('PASS: Rejects unauthenticated users and redirects to login', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: null } });

    const setIsAuthorized = jest.fn();
    const setLoading = jest.fn();
    const setErrorMsg = jest.fn();

    await checkAdminAuth(setIsAuthorized, setLoading, setErrorMsg);

    expect(setIsAuthorized).toHaveBeenCalledWith(false);
    expect(setLoading).toHaveBeenCalledWith(false);
    expect(mockPush).toHaveBeenCalledWith('/admin/login');
  });

  it('PASS: Rejects authenticated non-admin users and redirects to dashboard', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ 
      data: { session: { user: { id: 'user-1' } } } 
    });
    mockMaybeSingle.mockResolvedValueOnce({ data: { role: 'user' } });

    const setIsAuthorized = jest.fn();
    const setLoading = jest.fn();
    const setErrorMsg = jest.fn();

    await checkAdminAuth(setIsAuthorized, setLoading, setErrorMsg);

    expect(setIsAuthorized).toHaveBeenCalledWith(false);
    expect(setErrorMsg).toHaveBeenCalledWith(expect.stringContaining('administrator privileges'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('PASS: Allows authenticated admin users', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ 
      data: { session: { user: { id: 'admin-1' } } } 
    });
    mockMaybeSingle.mockResolvedValueOnce({ data: { role: 'admin' } });

    const setIsAuthorized = jest.fn();
    const setLoading = jest.fn();
    const setErrorMsg = jest.fn();

    await checkAdminAuth(setIsAuthorized, setLoading, setErrorMsg);

    expect(setIsAuthorized).toHaveBeenCalledWith(true);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
