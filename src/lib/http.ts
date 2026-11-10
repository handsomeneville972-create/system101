import { NextResponse } from "next/server";
import type { RateLimitResult } from "@/lib/rate-limit";

export function tooManyRequests(result: RateLimitResult) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSec),
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * Reads a request body while refusing oversized payloads. `content-length` is
 * checked first so an announced huge body is rejected without buffering it.
 */
export async function readBody(req: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) return null;

  const body = await req.text();
  return Buffer.byteLength(body, "utf8") > maxBytes ? null : body;
}

export function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
