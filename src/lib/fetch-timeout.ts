type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

/**
 * `fetch` with a hard timeout. A slow upstream must not pin a serverless
 * invocation until the platform kills it.
 */
export function fetchWithTimeout(
  input: FetchInput,
  init: FetchInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1_000, timeoutMs));

  const outer = init?.signal;
  const onAbort = () => controller.abort();
  if (outer) {
    if (outer.aborted) controller.abort();
    else outer.addEventListener("abort", onAbort, { once: true });
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
    if (outer) outer.removeEventListener("abort", onAbort);
  });
}

export function createTimeoutFetch(timeoutMs: number) {
  return (input: FetchInput, init?: FetchInit) =>
    fetchWithTimeout(input, init, timeoutMs);
}
