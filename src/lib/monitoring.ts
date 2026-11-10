const SLOW_MS = Number(process.env.SLOW_LOG_MS ?? 1500);

/** Structured slow-path log; Vercel and most log drains parse JSON lines. */
export function logSlow(
  label: string,
  startedAt: number,
  meta?: Record<string, unknown>
): number {
  const ms = Math.round(performance.now() - startedAt);
  if (ms >= SLOW_MS) {
    console.warn(JSON.stringify({ level: "warn", event: "slow", label, ms, ...meta }));
  }
  return ms;
}

export function logRateLimited(scope: string, retryAfterSec: number) {
  console.warn(
    JSON.stringify({ level: "warn", event: "rate_limited", scope, retryAfterSec })
  );
}
