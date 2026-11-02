import { after, NextResponse } from "next/server";
import { clientIp, countryCode, recordAppEvent, trackedDestination, utmFrom } from "@/lib/analytics";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const admin = supabaseAdmin();

  const { data: app } = await admin
    .from("apps")
    .select("id,status,website_url,repo_url,uploader_id")
    .eq("id", id)
    .maybeSingle();

  if (!app || app.status !== "published") {
    return NextResponse.redirect(new URL("/apps", url), 302);
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
    return NextResponse.redirect(new URL(`/apps/${id}`, url), 302);
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

  return NextResponse.redirect(destination, 302);
}
