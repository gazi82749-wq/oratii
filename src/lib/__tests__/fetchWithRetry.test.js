import { fetchWithRetry } from '../fetchWithRetry';

// Mock the global fetch function
global.fetch = jest.fn();

describe('fetchWithRetry', () => {
  beforeEach(() => {
    // Clear mock counts and implementations before each test
    global.fetch.mockClear();
  });

  it('should return immediately on a successful response', async () => {
    const mockSuccessResponse = { ok: true, status: 200, json: async () => ({ data: 'test' }) };
    global.fetch.mockResolvedValueOnce(mockSuccessResponse);

    const response = await fetchWithRetry('https://example.com/api', {}, 3, 100);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(response).toBe(mockSuccessResponse);
  });

  it('should throw immediately on a 400 Bad Request', async () => {
    const mockBadRequestResponse = { 
      ok: false, 
      status: 400, 
      text: async () => 'Bad Request' 
    };
    global.fetch.mockResolvedValueOnce(mockBadRequestResponse);

    await expect(fetchWithRetry('https://example.com/api', {}, 3, 100))
      .rejects.toThrow('Non-transient error 400: Bad Request');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on a 429 Too Many Requests and succeed', async () => {
    const mockRateLimitResponse = { ok: false, status: 429 };
    const mockSuccessResponse = { ok: true, status: 200 };
    
    // Fail first time, succeed second time
    global.fetch
      .mockResolvedValueOnce(mockRateLimitResponse)
      .mockResolvedValueOnce(mockSuccessResponse);

    const response = await fetchWithRetry('https://example.com/api', {}, 3, 100);

    // It should have called fetch exactly twice
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(response).toBe(mockSuccessResponse);
  });

  it('should retry up to maxRetries on 500 Server Error and return last response if still failing', async () => {
    const mockServerError = { ok: false, status: 500 };
    
    // Always fail
    global.fetch.mockResolvedValue(mockServerError);

    // Using a very short delay (10ms) to make tests fast
    const response = await fetchWithRetry('https://example.com/api', {}, 2, 10);

    // initial attempt + 2 retries = 3 total attempts
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(response).toBe(mockServerError);
  });

  it('should retry on network errors (exceptions) and throw if max retries exceeded', async () => {
    const networkError = new Error('Failed to fetch');
    
    // Always throw
    global.fetch.mockRejectedValue(networkError);

    await expect(fetchWithRetry('https://example.com/api', {}, 2, 10))
      .rejects.toThrow('Failed to fetch');

    // initial attempt + 2 retries = 3 total attempts
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
