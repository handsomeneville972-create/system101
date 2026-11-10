import { after, NextResponse } from "next/server";
import { clientIp, countryCode, recordAppEvent, trackedDestination, utmFrom } from "@/lib/analytics";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RATE_LIMITS, rateLimit, requestIp } from "@/lib/rate-limit";

export const maxDuration = 15;

const NO_STORE = { "Cache-Control": "no-store" };

function redirect(url: URL) {
  return NextResponse.redirect(url, { status: 302, headers: NO_STORE });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = rateLimit(`click:${requestIp(req.headers)}`, RATE_LIMITS.click);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(limited.retryAfterSec),
          ...NO_STORE,
        },
      }
    );
  }

  const { id } = await params;
  const url = new URL(req.url);
  const admin = supabaseAdmin();

  const { data: app } = await admin
    .from("apps")
    .select("id,status,website_url,repo_url,uploader_id")
    .eq("id", id)
    .maybeSingle();

  if (!app || app.status !== "published") {
    return redirect(new URL("/apps", url));
  }

  const wantRepo = url.searchParams.get("target") === "repo";
  let target: "website" | "repo" = "website";
  let raw = (app.website_url as string | null) ?? null;

  if (wantRepo && app.repo_url) {
    target = "repo";
    raw = app.repo_url as string;
  } else if (!raw && app.repo_url) {
    target = "repo";
    raw = app.repo_url as string;
  }

  const utm = utmFrom(url.search);
  const destination = trackedDestination(raw, utm.utm_campaign);
  if (!destination) {
    return redirect(new URL(`/apps/${id}`, url));
  }

  const user = await getUser();
  const dnt =
    req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1";

  if (!dnt && user?.id !== app.uploader_id) {
    const headers = new Headers(req.headers);
    after(() =>
      recordAppEvent({
        appId: id,
        kind: "click",
        target,
        ip: clientIp(headers),
        userAgent: headers.get("user-agent"),
        referrer: headers.get("referer"),
        search: url.search,
        country: countryCode(headers.get("x-vercel-ip-country")),
      })
    );
  }

  return redirect(new URL(destination));
}
