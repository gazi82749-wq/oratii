// src/lib/fetchWithRetry.ts

/**
 * A wrapper around the native fetch API that automatically retries the request
 * using exponential backoff if it encounters transient errors (like 429 Too Many Requests or 5xx Server Errors).
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 2,
  baseDelayMs: number = 1000,
  timeoutMs: number = 25000
): Promise<Response> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      let fetchOptions = { ...options };

      // Attach timeout controller if signal is not explicitly passed
      if (!fetchOptions.signal && typeof AbortController !== 'undefined') {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller?.abort(), timeoutMs);
        fetchOptions.signal = controller.signal;
      }

      const response = await fetch(url, fetchOptions);
      if (timeoutId) clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Non-transient client errors (like 400, 401, 403) should NOT be retried
      // Throw immediately to abort both the retry loop AND the fallback chain.
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const errText = await response.text().catch(() => '');
        const error = new Error(`Non-transient error ${response.status}: ${errText}`);
        (error as any).status = response.status;
        (error as any).isNonTransient = true;
        throw error;
      }

      // If we got here, it's a 429, 408, or 5xx error. We should retry.
      if (attempt >= maxRetries) {
        // If max retries reached, return the failed response so the caller handles it
        return response;
      }

      console.warn(`[API Retry] Request to ${url} failed with status ${response.status}. Retrying (${attempt + 1}/${maxRetries})...`);
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      
      // If it's a non-transient error we explicitly threw, bubble it up immediately
      if (error.isNonTransient) {
        throw error;
      }

      if (attempt >= maxRetries) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[API Retry] Network error or timeout connecting to ${url}: ${message}. Retrying (${attempt + 1}/${maxRetries})...`);
    }

    // Exponential backoff with Jitter capped at 3000ms max per delay
    const calculatedDelay = Math.min(3000, (baseDelayMs * Math.pow(2, attempt)) + Math.random() * 500);
    await new Promise(resolve => setTimeout(resolve, calculatedDelay));

    attempt++;
  }

  throw new Error(`fetchWithRetry: exhausted all retries for ${url}`);
}
