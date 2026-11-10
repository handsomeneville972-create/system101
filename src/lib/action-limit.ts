import { headers } from "next/headers";
import { rateLimit, requestIp, type RateLimitOptions } from "@/lib/rate-limit";
import { logRateLimited } from "@/lib/monitoring";

/**
 * Server-action rate limit. Keyed by user id when signed in, otherwise by the
 * request IP. Returns a user-facing error string when the budget is spent.
 */
export async function actionRateLimit(
  action: string,
  userId: string | null,
  options: RateLimitOptions
): Promise<string | null> {
  const requestHeaders = await headers();
  const identity = userId ?? requestIp(requestHeaders);
  const result = rateLimit(`${action}:${identity}`, options);

  if (result.ok) return null;
  logRateLimited(action, result.retryAfterSec);
  return "Too many attempts. Try again in a moment.";
}
