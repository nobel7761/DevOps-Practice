/**
 * Retries a transient-failure-prone async call a few times with a growing
 * delay. OpenAI calls in this pipeline run sequentially, dozens of times per
 * video (one per audio chunk) — without this, a single network blip (seen
 * repeatedly in practice as "Connection error." mid-run) kills the entire
 * run and loses all prior progress for that video.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const delayMs = options.delayMs ?? 1000;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}
