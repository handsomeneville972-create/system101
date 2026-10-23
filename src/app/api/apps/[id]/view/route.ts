import { after, NextResponse } from "next/server";
import { clientIp, countryCode, recordAppEvent } from "@/lib/analytics";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = supabaseAdmin();

  const { data: app } = await admin
    .from("apps")
    .select("id,status,uploader_id")
    .eq("id", id)
    .maybeSingle();

  if (!app || app.status !== "published") {
    return new NextResponse(null, { status: 204 });
  }

  const dnt =
    req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1";
  if (dnt) return new NextResponse(null, { status: 204 });

  const user = await getUser();
  if (user?.id === app.uploader_id) {
    return new NextResponse(null, { status: 204 });
  }

  const body = (await req.json().catch(() => null)) as
    | { referrer?: unknown; search?: unknown }
    | null;

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

  return new NextResponse(null, { status: 204 });
}
