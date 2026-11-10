/**
 * Small in-process fixed-window rate limiter.
 *
 * This is deliberately dependency-free: it protects a single Node/Vercel
 * instance from abusive bursts without adding a network hop to every request.
 * It is best-effort, not a billing or security boundary. On a multi-instance
 * deployment each instance keeps its own counters; when a shared limiter is
 * required, swap the `rateLimit` body for Upstash/Vercel KV and keep the API.
 */
export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = Number(process.env.RATE_LIMIT_MAX_KEYS ?? 5000);
let calls = 0;

/** Prefer the platform-set real IP, then the first forwarded hop. */
export function requestIp(headers: Headers): string {
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const limit = Math.max(1, options.limit);
  const windowMs = Math.max(1_000, options.windowMs);

  calls += 1;
  if (calls % 256 === 0 || buckets.size >= MAX_KEYS) sweep(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_KEYS && !buckets.has(key)) {
      // Still full after sweeping: evict the oldest key so memory stays bounded.
      const oldest = buckets.keys().next().value;
      if (oldest) buckets.delete(oldest);
    }
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfterSec: 0,
  };
}

/** Shared budgets for routes that create rows, call Paystack, or emit events. */
export const RATE_LIMITS = {
  checkout: { limit: 10, windowMs: 10 * 60_000 },
  view: { limit: 120, windowMs: 60_000 },
  click: { limit: 120, windowMs: 60_000 },
  download: { limit: 60, windowMs: 60_000 },
  webhook: { limit: 300, windowMs: 60_000 },
  authCallback: { limit: 30, windowMs: 60_000 },
  export: { limit: 10, windowMs: 60_000 },
} as const;
