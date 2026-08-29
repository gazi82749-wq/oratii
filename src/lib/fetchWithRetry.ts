// src/lib/fetchWithRetry.ts

/**
 * A wrapper around the native fetch API that automatically retries the request
 * using exponential backoff if it encounters transient errors (like 429 Too Many Requests or 5xx Server Errors).
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 5,
  baseDelayMs: number = 2000
): Promise<Response> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, options);

      // If the response is successful, or it's a client error (400-499) that is NOT a rate limit (429),
      // we return the response immediately. We do not retry bad requests because they will always fail.
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }

      // If we reach here, it's either a 429 (Rate Limit) or a 5xx (Server Error).
      if (attempt >= maxRetries) {
        // We've exhausted all retries, return the last response.
        return response;
      }
      
      console.warn(`[API Retry] Request to ${url} failed with status ${response.status}. Retrying (Attempt ${attempt + 1}/${maxRetries})...`);
    } catch (error: unknown) {
      // This catches network-level errors (e.g. DNS failure, connection refused)
      if (attempt >= maxRetries) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[API Retry] Network error connecting to ${url}: ${message}. Retrying (Attempt ${attempt + 1}/${maxRetries})...`);
    }

    // Exponential backoff with Jitter: (baseDelayMs * 2^attempt) + random(0, 1000)ms
    // This prevents multiple concurrent requests from retrying at the exact same millisecond
    const delay = (baseDelayMs * Math.pow(2, attempt)) + Math.random() * 1000;
    console.log(`[API Retry] Waiting ${Math.round(delay)}ms before next attempt...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    attempt++;
  }

  // This should never be reached, but TypeScript requires a return
  throw new Error(`fetchWithRetry: exhausted all retries for ${url}`);
}
