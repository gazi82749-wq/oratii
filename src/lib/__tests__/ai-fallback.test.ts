import { generateAIContent } from '../aiFallback';
import { fetchWithRetry } from '../fetchWithRetry';

// Mock fetchWithRetry
jest.mock('../fetchWithRetry', () => ({
  fetchWithRetry: jest.fn(),
}));

describe('AI Fallback Waterfall', () => {
  beforeEach(() => {
    (fetchWithRetry as jest.Mock).mockClear();
    // Provide dummy API keys so fallback sequence is enabled
    process.env.GROQ_API_KEY = 'groq';
    process.env.CEREBRAS_API_KEY = 'cerebras';
    process.env.GEMINI_API_KEY = 'gemini';
    process.env.OPENROUTER_API_KEY = 'openrouter';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('PASS: Uses primary provider if successful', async () => {
    (fetchWithRetry as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Primary success' } }] }),
    });

    const result = await generateAIContent({ systemPrompt: 'Sys', userPrompt: 'User' });
    
    expect(result).toBe('Primary success');
    // Only 1 provider called
    expect(fetchWithRetry).toHaveBeenCalledTimes(1);
  });

  it('PASS: Aborts waterfall on 401/403 (Non-transient errors)', async () => {
    const error = new Error('Non-transient error 401: Unauthorized');
    (error as any).status = 401; // Simulating the status added by fetchWithRetry
    (fetchWithRetry as jest.Mock).mockRejectedValueOnce(error);

    await expect(generateAIContent({ systemPrompt: 'Sys', userPrompt: 'User' }))
      .rejects.toThrow('Non-transient error 401: Unauthorized');
    
    // Only 1 provider called because 401 aborts waterfall
    expect(fetchWithRetry).toHaveBeenCalledTimes(1);
  });

  it('PASS: Falls back to next provider on 500 Server Error', async () => {
    const transientError = new Error('Server Error');
    (fetchWithRetry as jest.Mock).mockRejectedValue(transientError);

    const result = await generateAIContent({ systemPrompt: 'Sys', userPrompt: 'User' });
    expect(result).toContain('"fallbackTriggered":true');
  });

  it('PASS: Bounded retry - throws or returns offline fallback after all providers fail', async () => {
    const transientError = new Error('Server Error');
    (fetchWithRetry as jest.Mock).mockRejectedValue(transientError);

    const result = await generateAIContent({ systemPrompt: 'Sys', userPrompt: 'User' });
    expect(result).toContain('"fallbackTriggered":true');
    // It returns the offline json fallback, so we expect it to succeed without throwing, but have the flag set
  });
});
