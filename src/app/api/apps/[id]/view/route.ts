import { after, NextResponse } from "next/server";
import { clientIp, countryCode, recordAppEvent } from "@/lib/analytics";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RATE_LIMITS, rateLimit, requestIp } from "@/lib/rate-limit";
import { parseJson, readBody, tooManyRequests } from "@/lib/http";

export const maxDuration = 10;

const MAX_BODY_BYTES = 4 * 1024;
const NO_STORE = { "Cache-Control": "no-store" };

function noContent() {
  return new NextResponse(null, { status: 204, headers: NO_STORE });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = rateLimit(`view:${requestIp(req.headers)}`, RATE_LIMITS.view);
  if (!limited.ok) return tooManyRequests(limited);

  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: app } = await admin
    .from("apps")
    .select("id,status,uploader_id")
    .eq("id", id)
    .maybeSingle();

  if (!app || app.status !== "published") return noContent();

  const dnt =
    req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1";
  if (dnt) return noContent();

  const user = await getUser();
  if (user?.id === app.uploader_id) return noContent();

  const raw = await readBody(req, MAX_BODY_BYTES);
  const body = raw ? parseJson<{ referrer?: unknown; search?: unknown }>(raw) : null;

  const headers = new Headers(req.headers);
  after(() =>
    recordAppEvent({
      appId: id,
      kind: "view",
      ip: clientIp(headers),
      userAgent: headers.get("user-agent"),
      referrer:
        typeof body?.referrer === "string" ? body.referrer.slice(0, 1000) : null,
      search: typeof body?.search === "string" ? body.search.slice(0, 500) : "",
      country: countryCode(headers.get("x-vercel-ip-country")),
    })
  );

  return noContent();
}
